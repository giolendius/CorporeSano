<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Digerente extends Apparato
{
    public function getSystem(): BodySystem { return BodySystem::Digestive; }
    public function getLabel(): string { return clienttranslate('Digerente'); }

    /** Starts with 1 proteina, 1 grasso, 1 fibra (rules: "Dare 1 proteina, 1 grasso e 1 fibra"). */
    public function getInitialResources(): array
    {
        return ['proteina' => 1, 'grasso' => 1, 'fibra' => 1];
    }

    public function getActions(): array
    {
        return [
            ['id' => 0, 'label' => clienttranslate('Assorbi (base)'),  'cost' => 0],
            ['id' => 1, 'label' => clienttranslate('Assorbi (medio)'), 'cost' => 1],
            ['id' => 2, 'label' => clienttranslate('Assorbi (forte)'), 'cost' => 2],
        ];
    }

    public function azione(int $actionId): array
    {
        $this->game->incPlayerResource($this->playerId, 'proteina', 1);
        return [];
    }
}
