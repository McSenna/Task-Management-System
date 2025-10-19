<?php
include_once '../config/database.php';

function reset_password() {
    global $conn;
    $response = ['error' => false];
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['email']) || !isset($data['password']) || !isset($data['token'])) {
        $response = [
            'error' => true,
            'message' => 'Missing required fields'
        ];
        echo json_encode($response);
        return;
    }
    
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];
    $token = mysqli_real_escape_string($conn, $data['token']);
    $current_time = date('Y-m-d H:i:s');
    
    // Verify token exists and is not expired
    $token_query = "SELECT * FROM password_reset_tokens 
                   WHERE email = '$email' 
                   AND token = '$token' 
                   AND expiry > '$current_time'";
    
    $token_result = mysqli_query($conn, $token_query);
    
    if (mysqli_num_rows($token_result) == 0) {
        $response = [
            'error' => true,
            'message' => 'Invalid or expired token. Please request a new password reset.'
        ];
        echo json_encode($response);
        return;
    }
    
    // Verify email exists
    $user_query = "SELECT user_id FROM users WHERE email = '$email'";
    $user_result = mysqli_query($conn, $user_query);
    
    if (mysqli_num_rows($user_result) == 0) {
        $response = [
            'error' => true,
            'message' => 'No account found with this email address'
        ];
        echo json_encode($response);
        return;
    }
    
    // Update password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    $update_query = "UPDATE users SET password = '$hashed_password' WHERE email = '$email'";
    
    if (mysqli_query($conn, $update_query)) {
        // Delete the used token
        $delete_query = "DELETE FROM password_reset_tokens WHERE email = '$email'";
        mysqli_query($conn, $delete_query);
        
        $response = [
            'error' => false,
            'message' => 'Password has been successfully reset. You can now login with your new password.'
        ];
    } else {
        $response = [
            'error' => true,
            'message' => 'Failed to reset password. Please try again.'
        ];
    }
    
    echo json_encode($response);
}
?>