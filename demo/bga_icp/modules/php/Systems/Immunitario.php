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

    /** Each action grants a number of "battles" (like Circolatorio's movements). */
    const ACTIONS = [
        ['id' => 0, 'label' => 'Attacca (base)',  'cost' => 0, 'battaglie' => 1],
        ['id' => 1, 'label' => 'Attacca (medio)', 'cost' => 1, 'battaglie' => 2],
        ['id' => 2, 'label' => 'Attacca (forte)', 'cost' => 2, 'battaglie' => 3],
    ];

    public function getActions(): array
    {
        return array_map(
            fn($a) => [
                'id'        => $a['id'],
                'label'     => clienttranslate($a['label']),
                'cost'      => $a['cost'],
                'battaglie' => $a['battaglie'],
            ],
            self::ACTIONS
        );
    }

    /**
     * Returns the number of battles for the chosen action. Does NOT touch
     * resources — those are collected when bacteria are killed (actConfirmBattaglie).
     */
    public function azione(int $actionId): array
    {
        $action = current(array_filter(self::ACTIONS, fn($a) => $a['id'] === $actionId));
        return ['battaglie' => $action['battaglie']];
    }
}
