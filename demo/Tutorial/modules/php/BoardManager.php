<?php

declare(strict_types=1);

namespace Bga\Games\tutorialgioele;

class BoardManager
{
    public function __construct(private Game $game)
    {
    }

    public function initializeBoard(int $boardSize, int $blackPlayerId, int $whitePlayerId) : void
    {
        $sqlValues = [];
        $boardSizeHalf = (int) floor( $boardSize/2);
        
        for ($x = 1; $x <= $boardSize; $x++) {
            for ($y = 1; $y <= $boardSize; $y++) {
                $discValue = 'NULL';
                if (($x === $boardSizeHalf && $y === $boardSizeHalf) 
                    || ($x === ($boardSizeHalf + 1) && $y === ($boardSizeHalf + 1))) 
                {
                    $discValue = (string) $whitePlayerId;
                } 
                elseif (($x === $boardSizeHalf && $y === ($boardSizeHalf + 1)) 
                    || ($x === ($boardSizeHalf + 1) && $y === $boardSizeHalf)) 
                {
                    $discValue = (string) $blackPlayerId;
                }

                $sqlValues[] = "($x,$y,$discValue)";
                }
            }

        $sql = "INSERT INTO `board` (`board_x`,`board_y`,`board_player`) VALUES " . implode(',', $sqlValues);
        $this->game->DbQuery($sql);
    }

    public function getOccupiedDiscs(): array {
        return $this->game->getObjectListFromDB(
            "SELECT `board_x` `x`, `board_y` `y`, `board_player` `player`
             FROM `board`
             WHERE `board_player` IS NOT NULL"
        );
    }

    public function getPossibleMoves(int $playerId): array {
        return [3,3];
    }
}