<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Nervoso extends Apparato
{
    public function getSystem(): BodySystem { return BodySystem::Nervous; }
    public function getLabel(): string { return clienttranslate('Nervoso'); }

    /** Starts with 3 neurotrasmettitori (rules: "Dare 3 neurotrasmettitori al sistema nervoso"). */
    public function getInitialResources(): array
    {
        return ['neurotrasmettitori' => 3];
    }

    public function getActions(): array
    {
        return [
            ['id' => 0, 'label' => clienttranslate('Mangia'),           'cost' => 0],
            ['id' => 1, 'label' => clienttranslate('Azione cerebrale'), 'cost' => 1],
            ['id' => 2, 'label' => clienttranslate('Azione cerebrale+'),'cost' => 2],
        ];
    }

    public function azione(int $actionId): void
    {
        // Placeholder: action 0 gains +1 neurotrasmettitori
        $this->game->incPlayerResource($this->playerId, 'neurotrasmettitori', 1);
    }
}
