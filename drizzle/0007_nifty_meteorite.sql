ALTER TABLE `ratings` ADD `targetType` enum('work','collection') NOT NULL;--> statement-breakpoint
ALTER TABLE `ratings` ADD `targetId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `ratings` DROP COLUMN `workId`;--> statement-breakpoint
ALTER TABLE `ratings` DROP COLUMN `museumId`;