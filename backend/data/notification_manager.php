<?php

require_once __DIR__ . '/../config/database.php';

function ensureNotificationTables() {
    global $connect;

    $connect->query("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(10) NOT NULL,
        task_id VARCHAR(10) DEFAULT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        severity ENUM('info','warning','danger') NOT NULL DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_user_created (user_id, created_at),
        UNIQUE KEY uniq_user_task_type (user_id, task_id, type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
}

function createNotification($userId, $taskId, $type, $title, $message, $severity) {
    global $connect;

    $stmt = $connect->prepare("INSERT IGNORE INTO notifications (user_id, task_id, type, title, message, severity) VALUES (?, ?, ?, ?, ?, ?)");
    if (!$stmt) return false;
    $stmt->bind_param('ssssss', $userId, $taskId, $type, $title, $message, $severity);
    $ok = $stmt->execute();
    $stmt->close();
    return $ok;
}

function checkAndCreateDeadlineNotifications() {
    global $connect;

    ensureNotificationTables();

    // Fetch assigned tasks with deadlines in the future or within the past hour window
    $query = "
        SELECT t.task_id, t.title, t.deadline, ta.user_id
        FROM tasks t
        JOIN task_assignments ta ON ta.task_id = t.task_id
        WHERE t.status IN ('todo','inProgress')
    " ;

    $result = $connect->query($query);
    if (!$result) {
        throw new Exception('Failed to query tasks: ' . $connect->error);
    }

    $now = new DateTime('now', new DateTimeZone('UTC'));

    while ($row = $result->fetch_assoc()) {
        $taskId = $row['task_id'];
        $title = $row['title'];
        $deadline = DateTime::createFromFormat('Y-m-d', $row['deadline'], new DateTimeZone('UTC'));
        if (!$deadline) continue;

        $userId = $row['user_id'];
        $diffSeconds = $deadline->getTimestamp() - $now->getTimestamp();

        // Define thresholds in seconds and their labels/severities
        $thresholds = [
            7 * 24 * 60 * 60 => ['label' => '7d', 'severity' => 'info'],
            1 * 24 * 60 * 60 => ['label' => '1d', 'severity' => 'warning'],
            12 * 60 * 60     => ['label' => '12h', 'severity' => 'warning'],
            6 * 60 * 60      => ['label' => '6h', 'severity' => 'warning'],
            3 * 60 * 60      => ['label' => '3h', 'severity' => 'warning'],
            1 * 60 * 60      => ['label' => '1h', 'severity' => 'danger'],
        ];

        foreach ($thresholds as $seconds => $meta) {
            $type = 'deadline_' . $meta['label'];
            // Trigger window: if within the last 5 minutes crossing the threshold
            $window = 5 * 60; // 5 minutes
            if ($diffSeconds <= $seconds && $diffSeconds > ($seconds - $window)) {
                $human = $meta['label'];
                $msg = "Task '$title' deadline in $human";
                createNotification($userId, $taskId, $type, 'Upcoming Deadline', $msg, $meta['severity']);
            }
        }

        // Optionally, overdue notifications (hard warning) - trigger when just passed deadline
        if ($diffSeconds <= 0 && $diffSeconds > -300) {
            $type = 'deadline_overdue';
            $msg = "Task '$title' is now overdue";
            createNotification($userId, $taskId, $type, 'Task Overdue', $msg, 'danger');
        }
    }
}
