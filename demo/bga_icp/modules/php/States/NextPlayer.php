<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\StateType;
use Bga\Games\InCorporeSano\AbstractPlayerTurn;
use Bga\Games\InCorporeSano\Game;

class NextPlayer extends \Bga\GameFramework\States\GameState
{

    function __construct(
        protected Game $game,
    ) {
        parent::__construct($game,
            id: 90,
            type: StateType::GAME,
            updateGameProgression: true,
        );
    }

    /**
     * Game state action, example content.
     *
     * The onEnteringState method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    function onEnteringState(int $activePlayerId) {

        // Give some extra time to the active player when he completed an action
        $this->game->giveExtraTime($activePlayerId);

        // Advance the natural play order and route to the new active player's turn state.
        $nextPlayerId = $this->game->activeNextPlayer();

        $gameEnd = false; // Here, we would detect if the game is over to make the appropriate transition
        if ($gameEnd) {
            return EndScore::class;
        }

        return AbstractPlayerTurn::stateFor($this->game->getPlayerSystem((int) $nextPlayerId));
    }
}