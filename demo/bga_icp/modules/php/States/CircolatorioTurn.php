<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\Actions\Types\JsonParam;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\InCorporeSano\AbstractPlayerTurn;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\Apparato;
use Bga\Games\InCorporeSano\Systems\BodySystem;
use Bga\Games\InCorporeSano\Systems\CirBoard;

class CircolatorioTurn extends AbstractPlayerTurn
{
    function __construct(Game $game)
    {
        parent::__construct($game, id: 10);
    }

    protected function system(): BodySystem
    {
        return BodySystem::Circulatory;
    }

    #[PossibleAction]
    public function actAzione(int $actionId, int $activePlayerId, array $args)
    {
        [$successorPlayerId, $successorResources] = $this->chargeSuccessor($actionId, $args);

        $actionData = Apparato::create($this->game, $activePlayerId, $this->system())->azione($actionId);

        // Notify the client to start the client-side movement phase; boats are saved
        // only when actConfirmMovimento is called. Stay in this state meanwhile.
        $this->notify->all('cir_start_movement', '', [
            'player_id'           => $activePlayerId,
            'movements'           => $actionData['movements'],
            'target'              => $actionData['target'],
            'boats'               => CirBoard::getBoats($this->game, $activePlayerId),
            'graph'               => CirBoard::PATHS,
            'lung_o2'             => CirBoard::getLungO2($this->game, $activePlayerId),
            'successor_player_id' => $successorPlayerId,
            'successor_resources' => $successorResources,
        ]);
    }

    /**
     * Called after the Circolatorio player finishes moving boats on the client.
     * Receives final boat positions plus O2 loading/unloading deltas.
     */
    #[PossibleAction]
    public function actConfirmMovimento(
        #[JsonParam] array $finalBoats,
        int $lungSxUsed,
        int $lungDxUsed,
        int $reserveO2Gained,
        int $activePlayerId,
        array $args
    ) {
        $current = CirBoard::getLungO2($this->game, $activePlayerId);

        if ($lungSxUsed < 0 || $lungSxUsed > $current['sx']) throw new \Bga\GameFramework\UserException('Invalid lung_sx_used');
        if ($lungDxUsed < 0 || $lungDxUsed > $current['dx']) throw new \Bga\GameFramework\UserException('Invalid lung_dx_used');
        if ($reserveO2Gained < 0) throw new \Bga\GameFramework\UserException('Invalid reserve_o2_gained');
        foreach ($finalBoats as $b) {
            $total = (int)($b['o2'] ?? 0) + (int)($b['co2'] ?? 0) + (int)($b['wb'] ?? 0);
            if ($total > CirBoard::BOAT_CAPACITY) throw new \Bga\GameFramework\UserException('Boat over capacity');
        }

        CirBoard::saveBoats($this->game, $activePlayerId, $finalBoats);
        CirBoard::saveLungO2(
            $this->game, $activePlayerId,
            $current['sx'] - $lungSxUsed,
            $current['dx'] - $lungDxUsed
        );
        if ($reserveO2Gained > 0) {
            $this->game->incPlayerResource($activePlayerId, 'o2', $reserveO2Gained);
        }

        $this->notify->all('cir_boats_updated', clienttranslate('${player_name} moves the blood'), [
            'player_id'   => $activePlayerId,
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'boats'       => $finalBoats,
        ]);

        return NextPlayer::class;
    }

    public function zombie(int $playerId)
    {
        $boats = CirBoard::getBoats($this->game, $playerId);
        return $this->actConfirmMovimento($boats, 0, 0, 0, $playerId, $this->getArgs($playerId));
    }
}
