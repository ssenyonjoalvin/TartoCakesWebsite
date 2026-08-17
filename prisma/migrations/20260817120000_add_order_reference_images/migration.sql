ALTER TABLE `cake_orders`
ADD COLUMN `referenceImages` JSON NOT NULL DEFAULT (JSON_ARRAY());

UPDATE `cake_orders`
SET `referenceImages` = JSON_ARRAY()
WHERE `referenceImages` IS NULL;