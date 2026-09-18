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
            'successor_player_id' => $successorPlayerId,
            'successor_resources' => $successorResources,
        ]);
    }

    /**
     * Called after the Circolatorio player finishes moving boats on the client.
     * Receives and persists the final boat positions.
     */
    #[PossibleAction]
    public function actConfirmMovimento(#[JsonParam] array $finalBoats, int $activePlayerId, array $args)
    {
        // Client-side moves are trusted for now (full BFS validation via CirBoard::validateMoves later).
        CirBoard::saveBoats($this->game, $activePlayerId, $finalBoats);

        $this->notify->all('cir_boats_updated', clienttranslate('${player_name} moves the blood'), [
            'player_id'   => $activePlayerId,
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'boats'       => $finalBoats,
        ]);

        return NextPlayer::class;
    }

    public function zombie(int $playerId)
    {
        // Confirm with unchanged boat positions.
        $boats = CirBoard::getBoats($this->game, $playerId);
        return $this->actConfirmMovimento($boats, $playerId, $this->getArgs($playerId));
    }
}
