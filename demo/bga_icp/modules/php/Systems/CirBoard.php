<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

use Bga\Games\InCorporeSano\Game;

/**
 * Static configuration and DB helpers for the Circolatorio board.
 * All tunable numbers live here — easy to change without touching game logic.
 */
class CirBoard
{
    // ── Global parameters ───────────────────────────────────────────────────
    const INITIAL_BOATS = 4;
    const BOAT_CAPACITY = 5;   // max (O2 + CO2 + globuli bianchi) per boat
    const LUNG_INITIAL_O2 = 2; // O2 tokens per lung at game start

    private const LUNG_SX_KEY = 'lung_sx_o2';
    private const LUNG_DX_KEY = 'lung_dx_o2';

    // ── Actions ─────────────────────────────────────────────────────────────
    // cost    = cubetti paid from Digerente's resources
    // movements = steps granted per boat (target='one') or per ALL boats (target='all')
    // target  = 'one' (player picks one boat) | 'all' (every boat gets N steps each)
    const ACTIONS = [
        ['id' => 0, 'label' => 'Sopravvivere',  'cost' => 0, 'movements' => 2, 'target' => 'one'],
        ['id' => 1, 'label' => 'Muovi sangue 1', 'cost' => 1, 'movements' => 4, 'target' => 'one'],
        ['id' => 2, 'label' => 'Muovi tutti di 2', 'cost' => 2, 'movements' => 2, 'target' => 'all'],
        ['id' => 3, 'label' => 'Muovi sangue 2', 'cost' => 2, 'movements' => 6, 'target' => 'all'],
        ['id' => 4, 'label' => 'Febbre', 'cost' => 3, 'movements' => 10, 'target' => 'all'],
    ];

    // ── Board graph ──────────────────────────────────────────────────────────
    // Each path is an ordered array of cells going away from the heart and looping back.
    // 'side' = extra nodes reachable by docking at this cell (not traversal nodes).
    // A boat at path=-1 is at the central heart node.
    const PATHS = [
        0 => [   // Path 1 — top, 3 cells
            ['id' => 'p1c1'],
            ['id' => 'p1c2', 'side' => ['zona_infezione_a']],
            ['id' => 'p1c3', 'side' => ['cervello']],
        ],
        1 => [   // Path 2 — 5 cells
            ['id' => 'p2c1'],
            ['id' => 'p2c2'],
            ['id' => 'p2c3', 'side' => ['zona_infezione_b']],
            ['id' => 'p2c4', 'name' => 'polmone_sx'],
            ['id' => 'p2c5'],
        ],
        2 => [   // Path 3 — intestino, 3 cells
            ['id' => 'p3c1'],
            ['id' => 'p3c2', 'name' => 'intestino'],
            ['id' => 'p3c3', 'side' => ['zona_infezione_c']],
        ],
        3 => [   // Path 4 — 6 cells
            ['id' => 'p4c1'],
            ['id' => 'p4c2'],
            ['id' => 'p4c3'],
            ['id' => 'p4c4', 'name' => 'polmone_dx'],
            ['id' => 'p4c5', 'side' => ['zona_infezione_d']],
            ['id' => 'p4c6'],
        ],
    ];

    // ── DB helpers (use existing player_variable table) ──────────────────────

    /** Return the initial state for all boats (all at heart). */
    public static function initialBoats(): array
    {
        $boats = [];
        for ($i = 0; $i < self::INITIAL_BOATS; $i++) {
            $boats[] = ['id' => $i, 'path' => -1, 'cell' => -1, 'o2' => 0, 'co2' => 0, 'wb' => 0];
        }
        return $boats;
    }

    /** Read all boats for a player from player_variable. */
    public static function getBoats(Game $game, int $playerId): array
    {
        $boats = [];
        for ($i = 0; $i < self::INITIAL_BOATS; $i++) {
            $boats[] = [
                'id'   => $i,
                'path' => self::getVar($game, $playerId, "boat_{$i}_path"),
                'cell' => self::getVar($game, $playerId, "boat_{$i}_cell"),
                'o2'   => self::getVar($game, $playerId, "boat_{$i}_o2"),
                'co2'  => self::getVar($game, $playerId, "boat_{$i}_co2"),
                'wb'   => self::getVar($game, $playerId, "boat_{$i}_wb"),
            ];
        }
        return $boats;
    }

