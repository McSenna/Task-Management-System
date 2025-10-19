<?php
     function deleteUser() {
        global $connect;
        $data = json_decode(file_get_contents('php://input'), true);
        if(isset($data['user_id'])) {
            $userId = $data['user_id'];
            $stmt = $connect->prepare("DELETE FROM users WHERE user_id = ?");
            $stmt->bind_param('s', $userId);
            $stmt->execute();
            $stmt->close();
            $json = [
                'type' => 'success',
                'message' => 'User deleted successfully'
            ];
        } else {
            $json = [
                'type' => 'error',
                'message' => 'User ID not provided'
            ];
        }
        echo json_encode($json);
    }