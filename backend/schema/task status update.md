-- Adding table for task status change requests
CREATE TABLE IF NOT EXISTS `task_status_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `task_id` VARCHAR(10) NOT NULL,
  `user_id` VARCHAR(10) NOT NULL,
  `current_status` ENUM('todo', 'inProgress', 'completed') NOT NULL,
  `requested_status` ENUM('todo', 'inProgress', 'completed') NOT NULL,
  `request_reason` TEXT,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `admin_response` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`task_id`) REFERENCES `tasks` (`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  INDEX idx_task_id (`task_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Update AUTO_INCREMENT for consistency
ALTER TABLE `task_status_requests`
  MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;