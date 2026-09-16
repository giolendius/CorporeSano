<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
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
     * Exposes the active player's body system, so the client can label its single action button.
     */
    public function getArgs(int $activePlayerId): array
    {
        return [
            "system" => $this->game->getPlayerSystem($activePlayerId),
        ];
    }

    /**
     * The single action available to every system for now: run the system's action
     * (which, for the moment, adds 1 to its own `risorsa`).
     */
    #[PossibleAction]
    public function actAzione(int $activePlayerId, array $args)
    {
        $system = Apparato::create($this->game, $activePlayerId, $args['system']);
        $system->azione();

        $this->notify->all("azione", clienttranslate('${player_name} uses their action'), [
            "player_id" => $activePlayerId,
            "player_name" => $this->game->getPlayerNameById($activePlayerId),
            "resources" => $this->game->getPlayerResources($activePlayerId),
        ]);

        return NextPlayer::class;
    }

    /**
     * Called when it is the turn of a player who has quit the game (= "zombie" player).
     * See more about Zombie Mode: https://en.doc.boardgamearena.com/Zombie_Mode
     */
    function zombie(int $playerId) {
        $args = $this->getArgs($playerId);
        return $this->actAzione($playerId, $args);
    }
}