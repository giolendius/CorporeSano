<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Circolatorio extends Apparato
{
    public function getSystemKey(): string
    {
        return 'circulatory';
    }

    public function getLabel(): string
    {
        return clienttranslate('Circulatory');
    }
}
