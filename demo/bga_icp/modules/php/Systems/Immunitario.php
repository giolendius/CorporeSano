<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Immunitario extends Apparato
{
    public function getSystem(): BodySystem { return BodySystem::Immune; }
    public function getLabel(): string { return clienttranslate('Immunitario'); }

    /** Starts with 1 per virus type (rules: "1 virus triangolare, 1 quadrato e 1 circolare"). */
    public function getInitialResources(): array
    {
        return ['virus_triangolare' => 1, 'virus_quadrato' => 1, 'virus_circolare' => 1];
    }

    public function getActions(): array
    {
        return [
            ['id' => 0, 'label' => clienttranslate('Attacca (base)'),  'cost' => 0],
            ['id' => 1, 'label' => clienttranslate('Attacca (medio)'), 'cost' => 1],
            ['id' => 2, 'label' => clienttranslate('Attacca (forte)'), 'cost' => 2],
        ];
    }

    public function azione(int $actionId): void
    {
        // Placeholder: action 0 gains +1 virus_triangolare
        $this->game->incPlayerResource($this->playerId, 'virus_triangolare', 1);
    }
}
