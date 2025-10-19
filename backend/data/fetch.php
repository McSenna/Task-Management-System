<?php
    
    function fetchData() {
        global $connect;
        $stmt = $connect->prepare("SELECT id, user_id, username, email, role, status, contact, created_at, updated_at FROM users");
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
        $data = [];
        while($user = $result->fetch_assoc()) {
            $data[] = $user;
        }
        echo json_encode($data);
    }
    