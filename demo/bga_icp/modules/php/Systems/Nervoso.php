<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Nervoso extends Apparato
{
    public function getSystemKey(): string
    {
        return 'nervous';
    }

    public function getLabel(): string
    {
        return clienttranslate('Nervous');
    }
}
