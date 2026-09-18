<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\States;

use Bga\GameFramework\States\PossibleAction;
use Bga\Games\InCorporeSano\AbstractPlayerTurn;
use Bga\Games\InCorporeSano\Game;
use Bga\Games\InCorporeSano\Systems\BodySystem;

class NervosoTurn extends AbstractPlayerTurn
{
    function __construct(Game $game)
    {
        parent::__construct($game, id: 13);
    }

    protected function system(): BodySystem
    {
        return BodySystem::Nervous;
    }

    #[PossibleAction]
    public function actAzione(int $actionId, int $activePlayerId, array $args)
    {
        return $this->doAzione($actionId, $activePlayerId, $args);
    }
}
