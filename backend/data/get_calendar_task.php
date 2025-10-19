<?php
include_once './config/database.php';

function ensureTaskTablesExist() {
    global $connect;

    $connect->query("
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id VARCHAR(10) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_to VARCHAR(10), -- Kept for backward compatibility
            assigned_by VARCHAR(10) NOT NULL,
            deadline DATE NOT NULL,
            priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
            status ENUM('todo', 'inProgress', 'completed') DEFAULT 'todo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            offline_creator VARCHAR(100),
            INDEX idx_assigned_to (assigned_to),
            INDEX idx_assigned_by (assigned_by),
            INDEX idx_deadline (deadline),
            INDEX idx_status (status)
        )
    ");

    $connect->query("
        CREATE TABLE IF NOT EXISTS task_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id VARCHAR(10) NOT NULL,
            user_id VARCHAR(10) NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_assignment (task_id, user_id),
            FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    ");

    $connect->query("
        CREATE TABLE IF NOT EXISTS task_id_counter (
            year VARCHAR(2) PRIMARY KEY,
            last_number INT NOT NULL DEFAULT 0
        )
    ");
}

function getCalendarTasks() {
    global $connect;

    header('Content-Type: application/json');
    
    ensureTaskTablesExist();
    
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $isAdmin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
    $month = isset($_GET['month']) ? intval($_GET['month']) : null;
    $year = isset($_GET['year']) ? intval($_GET['year']) : null;
    
    if (!$month || !$year) {
        echo json_encode(['type' => 'error', 'message' => 'Month and Year are required']);
        return;
    }

    $startDate = sprintf('%04d-%02d-01', $year, $month);
    $endDate = date('Y-m-t', strtotime($startDate));

    $query = "
        SELECT 
            t.*,
            COALESCE(u.username, t.offline_creator, 'Unknown') AS assigned_by_name,
            DATE_FORMAT(t.deadline, '%Y-%m-%d') AS deadline,
            GROUP_CONCAT(DISTINCT ta.user_id) AS assigned_user_ids,
            GROUP_CONCAT(DISTINCT ua.username) AS assigned_user_names
        FROM tasks t
        LEFT JOIN users u ON t.assigned_by = u.user_id
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN users ua ON ta.user_id = ua.user_id
        WHERE t.deadline BETWEEN ? AND ?";
    
    $params = [$startDate, $endDate];
    $types = "ss";

    if (!$isAdmin && $userId) {
        $query .= " AND (ta.user_id = ? OR t.assigned_by = ?)";
        $params[] = $userId;
        $params[] = $userId;
        $types .= "ss";
    }

    $query .= " GROUP BY t.task_id";
    $query .= " ORDER BY t.deadline ASC";

    $stmt = $connect->prepare($query);
    if (!$stmt) {
        echo json_encode(['type' => 'error', 'message' => 'Database query preparation failed']);
        return;
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $tasksByDate = [];

    while ($task = $result->fetch_assoc()) {
        $dateKey = $task['deadline'];
        
        if (!isset($tasksByDate[$dateKey])) {
            $tasksByDate[$dateKey] = [];
        }
        
        $assignedUsers = [];
        if (!empty($task['assigned_user_ids']) && !empty($task['assigned_user_names'])) {
            $userIds = explode(',', $task['assigned_user_ids']);
            $userNames = explode(',', $task['assigned_user_names']);
            
            foreach ($userIds as $index => $uid) {
                if (isset($userNames[$index])) {
                    $assignedUsers[] = [
                        'user_id' => $uid,
                        'username' => $userNames[$index]
                    ];
                }
            }
        }

        $task['assigned_users'] = $assignedUsers;
        unset($task['assigned_user_ids']);
        unset($task['assigned_user_names']);

        // For backward compatibility, include assigned_to_name if assigned_to exists
        if (!empty($task['assigned_to'])) {
            $stmt = $connect->prepare("SELECT username FROM users WHERE user_id = ?");
            $stmt->bind_param("s", $task['assigned_to']);
            $stmt->execute();
            $result2 = $stmt->get_result();
            if ($row2 = $result2->fetch_assoc()) {
                $task['assigned_to_name'] = $row2['username'];
            } else {
                $task['assigned_to_name'] = 'Unknown';
            }
            $stmt->close();
        } else {
            $task['assigned_to_name'] = null;
        }

        $tasksByDate[$dateKey][] = $task;
    }

    echo json_encode([
        'type' => 'success',
        'tasks' => $tasksByDate
    ]);

    $stmt->close();
}

// For backward compatibility
function getTasks() {
    getCalendarTasks();
}
?>