
-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- InCorporeSano implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Which body system (apparato) each player embodies: circulatory | digestive | immune | nervous
ALTER TABLE `player` ADD `player_system` VARCHAR(16) NOT NULL DEFAULT '';

-- Numeric resources owned by a player. Each system may declare a different set of resources
-- (the immune system has several, others fewer), so this stays a generic key/value table.
CREATE TABLE IF NOT EXISTS `player_resource` (
  `player_id` INT UNSIGNED NOT NULL,
  `resource_key` VARCHAR(32) NOT NULL,
  `amount` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`player_id`, `resource_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Upgrades a player currently owns. The presence of a row means the upgrade is owned.
CREATE TABLE IF NOT EXISTS `player_upgrade` (
  `player_id` INT UNSIGNED NOT NULL,
  `upgrade_key` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`player_id`, `upgrade_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Miscellaneous per-player state variables (blood position, neuron position, ...).
CREATE TABLE IF NOT EXISTS `player_variable` (
  `player_id` INT UNSIGNED NOT NULL,
  `var_key` VARCHAR(32) NOT NULL,
  `value` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`player_id`, `var_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
