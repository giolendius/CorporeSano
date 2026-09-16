<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

use Bga\Games\InCorporeSano\Game;

/**
 * Base class for a body system (apparato) embodied by a player.
 *
 * Each subclass declares its own starting resources and may override its action.
 * This is where the asymmetry between systems lives: adding a system means adding
 * a subclass, with no change to the database schema.
 */
abstract class Apparato
{
    public function __construct(
        protected Game $game,
        protected int $playerId,
    ) {
    }

    /** Stable key stored in the `player_system` column and sent to the client. */
    abstract public function getSystemKey(): string;

    /** Human-readable name shown in the UI. */
    abstract public function getLabel(): string;

    /**
     * Resources this system starts the game with, as key => amount.
     * Override to give a system more (or differently named) resources.
     */
    public function getInitialResources(): array
    {
        return ['risorsa' => 3];
    }

    /**
     * The single action available for now: gain 1 of the system's own resource.
     * Override to give a system a different behaviour.
     */
    public function azione(): void
    {
        $this->game->incPlayerResource($this->playerId, 'risorsa', 1);
    }

    /** System keys in seating order: seat 1 -> circulatory, ... seat 4 -> nervous. */
    public static function orderedKeys(): array
    {
        return ['circulatory', 'digestive', 'immune', 'nervous'];
    }

    /** Build the concrete system for a player from its stored key. */
    public static function create(Game $game, int $playerId, string $systemKey): Apparato
    {
        return match ($systemKey) {
            'circulatory' => new Circolatorio($game, $playerId),
            'digestive' => new Digerente($game, $playerId),
            'immune' => new Immunitario($game, $playerId),
            'nervous' => new Nervoso($game, $playerId),
            default => throw new \InvalidArgumentException("Unknown system key: $systemKey"),
        };
    }
}
