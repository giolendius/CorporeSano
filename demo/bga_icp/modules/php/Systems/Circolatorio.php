<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Circolatorio extends Apparato
{
    public function getSystem(): BodySystem { return BodySystem::Circulatory; }
    public function getLabel(): string { return clienttranslate('Circolatorio'); }

    /** Starts with 2 O2 (rules: "Dare 2 O2 all'apparato circolatorio"). */
    public function getInitialResources(): array
    {
        return ['o2' => 2];
    }

    public function getActions(): array
    {
        return [
            ['id' => 0, 'label' => clienttranslate('Muovi sangue (base)'),  'cost' => 0],
            ['id' => 1, 'label' => clienttranslate('Muovi sangue (medio)'), 'cost' => 1],
            ['id' => 2, 'label' => clienttranslate('Muovi sangue (forte)'), 'cost' => 2],
        ];
    }

    public function azione(int $actionId): void
    {
        // Placeholder: all actions gain +1 O2 for now
        $this->game->incPlayerResource($this->playerId, 'o2', 1);
    }
}
