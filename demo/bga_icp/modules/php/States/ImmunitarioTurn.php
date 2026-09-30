<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\Actions\Types\JsonParam;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\InCorporeSano\AbstractPlayerTurn;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\Apparato;
use Bga\Games\InCorporeSano\Systems\BodySystem;
use Bga\Games\InCorporeSano\Systems\InfectionZones;

class ImmunitarioTurn extends AbstractPlayerTurn
{
    function __construct(Game $game)
    {
        parent::__construct($game, id: 12);
    }

    protected function system(): BodySystem
    {
        return BodySystem::Immune;
    }

    #[PossibleAction]
    public function actAzione(int $actionId, int $activePlayerId, array $args)
    {
        [$successorPlayerId, $successorResources] = $this->chargeSuccessor($actionId, $args);

        $actionData = Apparato::create($this->game, $activePlayerId, $this->system())->azione($actionId);

        // Client runs the battle phase; boats/zones persist only on actConfirmBattaglie.
        $this->notify->all('imm_start_battle', '', [
            'player_id'           => $activePlayerId,
            'battaglie'           => $actionData['battaglie'],
            'zones'               => InfectionZones::getZones($this->game, $activePlayerId),
            'combat'              => InfectionZones::COMBAT,
            'successor_player_id' => $successorPlayerId,
            'successor_resources' => $successorResources,
        ]);
        // Stay in this state — client calls actConfirmBattaglie when done.
    }

    /**
     * Called after the Immunitario finishes its battles on the client. Receives
     * the final zone states; for each zone whose virus was removed (killed), the
     * matching resource is collected. White blood cells are server-authoritative
     * (client cannot change them), so only virus removals are applied.
     */
    #[PossibleAction]
    public function actConfirmBattaglie(#[JsonParam] array $zones, int $activePlayerId, array $args)
    {
        $before = InfectionZones::getZones($this->game, $activePlayerId);
        $submittedById = array_column($zones, null, 'id');

        $finalZones = [];
        foreach ($before as $prev) {
            $id        = $prev['id'];
            $submitted = $submittedById[$id] ?? null;
            $newBacteria = $submitted ? ($submitted['bacteria'] ?? []) : $prev['bacteria'];

            // A kill = one fewer bacterium of a given type than before. Grant the
            // matching resource for each removed bacterium.
            $beforeCounts = InfectionZones::typeCounts($prev);
            $afterCounts  = InfectionZones::typeCounts(['bacteria' => $newBacteria]);
            foreach (InfectionZones::VIRUS_TYPES as $type) {
                $killed = max(0, $beforeCounts[$type] - $afterCounts[$type]);
                if ($killed > 0) {
                    $this->game->incPlayerResource($activePlayerId, 'virus_' . $type, $killed);
                }
            }

            // Keep wb server-side (unchanged by the immune battle in this version).
            $finalZones[] = ['id' => $id, 'bacteria' => array_values($newBacteria), 'wb' => $prev['wb']];
        }

        InfectionZones::saveZones($this->game, $activePlayerId, $finalZones);

        $this->notify->all('imm_bacteria_updated', clienttranslate('${player_name} fights the infection'), [
            'player_id'   => $activePlayerId,
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'zones'       => $finalZones,
            'resources'   => $this->game->getPlayerResources($activePlayerId),
        ]);

        return NextPlayer::class;
    }

    public function zombie(int $playerId)
    {
        // Confirm with unchanged zones (no kills).
        $zones = InfectionZones::getZones($this->game, $playerId);
        return $this->actConfirmBattaglie($zones, $playerId, $this->getArgs($playerId));
    }
}
