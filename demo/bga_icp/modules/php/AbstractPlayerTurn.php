<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\UserException;
use Bga\Games\InCorporeSano\States\CircolatorioTurn;
use Bga\Games\InCorporeSano\States\DigerenteTurn;
use Bga\Games\InCorporeSano\States\ImmunitarioTurn;
use Bga\Games\InCorporeSano\States\NervosoTurn;
use Bga\Games\InCorporeSano\States\NextPlayer;
use Bga\Games\InCorporeSano\Systems\Apparato;
use Bga\Games\InCorporeSano\Systems\BodySystem;
use Bga\Games\InCorporeSano\Systems\CirBoard;
use Bga\Games\InCorporeSano\Systems\InfectionZones;

/**
 * Shared logic for every apparato's turn. Each body system has its own concrete
 * ACTIVE_PLAYER state (CircolatorioTurn, DigerenteTurn, ...) so system-specific
 * flow stays separated; the common flow (build args, charge successor, run the
 * action, notify, advance) lives here.
 *
 * IMPORTANT: this base lives OUTSIDE the States/ namespace on purpose. The BGA
 * framework auto-discovers game states by scanning the States namespace and
 * instantiating each class; an abstract class there would fatal ("Cannot
 * instantiate abstract class"). Keeping it in the root namespace hides it from
 * that scan while the concrete subclasses (in States/) remain discoverable.
 *
 * Concrete subclasses declare their own #[PossibleAction] methods (thin wrappers
 * onto the protected helpers below) so the framework's attribute-based action
 * discovery never depends on inheritance.
 */
abstract class AbstractPlayerTurn extends GameState
{
    function __construct(protected Game $game, int $id)
    {
        parent::__construct($game,
            id: $id,
            type: StateType::ACTIVE_PLAYER,
        );
    }

    /** The body system this turn state serves. */
    abstract protected function system(): BodySystem;

    /** Maps a body system to its concrete turn-state class (mirrors Apparato::create). */
    public static function stateFor(BodySystem $system): string
    {
        return match ($system) {
            BodySystem::Circulatory => CircolatorioTurn::class,
            BodySystem::Digestive   => DigerenteTurn::class,
            BodySystem::Immune      => ImmunitarioTurn::class,
            BodySystem::Nervous     => NervosoTurn::class,
        };
    }

    public function getArgs(int $activePlayerId): array
    {
        $system            = $this->system();
        $successor         = $system->successor();
        $successorPlayerId = $this->game->getPlayerBySystem($successor);
        $successorTotal    = array_sum($this->game->getPlayerResources($successorPlayerId));

        $apparato = Apparato::create($this->game, $activePlayerId, $system);
        // Every action is always selectable: per the rules the active system may take
        // however much it wants from its successor ("il ladro può prendere quanto vuole").
        $actions = array_map(
            fn($a) => array_merge($a, ['available' => true]),
            $apparato->getActions()
        );

        // Board state is permanent and visible to every player at all times (not only
        // during that system's own turn): the Circolatorio board (heart + blood boats)
        // and the infection zones (fought by the Immunitario).
        $circulatoryPlayerId = $this->game->getPlayerBySystem(BodySystem::Circulatory);
        $immunePlayerId      = $this->game->getPlayerBySystem(BodySystem::Immune);

        return [
            'system'             => $system->value,
            'successorSystem'    => $successor->value,
            'successorResources' => $successorTotal,
            'actions'            => $actions,
            'boats'              => CirBoard::getBoats($this->game, $circulatoryPlayerId),
            'graph'              => CirBoard::PATHS,
            'lung_o2'            => CirBoard::getLungO2($this->game, $circulatoryPlayerId),
            'zones'              => InfectionZones::getZones($this->game, $immunePlayerId),
        ];
    }

    /**
     * Deduct the action's cost from the successor's pool (if any) and return the
     * successor player id plus its up-to-date resources, so callers can broadcast
     * the change and keep every player's panel in sync.
     *
     * @return array{0:int,1:array<string,int>}
     */
    protected function chargeSuccessor(int $actionId, array $args): array
    {
        $action = $this->requireAction($actionId, $args);

        $successor         = $this->system()->successor();
        $successorPlayerId = $this->game->getPlayerBySystem($successor);

        if ($action['cost'] > 0) {
            $this->game->deductPlayerResourcesTotal($successorPlayerId, $action['cost']);
        }

        return [$successorPlayerId, $this->game->getPlayerResources($successorPlayerId)];
    }

    /** Generic action flow shared by the systems without a minigame. */
    protected function doAzione(int $actionId, int $activePlayerId, array $args): string
    {
        $action = $this->requireAction($actionId, $args);
        [$successorPlayerId, $successorResources] = $this->chargeSuccessor($actionId, $args);

        Apparato::create($this->game, $activePlayerId, $this->system())->azione($actionId);

        $this->notify->all('azione', clienttranslate('${player_name} uses ${action_label}'), [
            'player_id'           => $activePlayerId,
            'player_name'         => $this->game->getPlayerNameById($activePlayerId),
            'action_label'        => $action['label'],
            'resources'           => $this->game->getPlayerResources($activePlayerId),
            'successor_player_id' => $successorPlayerId,
            'successor_resources' => $successorResources,
        ]);

        return NextPlayer::class;
    }

    /** Locate an action in the current args, or throw if the id is unknown. */
    protected function requireAction(int $actionId, array $args): array
    {
        $matching = array_filter($args['actions'], fn($a) => $a['id'] === $actionId);
        if (empty($matching)) {
            throw new UserException('Unknown action');
        }
        return current($matching);
    }

    /** First available action id, used to auto-play a zombie turn. */
    protected function pickZombieActionId(array $args): int
    {
        $first = current(array_filter($args['actions'], fn($a) => $a['available']))
            ?: ($args['actions'][0] ?? null);
        return (int) ($first['id'] ?? 0);
    }

    public function zombie(int $playerId)
    {
        $args = $this->getArgs($playerId);
        return $this->doAzione($this->pickZombieActionId($args), $playerId, $args);
    }
}
