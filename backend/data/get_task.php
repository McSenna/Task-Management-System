<?php
include_once './config/database.php';

function ensureTaskTableExists() {
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
        CREATE TABLE IF NOT EXISTS task_id_counter (
            year VARCHAR(2) PRIMARY KEY,
            last_number INT NOT NULL DEFAULT 0
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
}

function ensureOfflineCreatorColumn() {
    global $connect;
    $checkQuery = "SHOW COLUMNS FROM tasks LIKE 'offline_creator'";
    $result = $connect->query($checkQuery);
    if ($result->num_rows === 0) {
        $connect->query("ALTER TABLE tasks ADD COLUMN offline_creator VARCHAR(100) NULL");
    }
}

function get_tasks() {
    global $connect;   
    header('Content-Type: application/json');

    ensureTaskTableExists();
    ensureOfflineCreatorColumn();

    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $isAdmin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $priority = isset($_GET['priority']) ? $_GET['priority'] : null;

    $query = "
        SELECT 
            t.*,
            COALESCE(c.username, t.offline_creator, 'Unknown') AS assigned_by_name,
            GROUP_CONCAT(DISTINCT ta.user_id) AS assigned_user_ids,
            GROUP_CONCAT(DISTINCT ua.username) AS assigned_user_names
        FROM tasks t
        LEFT JOIN users c ON t.assigned_by = c.user_id
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN users ua ON ta.user_id = ua.user_id
        WHERE 1=1";
    
    $params = [];
    $types = "";

    // Filter by user if not admin
    if (!$isAdmin && $userId) {
        $query .= " AND (ta.user_id = ? OR t.assigned_by = ?)";
        $params[] = $userId;
        $params[] = $userId;
        $types .= "ss";
    }
    
    if ($status) {
        $query .= " AND t.status = ?";
        $params[] = $status;
        $types .= "s";
    }
    
    if ($priority) {
        $query .= " AND t.priority = ?";
        $params[] = $priority;
        $types .= "s";
    }

    $query .= " GROUP BY t.task_id";
    $query .= " ORDER BY t.deadline ASC, 
                CASE t.priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                    ELSE 4 
                END";
    
    $stmt = $connect->prepare($query);
    if (!$stmt) {
        echo json_encode(['type' => 'error', 'message' => 'Database query preparation failed']);
        exit;
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tasks = [];
    while ($row = $result->fetch_assoc()) {
        $today = new DateTime();
        $deadline = new DateTime($row['deadline']);
        $interval = $today->diff($deadline);
        $daysRemaining = $interval->format('%R%a');
        
        $row['days_remaining'] = $daysRemaining;
        $row['created_at_formatted'] = date('M d, Y', strtotime($row['created_at']));
        $row['deadline_formatted'] = date('M d, Y', strtotime($row['deadline']));
        
        // Process assigned users
        $assignedUsers = [];
        if (!empty($row['assigned_user_ids']) && !empty($row['assigned_user_names'])) {
            $userIds = explode(',', $row['assigned_user_ids']);
            $userNames = explode(',', $row['assigned_user_names']);
            
            foreach ($userIds as $index => $uid) {
                if (isset($userNames[$index])) {
                    $assignedUsers[] = [
                        'user_id' => $uid,
                        'username' => $userNames[$index]
                    ];
                }
            }
        }
        
        $row['assigned_users'] = $assignedUsers;
        unset($row['assigned_user_ids']);
        unset($row['assigned_user_names']);
        
        // For backward compatibility, include assigned_to_name if assigned_to exists
        if (!empty($row['assigned_to'])) {
            $stmt = $connect->prepare("SELECT username FROM users WHERE user_id = ?");
            $stmt->bind_param("s", $row['assigned_to']);
            $stmt->execute();
            $result2 = $stmt->get_result();
            if ($row2 = $result2->fetch_assoc()) {
                $row['assigned_to_name'] = $row2['username'];
            } else {
                $row['assigned_to_name'] = 'Unknown';
            }
            $stmt->close();
        } else {
            $row['assigned_to_name'] = null;
        }
        
        $tasks[] = $row;
    }
    
    echo json_encode([
        'type' => 'success',
        'tasks' => $tasks,
        'count' => count($tasks)
    ]);
    
    $stmt->close();
    exit;
}
?>