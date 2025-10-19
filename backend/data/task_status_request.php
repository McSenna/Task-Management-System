<?php
    function ensureTaskStatusRequestTableExists() {
        global $connect;

        $connect->query("
            CREATE TABLE IF NOT EXISTS task_status_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                task_id VARCHAR(10) NOT NULL,
                user_id VARCHAR(10) NOT NULL,
                current_status ENUM('todo', 'inProgress', 'completed') NOT NULL,
                requested_status ENUM('todo', 'inProgress', 'completed') NOT NULL,
                request_reason TEXT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                admin_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_task_id (task_id),
                INDEX idx_user_id (user_id),
                INDEX idx_status (status)
            )
        ");
    }

    function createTaskStatusRequest() {
        global $connect;
        header('Content-Type: application/json');

        ensureTaskStatusRequestTableExists();

        $data = json_decode(file_get_contents("php://input"), true);
        $task_id = $data['task_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
        $current_status = $data['current_status'] ?? null;
        $requested_status = $data['requested_status'] ?? null;
        $request_reason = $data['request_reason'] ?? '';

        if (!$task_id || !$user_id || !$current_status || !$requested_status) {
            echo json_encode(['type' => 'error', 'message' => 'Missing required fields']);
            return;
        }

        // Verify task exists
        $stmt = $connect->prepare("SELECT status FROM tasks WHERE task_id = ?");
        $stmt->bind_param("s", $task_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            echo json_encode(['type' => 'error', 'message' => 'Task not found']);
            $stmt->close();
            return;
        }
        $task = $result->fetch_assoc();
        if ($task['status'] !== $current_status) {
            echo json_encode(['type' => 'error', 'message' => 'Current task status mismatch']);
            $stmt->close();
            return;
        }
        $stmt->close();

        // Check for existing pending request for this task and user
        $stmt = $connect->prepare("SELECT id FROM task_status_requests WHERE task_id = ? AND user_id = ? AND status = 'pending'");
        $stmt->bind_param("ss", $task_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            echo json_encode(['type' => 'error', 'message' => 'A pending request already exists for this task']);
            $stmt->close();
            return;
        }
        $stmt->close();

        // Insert request
        $stmt = $connect->prepare("
            INSERT INTO task_status_requests (task_id, user_id, current_status, requested_status, request_reason)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sssss", $task_id, $user_id, $current_status, $requested_status, $request_reason);
        
        if ($stmt->execute()) {
            // Log the request
            $stmt = $connect->prepare("SELECT username FROM users WHERE user_id = ?");
            $stmt->bind_param("s", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $username = $result->num_rows ? $result->fetch_assoc()['username'] : 'Unknown';
            $stmt->close();

            $stmt = $connect->prepare("SELECT title FROM tasks WHERE task_id = ?");
            $stmt->bind_param("s", $task_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $task_title = $result->num_rows ? $result->fetch_assoc()['title'] : 'Unknown';
            $stmt->close();

            $log_action = "User $username requested status change for task '$task_title' from $current_status to $requested_status";
            $stmt = $connect->prepare("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)");
            $stmt->bind_param("ss", $user_id, $log_action);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['type' => 'success', 'message' => 'Status change request submitted']);
        } else {
            echo json_encode(['type' => 'error', 'message' => 'Failed to submit request']);
        }
        $stmt->close();
    }

    function getTaskStatusRequests() {
        global $connect;
        header('Content-Type: application/json');

        ensureTaskStatusRequestTableExists();

        $isAdmin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

        $query = "
            SELECT 
                tsr.*,
                t.title AS task_title,
                u.username AS user_name
            FROM task_status_requests tsr
            LEFT JOIN tasks t ON tsr.task_id = t.task_id
            LEFT JOIN users u ON tsr.user_id = u.user_id
            WHERE tsr.status = 'pending'";
        
        $params = [];
        $types = "";

        if (!$isAdmin && $userId) {
            $query .= " AND tsr.user_id = ?";
            $params[] = $userId;
            $types .= "s";
        }

        $query .= " ORDER BY tsr.created_at DESC";

        $stmt = $connect->prepare($query);
        if (!$stmt) {
            echo json_encode(['type' => 'error', 'message' => 'Database query preparation failed']);
            return;
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }

        echo json_encode([
            'type' => 'success',
            'requests' => $requests,
            'count' => count($requests)
        ]);
        $stmt->close();
    }

    function handleTaskStatusRequest() {
        global $connect;
        header('Content-Type: application/json');

        ensureTaskStatusRequestTableExists();

        $data = json_decode(file_get_contents("php://input"), true);
        $request_id = $data['request_id'] ?? null;
        $action = $data['action'] ?? null; // 'approve' or 'reject'
        $admin_response = $data['admin_response'] ?? '';
        $admin_id = $data['admin_id'] ?? null;

        if (!$request_id || !$action || !$admin_id || !in_array($action, ['approve', 'reject'])) {
            echo json_encode(['type' => 'error', 'message' => 'Invalid request data']);
            return;
        }

        // Fetch request details
        $stmt = $connect->prepare("
            SELECT tsr.task_id, tsr.user_id, tsr.current_status, tsr.requested_status, t.title
            FROM task_status_requests tsr
            LEFT JOIN tasks t ON tsr.task_id = t.task_id
            WHERE tsr.id = ? AND tsr.status = 'pending'
        ");
        $stmt->bind_param("i", $request_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            echo json_encode(['type' => 'error', 'message' => 'Request not found or already processed']);
            $stmt->close();
            return;
        }
        $request = $result->fetch_assoc();
        $stmt->close();

        // Update request status
        $stmt = $connect->prepare("
            UPDATE task_status_requests 
            SET status = ?, admin_response = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        $stmt->bind_param("ssi", $action, $admin_response, $request_id);
        $stmt->execute();
        $stmt->close();

        if ($action === 'approve') {
            // Update task status
            $stmt = $connect->prepare("
                UPDATE tasks 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE task_id = ?
            ");
            $stmt->bind_param("ss", $request['requested_status'], $request['task_id']);
            $stmt->execute();
            $stmt->close();
        }

        // Log the action
        $stmt = $connect->prepare("SELECT username FROM users WHERE user_id = ?");
        $stmt->bind_param("s", $request['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $username = $result->num_rows ? $result->fetch_assoc()['username'] : 'Unknown';
        $stmt->close();

        $stmt = $connect->prepare("SELECT username FROM users WHERE user_id = ?");
        $stmt->bind_param("s", $admin_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $admin_username = $result->num_rows ? $result->fetch_assoc()['username'] : 'Unknown';
        $stmt->close();

        $log_action = "Admin " . ($action === 'approve' ? 'approved' : 'rejected') . 
                    " status change request for task '{$request['title']}' from {$request['current_status']} to {$request['requested_status']} by $username";
        $stmt = $connect->prepare("INSERT INTO activity_logs (user_id, action) VALUES (?, ?)");
        $stmt->bind_param("ss", $admin_id, $log_action);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            'type' => 'success',
            'message' => 'Request ' . ($action === 'approve' ? 'approved' : 'rejected') . ' successfully'
        ]);
    }
    ?>