<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Immunitario extends Apparato
{
    public function getSystemKey(): string
    {
        return 'immune';
    }

    public function getLabel(): string
    {
        return clienttranslate('Immune');
    }
}
