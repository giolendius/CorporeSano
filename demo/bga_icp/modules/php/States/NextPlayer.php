<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\StateType;
use Bga\Games\InCorporeSano\AbstractPlayerTurn;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\BodySystem;

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

        $nextSystem = $this->game->getPlayerSystem((int) $nextPlayerId);

        // A new round begins when play wraps back to the Circolatorio (first system):
        // run the start-of-round upkeep before the heart plays.
        if ($nextSystem === BodySystem::Circulatory) {
            return TurnStart::class;
        }

        return AbstractPlayerTurn::stateFor($nextSystem);
    }
}