<?php 
    
function generateTaskId() {
    global $connect;

    $year = date('y');

    $stmt = $connect->prepare("SELECT last_number FROM task_id_counter WHERE year = ?");
    $stmt->bind_param("s", $year);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $newNumber = $row['last_number'] + 1;
        
        $updateStmt = $connect->prepare("UPDATE task_id_counter SET last_number = ? WHERE year = ?");
        $updateStmt->bind_param("is", $newNumber, $year);
        $updateStmt->execute();
        $updateStmt->close();
    } else {
        $newNumber = 1;
        $insertStmt = $connect->prepare("INSERT INTO task_id_counter (year, last_number) VALUES (?, ?)");
        $insertStmt->bind_param("si", $year, $newNumber);
        $insertStmt->execute();
        $insertStmt->close();
    }
    
    $stmt->close();

    $taskId = 'T' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    
    return $taskId;
}

function ensureTaskTableExists() {
    global $connect;
    
    $connect->query("
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id VARCHAR(10) NOT NULL UNIQUE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_by VARCHAR(10) NOT NULL,
            deadline DATE NOT NULL,
            priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
            status ENUM('todo', 'inProgress', 'completed') DEFAULT 'todo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            offline_creator VARCHAR(100) DEFAULT NULL,
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

    // Create task_assignments table if it doesn't exist
    $connect->query("
        CREATE TABLE IF NOT EXISTS task_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            task_id VARCHAR(10) NOT NULL,
            user_id VARCHAR(10) NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            UNIQUE KEY unique_assignment (task_id, user_id),
            INDEX idx_task_user (task_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
}

function ensureOfflineCreatorColumn() {
    global $connect;
    
    // Check if the column exists
    $result = $connect->query("SHOW COLUMNS FROM tasks LIKE 'offline_creator'");
    if ($result->num_rows == 0) {
        // Add the column if it doesn't exist
        $connect->query("ALTER TABLE tasks ADD COLUMN offline_creator VARCHAR(100) DEFAULT NULL");
    }
}

function validateUserIds($userIds) {
    global $connect;
    
    $placeholders = implode(',', array_fill(0, count($userIds), '?'));

    $query = "SELECT user_id FROM users WHERE user_id IN ($placeholders) AND status = 'Active'";
    $stmt = $connect->prepare($query);
    
    if (!$stmt) {
        return ['valid' => false, 'message' => 'Database error: ' . $connect->error];
    }

    $types = str_repeat('s', count($userIds));
    $stmt->bind_param($types, ...$userIds);
    $stmt->execute();
    $result = $stmt->get_result();

    $validUserCount = $result->num_rows;
    $stmt->close();

    if ($validUserCount !== count($userIds)) {
        return ['valid' => false, 'message' => 'One or more user IDs are invalid or inactive'];
    }
    
    return ['valid' => true];
}

function createTask() {
    global $connect;
    
    header('Content-Type: application/json');
    
    ensureTaskTableExists();
    ensureOfflineCreatorColumn();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if(!$data) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid JSON']);
        return;
    }

    if(!isset($data['title']) || !isset($data['assignedTo']) || !isset($data['deadline'])) {
        echo json_encode(['type' => 'error', 'message' => 'Required fields missing']);
        return;
    }

    if(!is_array($data['assignedTo']) || empty($data['assignedTo'])) {
        echo json_encode(['type' => 'error', 'message' => 'At least one assignee is required']);
        return;
    }

    $userValidation = validateUserIds($data['assignedTo']);
    if (!$userValidation['valid']) {
        echo json_encode(['type' => 'error', 'message' => $userValidation['message']]);
        return;
    }

    session_start();
    $assignedBy = isset($data['assignedBy']) ? $data['assignedBy'] : 'Admin';
    $creatorName = isset($data['assignedBy']) ? $data['assignedBy'] : 'Admin';
    
    if(isset($_SESSION['user_id'])) {
        $assignedBy = $_SESSION['user_id'];
    } else if(isset($data['creator_id']) && $data['creator_id']) {
        $assignedBy = $data['creator_id'];
    }
    
    $title = $data['title'];
    $description = isset($data['description']) ? $data['description'] : '';
    $assignedTo = $data['assignedTo']; // This is now an array
    $deadline = $data['deadline'];
    $priority = isset($data['priority']) ? $data['priority'] : 'medium';
    $status = isset($data['status']) ? $data['status'] : 'todo';

    $today = date('Y-m-d');
    if($deadline < $today) {
        echo json_encode(['type' => 'error', 'message' => 'Deadline cannot be in the past']);
        return;
    }

    $taskId = generateTaskId();

    $connect->begin_transaction();
    
    try {

        $stmt = $connect->prepare("
            INSERT INTO tasks (task_id, title, description, assigned_by, deadline, priority, status, offline_creator)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if (!$stmt) {
            throw new Exception('Database error: ' . $connect->error);
        }
        
        $stmt->bind_param("ssssssss", $taskId, $title, $description, $assignedBy, $deadline, $priority, $status, $creatorName);
        
        if(!$stmt->execute()) {
            throw new Exception('Failed to create task: ' . $stmt->error);
        }
        
        $taskDbId = $connect->insert_id;
        $stmt->close();

        $assignmentStmt = $connect->prepare("
            INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)
        ");
        
        if (!$assignmentStmt) {
            throw new Exception('Database error: ' . $connect->error);
        }
        
        $assignmentStmt->bind_param("ss", $taskId, $userId);
        
        $assignmentSuccess = true;
        $assignmentErrors = [];
        
        foreach($assignedTo as $userId) {
            if(!$assignmentStmt->execute()) {
                $assignmentErrors[] = "Failed to assign task to user $userId: " . $assignmentStmt->error;
                $assignmentSuccess = false;
            }
        }
        
        $assignmentStmt->close();
        
        if (!$assignmentSuccess) {
            throw new Exception('Failed to assign task to one or more users: ' . implode(', ', $assignmentErrors));
        }
        

        $connect->commit();
        
        echo json_encode([
            'type' => 'success',
            'message' => 'Task created successfully',
            'task_id' => $taskId,
            'id' => $taskDbId,
            'assigned_to' => $assignedTo
        ]);
        
    } catch (Exception $e) {
        // Rollback on error
        $connect->rollback();
        
        echo json_encode([
            'type' => 'error',
            'message' => $e->getMessage()
        ]);
    }
}