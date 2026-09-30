<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Circolatorio extends Apparato
{
    public function getSystem(): BodySystem { return BodySystem::Circulatory; }
    public function getLabel(): string { return clienttranslate('Circolatorio'); }

    public function getInitialResources(): array
    {
        return ['o2' => 2];
    }

    public function getActions(): array
    {
        return array_map(
            fn($a) => [
                'id'        => $a['id'],
                'label'     => clienttranslate($a['label']),
                'cost'      => $a['cost'],
                'movements' => $a['movements'],
                'target'    => $a['target'],
            ],
            CirBoard::ACTIONS
        );
    }

    /**
     * Returns action parameters so PlayerTurn can send the movement notification.
     * Does NOT write to DB — boats are saved only when actConfirmMovimento is called.
     */
    public function azione(int $actionId): array
    {
        $action = current(array_filter(CirBoard::ACTIONS, fn($a) => $a['id'] === $actionId));
        return [
            'movements' => $action['movements'],
            'target'    => $action['target'],
        ];
    }
}
