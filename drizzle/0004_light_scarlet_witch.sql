ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `authProvider` enum('manus','email','wechat','qq') NOT NULL DEFAULT 'manus';--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` int NOT NULL DEFAULT 0;
