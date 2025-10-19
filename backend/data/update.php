<?php
     function updateUser() {
        global $connect;
        $data = json_decode(file_get_contents('php://input'), true);
        if($data) {
            $userId = $data['user_id'];
            $username = $data['username'];
            $email = $data['email'];
            $role = $data['role'];
            $status = $data['status'];
            $contact = $data['contact'];
            
            $passwordSql = "";
            $stmt = null;
            
            if(isset($data['password']) && !empty($data['password'])) {
                $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                $passwordSql = ", password = ?";
                
                $stmt = $connect->prepare("UPDATE users SET username = ?, email = ?, role = ?, status = ?, contact = ? $passwordSql WHERE user_id = ?");
                $stmt->bind_param("ssssss", $username, $email, $role, $status, $contact, $hashedPassword, $userId);
            } else {
                $stmt = $connect->prepare("UPDATE users SET username = ?, email = ?, role = ?, status = ?, contact = ? WHERE user_id = ?");
                $stmt->bind_param("ssssss", $username, $email, $role, $status, $contact, $userId);
            }
            
            if($stmt->execute()) {
                echo json_encode(['type' => 'success', 'message' => 'User updated successfully']);
            } else {
                echo json_encode(['type' => 'error', 'message' => 'Failed to update user: ' . $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(['type' => 'error', 'message' => 'Invalid JSON']);
        }
    }
    