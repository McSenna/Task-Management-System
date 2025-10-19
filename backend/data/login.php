<?php 
        function verifyPassword($userId, $password) {
            global $connect;
            
            $stmt = $connect->prepare("SELECT password FROM users WHERE user_id = ?");
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                return password_verify($password, $user['password']);
            }
            
            return false;
        }
    
        function Login() {
            global $connect;
    
            header('Content-Type: application/json');
    
            $data = json_decode(file_get_contents('php://input'), true);
        
            if($data) {
                $email = $data['email'];
                $password = $data['password'];
                
                if($email && $password) {
                    $stmt = $connect->prepare("SELECT user_id, password, username, role, status FROM users WHERE email = ?");
                    $stmt->bind_param("s", $email);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    if($result->num_rows > 0) {
                        $user = $result->fetch_assoc();
                        
                        if($user['status'] !== 'Active') {
                            echo json_encode(['type' => 'error', 'message' => 'Your account is inactive. Please contact an administrator.']);
                            exit;
                        }
                        
                        if(password_verify($password, $user['password'])) {
                            session_start();
                            $_SESSION['user_id'] = $user['user_id'];
                            $_SESSION['username'] = $user['username'];
                            $_SESSION['role'] = $user['role'];
                            
                            unset($user['password']);
                            echo json_encode([
                                'type' => 'success', 
                                'message' => 'Login successful',
                                'user' => $user
                            ]);
                        } else {
                            echo json_encode(['type' => 'error', 'message' => 'Invalid password']);
                        }
                    } else {
                        echo json_encode(['type' => 'error', 'message' => 'No account found with this email']);
                    }
                    $stmt->close();
                } else {
                    echo json_encode(['type' => 'error', 'message' => 'Email and password are required']);
                }
            } else {
                echo json_encode(['type' => 'error', 'message' => 'Invalid request']);
            }
    
    
        }
    