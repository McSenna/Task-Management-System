<?php 
    function storeLogs() {
        global $connect;

        $data = json_decode(file_get_contents('php://input'), true);

        $user_id = $data['user_id'];
        $action = $data['action'];

        $sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
        $stmt = $connect->prepare($sql);
        $stmt->bind_param("is", $user_id, $action);

        if ($stmt->execute()) {
            echo json_encode(['type' => 'success', 'message' => 'Log stored successfully.']);
        } else {
            echo json_encode(['type' => 'error', 'message' => 'Failed to store log.']);
        }

        $stmt->close();
        $connect->close();

    }