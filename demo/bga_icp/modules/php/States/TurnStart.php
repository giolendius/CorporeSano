<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\StateType;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\BodySystem;
use Bga\Games\InCorporeSano\Systems\InfectionZones;

/**
 * Round-start upkeep, run once at the beginning of every round — before the
 * Circolatorio (the first system) plays. Pure GAME state: no active player acts
 * here; it applies the start-of-round effects and hands over to CircolatorioTurn.
 *
 * For now it only grows the infection: 2 random bacteria are added to 2 random
 * zones. Other upkeep steps (temperature, lung O2, event card) will land here.
 */
class TurnStart extends \Bga\GameFramework\States\GameState
{
    function __construct(
        protected Game $game,
    ) {
        parent::__construct($game,
            id: 5,
            type: StateType::GAME,
        );
    }

    function onEnteringState()
    {
        $immId = $this->game->getPlayerBySystem(BodySystem::Immune);
        $zones = InfectionZones::addRandomBacteria($this->game, $immId, 2);

        $this->notify->all('zones_bacteria_spawned', clienttranslate('L\'infezione avanza: nuovi batteri comparsi'), [
            'zones' => $zones,
        ]);

        return CircolatorioTurn::class;
    }
}
