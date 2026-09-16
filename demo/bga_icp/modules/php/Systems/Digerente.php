<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

class Digerente extends Apparato
{
    public function getSystemKey(): string
    {
        return 'digestive';
    }

    public function getLabel(): string
    {
        return clienttranslate('Digestive');
    }
}
