<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

use Bga\Games\InCorporeSano\Game;

/**
 * Base class for a body system (apparato) embodied by a player.
 *
 * Subclasses declare their own resources, actions, and action effects.
 * All asymmetry lives here: schema never changes, only subclasses grow.
 */
abstract class Apparato
{
    public function __construct(
        protected Game $game,
        protected int $playerId,
    ) {
    }

    /** The BodySystem enum case this subclass represents. */
    abstract public function getSystem(): BodySystem;

    /** Human-readable label shown in the UI. */
    abstract public function getLabel(): string;

    /**
     * Resources this system starts the game with: key => amount.
     * Override in each subclass — systems are intentionally asymmetric.
     */
    abstract public function getInitialResources(): array;

    /**
     * The three actions available to this system (placeholder costs, overridden per system later).
     * Each entry: ['id' => int, 'label' => string, 'cost' => int]
     * 'cost' is the amount taken from the SUCCESSOR system's resources.
     */
    public function getActions(): array
    {
        return [
            ['id' => 0, 'label' => clienttranslate('Azione 0'), 'cost' => 0],
            ['id' => 1, 'label' => clienttranslate('Azione 1'), 'cost' => 1],
            ['id' => 2, 'label' => clienttranslate('Azione 2'), 'cost' => 2],
        ];
    }

    /**
     * Execute the chosen action. Override per system for real effects.
     * Base: action 0 → +1 to first own resource; actions 1/2 are no-ops for now.
     */
    public function azione(int $actionId): void
    {
        if ($actionId === 0) {
            $resources = $this->game->getPlayerResources($this->playerId);
            $primaryKey = (string) array_key_first($resources);
            $this->game->incPlayerResource($this->playerId, $primaryKey, 1);
        }
    }

    /** Factory: build the concrete Apparato for a player given their BodySystem. */
    public static function create(Game $game, int $playerId, BodySystem $system): Apparato
    {
        return match($system) {
            BodySystem::Circulatory => new Circolatorio($game, $playerId),
            BodySystem::Digestive   => new Digerente($game, $playerId),
            BodySystem::Immune      => new Immunitario($game, $playerId),
            BodySystem::Nervous     => new Nervoso($game, $playerId),
        };
    }
}
