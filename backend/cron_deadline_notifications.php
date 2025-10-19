<?php
/**
 * Cron Job Script for Task Deadline Notifications
 * 
 * This script should be run every 5 minutes to check for tasks approaching deadlines
 * and create appropriate notifications for users.
 * 
 * Usage: php cron_deadline_notifications.php
 * 
 * To set up a cron job, add this line to your crontab:
 * */5 * * * * /usr/bin/php /path/to/your/project/backend/cron_deadline_notifications.php
 **/

// Set the timezone
date_default_timezone_set('UTC');

// Include the notification manager
require_once __DIR__ . '/data/notification_manager.php';

// Include database configuration
require_once __DIR__ . '/config/database.php';

try {
    // Log the start of the cron job
    $logMessage = "[" . date('Y-m-d H:i:s') . "] Starting deadline notification check\n";
    file_put_contents(__DIR__ . '/logs/cron_deadline_notifications.log', $logMessage, FILE_APPEND | LOCK_EX);
    
    // Check and create deadline notifications
    checkAndCreateDeadlineNotifications();
    
    // Log successful completion
    $logMessage = "[" . date('Y-m-d H:i:s') . "] Deadline notification check completed successfully\n";
    file_put_contents(__DIR__ . '/logs/cron_deadline_notifications.log', $logMessage, FILE_APPEND | LOCK_EX);
    
    echo "Deadline notification check completed successfully at " . date('Y-m-d H:i:s') . "\n";
    
} catch (Exception $e) {
    // Log any errors
    $errorMessage = "[" . date('Y-m-d H:i:s') . "] Error in deadline notification check: " . $e->getMessage() . "\n";
    file_put_contents(__DIR__ . '/logs/cron_deadline_notifications.log', $errorMessage, FILE_APPEND | LOCK_EX);
    
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

// Close database connection
if (isset($connect)) {
    $connect->close();
}
?>