    /** Persist all boats for a player to player_variable. */
    public static function saveBoats(Game $game, int $playerId, array $boats): void
    {
        foreach ($boats as $b) {
            $i = (int) $b['id'];
            self::setVar($game, $playerId, "boat_{$i}_path", (int) $b['path']);
            self::setVar($game, $playerId, "boat_{$i}_cell", (int) $b['cell']);
            self::setVar($game, $playerId, "boat_{$i}_o2",   (int) ($b['o2']  ?? 0));
            self::setVar($game, $playerId, "boat_{$i}_co2",  (int) ($b['co2'] ?? 0));
            self::setVar($game, $playerId, "boat_{$i}_wb",   (int) ($b['wb']  ?? 0));
        }
    }

    // ── Lung O2 helpers ──────────────────────────────────────────────────────

    /** Return current O2 for both lungs: ['sx' => int, 'dx' => int]. */
    public static function getLungO2(Game $game, int $playerId): array
    {
        return [
            'sx' => max(0, self::getVar($game, $playerId, self::LUNG_SX_KEY)),
            'dx' => max(0, self::getVar($game, $playerId, self::LUNG_DX_KEY)),
        ];
    }

    /** Persist O2 amounts for both lungs. Clamps values to [0, LUNG_INITIAL_O2]. */
    public static function saveLungO2(Game $game, int $playerId, int $sx, int $dx): void
    {
        self::setVar($game, $playerId, self::LUNG_SX_KEY, max(0, $sx));
        self::setVar($game, $playerId, self::LUNG_DX_KEY, max(0, $dx));
    }

    /** Called once during setupNewGame to initialise both lung O2 values. */
    public static function initLungO2(Game $game, int $playerId): void
    {
        self::saveLungO2($game, $playerId, self::LUNG_INITIAL_O2, self::LUNG_INITIAL_O2);
    }

    /**
     * Validate that a list of final boat positions is reachable within
     * the allowed number of steps from their starting positions.
     * Returns true if valid, false otherwise.
     */
    public static function validateMoves(array $startBoats, array $finalBoats, int $movements, string $target): bool
    {
        $startMap = array_column($startBoats, null, 'id');
        foreach ($finalBoats as $fb) {
            $id    = (int) $fb['id'];
            $start = $startMap[$id] ?? null;
            if ($start === null) return false;

            $steps = self::minSteps(
                (int) $start['path'], (int) $start['cell'],
                (int) $fb['path'],    (int) $fb['cell']
            );

            $allowed = ($target === 'all') ? $movements : $movements;
            if ($steps > $allowed) return false;
        }
        return true;
    }

    /** Minimum steps between two positions on the circular graph. */
    private static function minSteps(int $fromPath, int $fromCell, int $toPath, int $toCell): int
    {
        if ($fromPath === $toPath && $fromCell === $toCell) return 0;

        // BFS on the graph
        $graph = self::buildAdjacency();
        $start = self::nodeKey($fromPath, $fromCell);
        $end   = self::nodeKey($toPath, $toCell);

        $visited = [$start => true];
        $queue   = [[$start, 0]];
        while (!empty($queue)) {
            [$node, $dist] = array_shift($queue);
            foreach ($graph[$node] ?? [] as $neighbor) {
                if ($neighbor === $end) return $dist + 1;
                if (!isset($visited[$neighbor])) {
                    $visited[$neighbor] = true;
                    $queue[] = [$neighbor, $dist + 1];
                }
            }
        }
        return PHP_INT_MAX; // unreachable
    }

    /** Build adjacency list (ignoring side connections — they are dock actions, not movement). */
    private static function buildAdjacency(): array
    {
        $adj = [];
        $heart = 'heart';
        foreach (self::PATHS as $pathIdx => $cells) {
            $prev = $heart;
            foreach ($cells as $cellIdx => $cell) {
                $key = self::nodeKey($pathIdx, $cellIdx);
                $adj[$prev][] = $key;
                $adj[$key][]  = $prev;
                $prev = $key;
            }
            // last cell loops back to heart
            $adj[$prev][]  = $heart;
            $adj[$heart][] = $prev;
        }
        return $adj;
    }

    private static function nodeKey(int $path, int $cell): string
    {
        return $path === -1 ? 'heart' : "p{$path}c{$cell}";
    }

    private static function getVar(Game $game, int $playerId, string $key): int
    {
        $val = $game->getUniqueValueFromDB(
            "SELECT `value` FROM `player_variable` WHERE `player_id` = $playerId AND `var_key` = '$key'"
        );
        return $val === null ? -1 : (int) $val;
    }

    private static function setVar(Game $game, int $playerId, string $key, int $value): void
    {
        $game::DbQuery(
            "INSERT INTO `player_variable` (`player_id`, `var_key`, `value`) VALUES ($playerId, '$key', $value)
             ON DUPLICATE KEY UPDATE `value` = $value"
        );
    }
}
