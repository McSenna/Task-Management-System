<?php
include_once '../config/database.php';

function forgot_password() {
    global $conn;
    $response = ['error' => false];
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['email'])) {
        $response = [
            'error' => true,
            'message' => 'Email is required'
        ];
        echo json_encode($response);
        return;
    }
    
    $email = mysqli_real_escape_string($conn, $data['email']);
    
    $query = "SELECT user_id, username FROM users WHERE email = '$email'";
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        $response = [
            'error' => true,
            'message' => 'No account found with this email address'
        ];
        echo json_encode($response);
        return;
    }
    

    $user = mysqli_fetch_assoc($result);
    $token = bin2hex(random_bytes(32)); // Generate secure token
    $expiry = date('Y-m-d H:i:s', strtotime('+1 hour')); 
    
    $delete_query = "DELETE FROM password_reset_tokens WHERE email = '$email'";
    mysqli_query($conn, $delete_query);
    
    $insert_query = "INSERT INTO password_reset_tokens (email, token, expiry) VALUES ('$email', '$token', '$expiry')";
    
    if (mysqli_query($conn, $insert_query)) {
        $reset_link = "http://localhost:3000/reset-password?token=$token&email=$email";
        
        $response = [
            'error' => false,
            'message' => 'Password reset link generated successfully.',
            'reset_link' => $reset_link,
            'token' => $token  
        ];
    } else {
        $response = [
            'error' => true,
            'message' => 'Failed to process your request. Please try again later.'
        ];
    }
    
    echo json_encode($response);
}
?>