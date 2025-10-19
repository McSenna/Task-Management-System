<?php
     function update_profile() {
        global $connect;
        header('Content-Type: application/json');
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['user_id'])) {
            echo json_encode([
                'type' => 'error',
                'message' => 'Invalid request or missing user ID'
            ]);
            return;
        }
        
        $userId = $data['user_id'];
        $username = isset($data['username']) ? $data['username'] : null;
        $email = isset($data['email']) ? $data['email'] : null;
        $role = isset($data['role']) ? $data['role'] : null;
        $department = isset($data['department']) ? $data['department'] : null;
        $contact = isset($data['contact']) ? $data['contact'] : null;
        $location = isset($data['location']) ? $data['location'] : null;
        
        ensureColumnsExist($connect, ['department', 'location']);
        
        $updateFields = [];
        $params = [];
        $types = '';
        
        if ($username !== null) {
            $updateFields[] = "username = ?";
            $params[] = $username;
            $types .= 's';
        }
        
        if ($email !== null) {
            $updateFields[] = "email = ?";
            $params[] = $email;
            $types .= 's';
        }
        
        if ($role !== null) {
            $updateFields[] = "role = ?";
            $params[] = $role;
            $types .= 's';
        }
        
        if ($department !== null) {
            $updateFields[] = "department = ?";
            $params[] = $department;
            $types .= 's';
        }
        
        if ($contact !== null) {
            $updateFields[] = "contact = ?";
            $params[] = $contact;
            $types .= 's';
        }
        
        if ($location !== null) {
            $updateFields[] = "location = ?";
            $params[] = $location;
            $types .= 's';
        }
        
        $updateFields[] = "updated_at = NOW()";
        
        if (empty($updateFields)) {
            echo json_encode([
                'type' => 'info',
                'message' => 'No changes were made'
            ]);
            return;
        }
        
        $sql = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE user_id = ?";
        $types .= 's'; 
        $params[] = $userId;
        
        $stmt = $connect->prepare($sql);
        
        if (!$stmt) {
            echo json_encode([
                'type' => 'error',
                'message' => 'Prepare failed: ' . $connect->error
            ]);
            return;
        }

        if (!empty($params)) {
            $bindParams = array($types);
            foreach ($params as $key => $value) {
                $bindParams[] = &$params[$key];
            }
            
            call_user_func_array(array($stmt, 'bind_param'), $bindParams);
        }
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    'type' => 'success',
                    'message' => 'Profile updated successfully'
                ]);
            } else {
                echo json_encode([
                    'type' => 'info',
                    'message' => 'No changes were made'
                ]);
            }
        } else {
            echo json_encode([
                'type' => 'error',
                'message' => 'Failed to update profile: ' . $stmt->error
            ]);
        }
        
        $stmt->close();
    }

    function ensureColumnsExist($connect, $columns) {
        foreach ($columns as $column) {
            $checkQuery = "SHOW COLUMNS FROM users LIKE '$column'";
            $result = $connect->query($checkQuery);
            if ($result->num_rows === 0) {
                $connect->query("ALTER TABLE users ADD COLUMN $column VARCHAR(100) NULL");
            }
        }
    }