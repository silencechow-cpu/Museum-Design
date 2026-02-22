-- Migration: 0008_add_user_indexes
-- Description: Add indexes on users table to optimize admin user management queries
--   - name_idx: speeds up LIKE searches on user name
--   - role_idx: speeds up filtering by role
--   - created_at_idx: speeds up ORDER BY createdAt (default sort in admin list)

CREATE INDEX `name_idx` ON `users` (`name`(255));--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `users` (`createdAt`);
