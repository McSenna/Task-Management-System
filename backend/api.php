<?php
include_once './config/database.php';
include_once './header.php';

header('Content-Type: application/json');
$res = ['error' => false];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch($action) {
    case 'fetch':
        include './data/fetch.php';
        fetchData();
        break;

    case 'delete':
        include './data/delete.php';
        deleteUser();
        break;

    case 'update':
        include './data/update.php';
        updateUser();
        break;

    case 'insert':
        include './data/insert.php';
        insertUser();
        break;

    case 'login':
        include './data/login.php';
        Login();
        break;
        
    case 'get_profile':   
        include './data/get_profile.php';
        get_profile();
        break;

    case 'update_profile':  
        include './data/update_profile.php';
        update_profile();
        break;

    case 'get_session_user':
        include './data/get_session.php';
        getSessionUser();
        break;

    case 'create_task':
        include './data/create_task.php';
        createTask();
        break;

    case 'get_tasks':       
        include './data/get_task.php';  
        get_tasks();             
        break;

    case 'user_get_tasks':       
        include './data/user_get_task.php';  
        get_tasks();             
        break;

    case 'update_task_status':
        include './data/update_task.php';
        updateTaskStatus();
        break;

    case 'get_calendar_tasks':
        include './data/get_calendar_task.php';
        getCalendarTasks();
        break; 
            
    case 'store_logs':
        include './data/store_logs.php';
        storeLogs(); 
        break; 
            
    case 'fetch_logs':
        include './data/fetch_logs.php';
        fetchLogs(); 
        break; 
            
    case 'forgot_password':
        include './data/forgot_password.php';
        forgot_password();
        break;
        
    case 'verify_token':
        include './data/verify_token.php';
        verify_token();
        break;
        
    case 'reset_password':
        include './data/reset_password.php';
        reset_password();
        break;
        
    case 'create_task_status_request':
        include './data/task_status_request.php';
        createTaskStatusRequest();
        break;

    case 'get_task_status_requests':
        include './data/task_status_request.php';
        getTaskStatusRequests();
        break;

    case 'handle_task_status_request':
        include './data/task_status_request.php';
        handleTaskStatusRequest();
        break;

    case 'get_notifications':
        include './data/notifications.php';
        get_notifications();
        break;

    case 'mark_notification_read':
        include './data/notifications.php';
        mark_notification_read();
        break;

    case 'mark_all_notifications_read':
        include './data/notifications.php';
        mark_all_notifications_read();
        break;

    default:
        $res = [
            'type' => 'error',
            'message' => 'Invalid action'
        ];
        echo json_encode($res);
        break;
}
?>