<?php
    
    function fetchLogs() {
        global $connect;
        $stmt = $connect->prepare("SELECT action, timestamp FROM activity_logs");
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
        $data = [];
        while($user = $result->fetch_assoc()) {
            $data[] = $user;
        }
        echo json_encode($data);
    }
    