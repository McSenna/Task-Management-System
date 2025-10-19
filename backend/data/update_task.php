<?php 
    
function updateTaskStatus() {
    global $connect;
    
    header('Content-Type: application/json');
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if(!$data || !isset($data['task_id']) || !isset($data['status'])) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request']);
        return;
    }
    
    $taskId = $data['task_id'];
    $status = $data['status'];
    
    $stmt = $connect->prepare("UPDATE tasks SET status = ? WHERE task_id = ?");
    $stmt->bind_param("ss", $status, $taskId);
    
    if($stmt->execute()) {
        echo json_encode([
            'type' => 'success',
            'message' => 'Task status updated successfully'
        ]);
    } else {
        echo json_encode([
            'type' => 'error',
            'message' => 'Failed to update task status: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
}