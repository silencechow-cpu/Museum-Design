CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`action` enum('approve','reject','comment') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
