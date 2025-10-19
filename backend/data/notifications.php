<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/notification_manager.php';

function get_notifications() {
    global $connect;
    ensureNotificationTables();

    $userId = null;
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (isset($_SESSION['user_id'])) $userId = $_SESSION['user_id'];
    if (!$userId && isset($_GET['user_id'])) $userId = $_GET['user_id'];
    if (!$userId) {
        echo json_encode(['type' => 'error', 'message' => 'Unauthorized']);
        return;
    }

    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;

    $stmt = $connect->prepare("SELECT id, user_id, task_id, type, title, message, severity, created_at, read_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
    $stmt->bind_param('si', $userId, $limit);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    $stmt->close();

    $countStmt = $connect->prepare("SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read_at IS NULL");
    $countStmt->bind_param('s', $userId);
    $countStmt->execute();
    $countRes = $countStmt->get_result();
    $unread = 0;
    if ($r = $countRes->fetch_assoc()) $unread = intval($r['c']);
    $countStmt->close();

    echo json_encode(['type' => 'success', 'notifications' => $rows, 'unread' => $unread]);
}

function mark_notification_read() {
    global $connect;
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request']);
        return;
    }

    $id = intval($data['id']);
    $stmt = $connect->prepare("UPDATE notifications SET read_at = NOW() WHERE id = ?");
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    $stmt->close();

    echo json_encode(['type' => $ok ? 'success' : 'error']);
}

function mark_all_notifications_read() {
    global $connect;
    $userId = null;
    if (session_status() === PHP_SESSION_NONE) session_start();
    if (isset($_SESSION['user_id'])) $userId = $_SESSION['user_id'];
    if (!$userId && isset($_GET['user_id'])) $userId = $_GET['user_id'];
    if (!$userId) {
        echo json_encode(['type' => 'error', 'message' => 'Unauthorized']);
        return;
    }

    $stmt = $connect->prepare("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL");
    $stmt->bind_param('s', $userId);
    $ok = $stmt->execute();
    $stmt->close();

    echo json_encode(['type' => $ok ? 'success' : 'error']);
}
