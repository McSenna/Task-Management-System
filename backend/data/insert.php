<?php 
    function generateUserId() {
        global $connect;
        
        $year = date('y');
        
        $stmt = $connect->prepare("SELECT last_number FROM id_counter WHERE year = ?");
        $stmt->bind_param("s", $year);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $newNumber = $row['last_number'] + 1;
            
            $updateStmt = $connect->prepare("UPDATE id_counter SET last_number = ? WHERE year = ?");
            $updateStmt->bind_param("is", $newNumber, $year);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            $newNumber = 1;
            $insertStmt = $connect->prepare("INSERT INTO id_counter (year, last_number) VALUES (?, ?)");
            $insertStmt->bind_param("si", $year, $newNumber);
            $insertStmt->execute();
            $insertStmt->close();
        }
        
        $stmt->close();
        
        $userId = 'U' . $year . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
        
        return $userId;
    }

    function insertUser() {
        global $connect;
        $data = json_decode(file_get_contents('php://input'), true);
        if($data) {
            $username = $data['username'];
            $email = $data['email'];
            $password = $data['password']; 
            $role = $data['role'];
            $status = isset($data['status']) ? $data['status'] : 'Active';
            $contact = isset($data['contact']) ? $data['contact'] : '';
            $department = isset($data['department']) ? $data['department'] : null;
            $location = isset($data['location']) ? $data['location'] : null;
            
            if($username && $email && $password && $role) {
                $userId = generateUserId();                
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);              
                ensureColumnsExist($connect, ['department', 'location']);
                
                $stmt = $connect->prepare("INSERT INTO users (user_id, username, email, password, role, status, contact, department, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("sssssssss", $userId, $username, $email, $hashedPassword, $role, $status, $contact, $department, $location);
                
                if($stmt->execute()) {
                    $id = $connect->insert_id;
                    
                    echo json_encode([
                        'type' => 'success', 
                        'message' => 'User created successfully',
                        'user_id' => $userId,
                        'id' => $id
                    ]);
                } else {
                    echo json_encode(['type' => 'error', 'message' => 'Failed to create user: ' . $stmt->error]);
                }
        
                $stmt->close();
            } else {
                echo json_encode(['type' => 'error', 'message' => 'Required fields missing']);
            }
        } else {
            echo json_encode(['type' => 'error', 'message' => 'Invalid JSON']);
        }
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