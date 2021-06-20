SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

DROP DATABASE IF EXISTS bsc;
CREATE DATABASE bsc CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE bsc;

DROP TABLE IF EXISTS bsc_tx;
DROP TABLE IF EXISTS bsc_coin;
DROP TABLE IF EXISTS my_portfolio;

CREATE TABLE `bsc_tx` (
  `id` int(11) NOT NULL auto_increment,
  `txhash` varchar(66)  NULL,
  `blocknumber` int(11) NULL,
  `bsc_coin_in_id` int(11) NULL,
  `bsc_coin_out_id` int(11) NULL,
  `method` varchar(60) NULL,
  `address_from` varchar(45) NULL,
  `amount_in` varchar(30) NULL,
  `amount_out` varchar(30) NULL,
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY  (`id`),
   FOREIGN KEY (bsc_coin_in_id) REFERENCES bsc_coin(id),
   FOREIGN KEY (bsc_coin_out_id) REFERENCES bsc_coin(id)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `bsc_coin` (
  `id` int(11) NOT NULL auto_increment,
  `contract_address` varchar(45) NULL,
  `name` varchar(100) NULL,
  `symbol` varchar(40) NULL,
  `decimals` varchar(2) NULL,
  `total_supply` varchar(80) NULL,
  `counter` int(11) NOT NULL default 0,
  `is_active`  TINYINT(1) NOT NULL DEFAULT '1',
  `is_fav`  TINYINT(1) NOT NULL DEFAULT '0',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY  (`id`)
) DEFAULT CHARSET=utf8mb4;

CREATE TABLE `my_portfolio` (
  `id` int(11) NOT NULL auto_increment,
  `bsc_coin_in_id` int(11) NULL,
  `bsc_coin_out_id` int(11) NULL,
  `amount_in` varchar(30) NULL,
  `amount_out` varchar(30) NULL,
  `is_active`  TINYINT(1) NOT NULL DEFAULT '1',
  `comments` TEXT NULL,
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY  (`id`),
   FOREIGN KEY (bsc_coin_in_id) REFERENCES bsc_coin(id),
   FOREIGN KEY (bsc_coin_out_id) REFERENCES bsc_coin(id)
) DEFAULT CHARSET=utf8mb4;

CREATE INDEX bsc_coin_in_id1 ON bsc_tx (bsc_coin_in_id);
CREATE INDEX bsc_coin_out_id1 ON bsc_tx (bsc_coin_out_id);
CREATE UNIQUE INDEX contract_address1 ON bsc_coin (contract_address);

INSERT INTO `bsc_coin` (id, name, symbol, decimals) VALUES (1,'Binance Coin','BNB','18');
