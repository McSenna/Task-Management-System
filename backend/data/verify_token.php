<?php
include_once '../config/database.php';

// New function to verify token validity
function verify_token() {
    global $conn;
    $response = ['error' => false];
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['email']) || !isset($data['token'])) {
        $response = [
            'error' => true,
            'message' => 'Email and token are required'
        ];
        echo json_encode($response);
        return;
    }
    
    $email = mysqli_real_escape_string($conn, $data['email']);
    $token = mysqli_real_escape_string($conn, $data['token']);
    $current_time = date('Y-m-d H:i:s');
    
    // Check if token exists and is not expired
    $query = "SELECT * FROM password_reset_tokens 
             WHERE email = '$email' 
             AND token = '$token' 
             AND expiry > '$current_time'";
             
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        $response = [
            'error' => true,
            'message' => 'Invalid or expired token. Please request a new password reset.'
        ];
    } else {
        $response = [
            'error' => false,
            'message' => 'Token is valid.'
        ];
    }
    
    echo json_encode($response);
}
?>