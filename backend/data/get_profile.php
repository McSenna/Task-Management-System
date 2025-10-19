<?php    
    function get_profile() {
        global $connect;
        if (!isset($_GET['user_id'])) {
            echo json_encode([
                'type' => 'error',
                'message' => 'User ID is required'
            ]);
            return;
        }       
        $userId = $_GET['user_id'];
        
        $stmt = $connect->prepare("
            SELECT user_id, username, email, role, status, contact, 
                   department, location, created_at, updated_at 
            FROM users 
            WHERE user_id = ?
        ");
        
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            echo json_encode([
                'type' => 'error',
                'message' => 'User not found'
            ]);
            return;
        }
        
        $user = $result->fetch_assoc();
        $stmt->close();
        
        unset($user['password']);
        
        echo json_encode([
            'type' => 'success',
            'user' => $user
        ]);
    }