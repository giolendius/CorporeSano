<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

/**
 * Each case represents one of the four body systems in the game.
 * The enum is the single source of truth for:
 *   - the DB/client key (raw value)
 *   - the successor in the action-cost ring
 *   - the fixed player colour
 *   - the seating assignment order
 */
enum BodySystem: string
{
    case Circulatory = 'circulatory';
    case Digestive   = 'digestive';
    case Immune      = 'immune';
    case Nervous     = 'nervous';

    /**
     * The system whose resources this system's actions consume.
     * Ring: Circulatory → Digestive → Immune → Nervous → Circulatory
     */
    public function successor(): self
    {
        return match($this) {
            self::Circulatory => self::Digestive,
            self::Digestive   => self::Immune,
            self::Immune      => self::Nervous,
            self::Nervous     => self::Circulatory,
        };
    }

    /** Fixed player colour (HTML hex, no #). Cannot be changed by player preference. */
    public function color(): string
    {
        return match($this) {
            self::Circulatory => 'ff0000', // red
            self::Digestive   => '008000', // green
            self::Immune      => '0000ff', // blue
            self::Nervous     => '808080', // grey
        };
    }

    /** Seating order used in setupNewGame: seat 1 → Circulatory, seat 4 → Nervous. */
    public static function orderedCases(): array
    {
        return [self::Circulatory, self::Digestive, self::Immune, self::Nervous];
    }
}
