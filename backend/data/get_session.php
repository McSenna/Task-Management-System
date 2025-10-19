<?php

function getSessionUser() {
    global $connect;
    
    header('Content-Type: application/json');
    session_start();

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'User not logged in']);
        return;
    }

    $user_id = $_SESSION['user_id'];

    $checkDeptQuery = "SHOW COLUMNS FROM users LIKE 'department'";
    $deptResult = $connect->query($checkDeptQuery);
    if ($deptResult->num_rows === 0) {
        $connect->query("ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL");
    }
    
    $checkLocQuery = "SHOW COLUMNS FROM users LIKE 'location'";
    $locResult = $connect->query($checkLocQuery);
    if ($locResult->num_rows === 0) {
        $connect->query("ALTER TABLE users ADD COLUMN location VARCHAR(100) NULL");
    }

    $stmt = $connect->prepare("SELECT user_id, username, email, role, department, contact, location FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        echo json_encode(['type' => 'success', 'user' => $user]);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'User not found']);
    }
    
    $stmt->close();
}