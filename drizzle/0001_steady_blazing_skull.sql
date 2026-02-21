CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`museumId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`artifactName` text NOT NULL,
	`artifactDescription` text,
	`images` text,
	`requirements` text,
	`prize` text,
	`prizeAmount` int DEFAULT 0,
	`deadline` timestamp NOT NULL,
	`status` enum('draft','active','closed','completed') NOT NULL DEFAULT 'draft',
	`downloadUrl` text,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `designers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` text NOT NULL,
	`bio` text,
	`avatar` text,
	`type` enum('individual','team','school') NOT NULL DEFAULT 'individual',
	`organization` text,
	`portfolio` text,
	`skills` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `designers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetType` enum('collection','work') NOT NULL,
	`targetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `museums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`address` text,
	`logo` text,
	`coverImage` text,
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`website` text,
	`verified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `museums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`designerId` int NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`images` text,
	`tags` text,
	`status` enum('submitted','approved','rejected','winner') NOT NULL DEFAULT 'submitted',
	`viewCount` int DEFAULT 0,
	`likeCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `works_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','museum','designer') NOT NULL DEFAULT 'user';