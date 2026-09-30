<?php

declare(strict_types=1);

namespace Bga\Games\InCorporeSano\Systems;

use Bga\Games\InCorporeSano\Game;

/**
 * Shared state of the 4 infection zones (A, B, C, D): the bacteria each holds
 * and the white blood cells (globuli bianchi) present. Mirrors CirBoard's
 * storage: integer key-values in `player_variable`, anchored on the Immunitario
 * player (the system that currently owns zone state). Both systems can reach it
 * via Game::getPlayerBySystem(BodySystem::Immune).
 *
 * A zone can hold several bacteria, possibly of mixed shapes. Since
 * `player_variable.value` is INT-only, we store one COUNT per virus type per
 * zone (`zona_{id}_{type}`) plus the white-blood-cell count (`zona_{id}_wb`).
 */
class InfectionZones
{
    const ZONES = ['a', 'b', 'c', 'd'];
    const VIRUS_TYPES = ['triangolare', 'quadrato', 'circolare'];

    // Combat table per virus type: die faces + threshold (kill if roll > threshold).
    const COMBAT = [
        'triangolare' => ['faces' => 4,  'threshold' => 2],
        'quadrato'    => ['faces' => 6,  'threshold' => 3],
        'circolare'   => ['faces' => 20, 'threshold' => 10],
    ];

    // Initial layout: 2 triangolari, 1 quadrato, 1 circolare (one per zone);
    // white blood cells 1 in A and 1 in C (rules), 0 in B and D.
    const INITIAL = [
        'a' => ['bacteria' => ['triangolare'], 'wb' => 1],
        'b' => ['bacteria' => ['triangolare'], 'wb' => 0],
        'c' => ['bacteria' => ['quadrato', 'triangolare'],    'wb' => 3],
        'd' => ['bacteria' => ['circolare'],   'wb' => 1],
    ];

    /** Initial zone state as an ordered list of associative rows. */
    public static function initialZones(): array
    {
        $zones = [];
        foreach (self::ZONES as $id) {
            $zones[] = ['id' => $id, 'bacteria' => self::INITIAL[$id]['bacteria'], 'wb' => self::INITIAL[$id]['wb']];
        }
        return $zones;
    }

    /** Read all zones from player_variable (falls back to INITIAL if unseeded). */
    public static function getZones(Game $game, int $immPlayerId): array
    {
        $zones = [];
        foreach (self::ZONES as $id) {
            $wb = self::getVar($game, $immPlayerId, "zona_{$id}_wb");

            // Detect unseeded zone: no wb row AND no type rows.
            $counts = [];
            $anyType = false;
            foreach (self::VIRUS_TYPES as $type) {
                $c = self::getVar($game, $immPlayerId, "zona_{$id}_{$type}");
                if ($c !== -1) $anyType = true;
                $counts[$type] = $c === -1 ? 0 : $c;
            }

            if ($wb === -1 && !$anyType) {
                $zones[] = ['id' => $id, 'bacteria' => self::INITIAL[$id]['bacteria'], 'wb' => self::INITIAL[$id]['wb']];
                continue;
            }

            $bacteria = [];
            foreach (self::VIRUS_TYPES as $type) {
                for ($i = 0; $i < $counts[$type]; $i++) $bacteria[] = $type;
            }
            $zones[] = ['id' => $id, 'bacteria' => $bacteria, 'wb' => $wb === -1 ? 0 : $wb];
        }
        return $zones;
    }

    /**
     * Write the given zones to the database (table `player_variable`), so the
     * state survives across turns and page reloads.
     *
     * That table only stores integers, so each zone's bacteria list is not
     * saved as-is: it is counted per type and stored as one integer row per
     * virus type (`zona_{id}_{type}`) plus one for the white blood cells
     * (`zona_{id}_wb`). getZones() reads these rows back and rebuilds the list.
     */
    public static function saveZones(Game $game, int $immPlayerId, array $zones): void
    {
        foreach ($zones as $z) {
            $id = (string) $z['id'];
            if (!in_array($id, self::ZONES, true)) continue;

            $counts = array_fill_keys(self::VIRUS_TYPES, 0);
            foreach (($z['bacteria'] ?? []) as $type) {
                if (isset($counts[$type])) $counts[$type]++;
            }
            foreach (self::VIRUS_TYPES as $type) {
                self::setVar($game, $immPlayerId, "zona_{$id}_{$type}", $counts[$type]);
            }
            /** set values to db */
            self::setVar($game, $immPlayerId, "zona_{$id}_wb", (int) ($z['wb'] ?? 0));
        }
    }

    /**
     * Add `count` bacteria of a random type, one each into `count` distinct
     * random zones (round-start infection growth). Returns the updated zones.
     */
    public static function addRandomBacteria(Game $game, int $immPlayerId, int $count): array
    {
        $zones = self::getZones($game, $immPlayerId);
        $byId  = array_column($zones, null, 'id');

        $ids = self::ZONES;
        shuffle($ids);
        $targets = array_slice($ids, 0, min($count, count($ids)));

        foreach ($targets as $zid) {
            $type = self::VIRUS_TYPES[array_rand(self::VIRUS_TYPES)];
            $byId[$zid]['bacteria'][] = $type;
        }

        $updated = array_values($byId);
        self::saveZones($game, $immPlayerId, $updated);
        return $updated;
    }

    /** Per-type bacteria counts of a single zone id (used to diff kills). */
    public static function typeCounts(array $zone): array
    {
        $counts = array_fill_keys(self::VIRUS_TYPES, 0);
        foreach (($zone['bacteria'] ?? []) as $type) {
            if (isset($counts[$type])) $counts[$type]++;
        }
        return $counts;
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
