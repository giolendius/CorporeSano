<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\Apparato;

class PlayerTurn extends GameState
{
    function __construct(
        protected Game $game,
    ) {
        parent::__construct($game,
            id: 10,
            type: StateType::ACTIVE_PLAYER,
        );
    }

    /**
     * Returns the active player's system, available actions, and successor resource total.
     * Actions are marked available/unavailable based on the successor's current resources.
     */
    public function getArgs(int $activePlayerId): array
    {
        $system = $this->game->getPlayerSystem($activePlayerId);

        // Guard: player_system not set (game started before DB migration, needs restart).
        if ($system === null) {
            return ['system' => '', 'successorSystem' => '', 'successorResources' => 0, 'actions' => []];
        }
        $successor = $system->successor();
        $successorPlayerId = $this->game->getPlayerBySystem($successor);
        $successorResources = $this->game->getPlayerResources($successorPlayerId);
        $successorTotal = array_sum($successorResources);

        $apparato = Apparato::create($this->game, $activePlayerId, $system);
        $actions  = array_map(
            fn($a) => array_merge($a, ['available' => $a['cost'] <= $successorTotal]),
            $apparato->getActions()
        );

        return [
            'system'             => $system->value,
            'successorSystem'    => $successor->value,
            'successorResources' => $successorTotal,
            'actions'            => $actions,
        ];
    }

    /**
     * Execute the chosen action.
     * Validates availability, deducts cost from the successor, then runs the system's effect.
     */
    #[PossibleAction]
    public function actAzione(int $actionId, int $activePlayerId, array $args)
    {
        $matching = array_filter($args['actions'], fn($a) => $a['id'] === $actionId);
        if (empty($matching)) {
            throw new UserException('Unknown action');
        }
        $action = current($matching);
        if (!$action['available']) {
            throw new UserException('Action not available: insufficient successor resources');
        }

        $system    = $this->game->getPlayerSystem($activePlayerId);
        $successor = $system->successor();

        // Pay the cost from the successor's resource pool.
        if ($action['cost'] > 0) {
            $successorPlayerId = $this->game->getPlayerBySystem($successor);
            $this->game->deductPlayerResourcesTotal($successorPlayerId, $action['cost']);
        }

        // Execute the system-specific action effect.
        $apparato = Apparato::create($this->game, $activePlayerId, $system);
        $apparato->azione($actionId);

        $this->notify->all('azione', clienttranslate('${player_name} uses ${action_label}'), [
            'player_id'    => $activePlayerId,
            'player_name'  => $this->game->getPlayerNameById($activePlayerId),
            'action_label' => $action['label'],
            'resources'    => $this->game->getPlayerResources($activePlayerId),
        ]);

        return NextPlayer::class;
    }

    /** Zombie: always picks the first available action. */
    function zombie(int $playerId)
    {
        $args = $this->getArgs($playerId);
        $first = current(array_filter($args['actions'], fn($a) => $a['available']));
        return $this->actAzione($first['id'], $playerId, $args);
    }
}
