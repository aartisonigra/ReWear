<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$ownerItemId = intval($input['owner_item_id'] ?? 0);
$swapType = $input['swap_type'] ?? ''; // 'direct' or 'points'
$requesterItemId = intval($input['requester_item_id'] ?? 0);
$pointsUsed = intval($input['points_used'] ?? 0);
$message = trim($input['message'] ?? '');

if ($ownerItemId <= 0) {
    sendResponse(['error' => 'Owner item ID is required'], 400);
}

if (!in_array($swapType, ['direct', 'points'])) {
    sendResponse(['error' => 'Invalid swap type'], 400);
}

if ($swapType === 'direct' && $requesterItemId <= 0) {
    sendResponse(['error' => 'Requester item ID is required for direct swaps'], 400);
}

if ($swapType === 'points' && $pointsUsed <= 0) {
    sendResponse(['error' => 'Points amount is required for point redemption'], 400);
}

try {
    $pdo->beginTransaction();
    
    // Get owner item details
    $stmt = $pdo->prepare("
        SELECT i.*, u.id as owner_id, u.name as owner_name
        FROM items i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ? AND i.status = 'approved'
    ");
    $stmt->execute([$ownerItemId]);
    $ownerItem = $stmt->fetch();
    
    if (!$ownerItem) {
        sendResponse(['error' => 'Item not found or not available'], 404);
    }
    
    // Check if user is trying to swap with their own item
    if ($ownerItem['owner_id'] == $user['user_id']) {
        sendResponse(['error' => 'Cannot swap with your own item'], 400);
    }
    
    // Validate swap type against item settings
    if ($swapType === 'direct' && !$ownerItem['allow_swaps']) {
        sendResponse(['error' => 'This item does not allow direct swaps'], 400);
    }
    
    if ($swapType === 'points' && !$ownerItem['allow_points']) {
        sendResponse(['error' => 'This item does not allow point redemption'], 400);
    }
    
    // For direct swaps, validate requester item
    if ($swapType === 'direct') {
        $stmt = $pdo->prepare("
            SELECT * FROM items 
            WHERE id = ? AND user_id = ? AND status = 'approved' AND allow_swaps = 1
        ");
        $stmt->execute([$requesterItemId, $user['user_id']]);
        $requesterItem = $stmt->fetch();
        
        if (!$requesterItem) {
            sendResponse(['error' => 'Your item not found or not available for swapping'], 404);
        }
    }
    
    // For points redemption, check user has enough points
    if ($swapType === 'points') {
        $stmt = $pdo->prepare("SELECT points FROM users WHERE id = ?");
        $stmt->execute([$user['user_id']]);
        $userPoints = $stmt->fetch()['points'] ?? 0;
        
        if ($userPoints < $pointsUsed) {
            sendResponse(['error' => 'Insufficient points'], 400);
        }
        
        if ($pointsUsed != $ownerItem['point_value']) {
            sendResponse(['error' => 'Incorrect point amount'], 400);
        }
    }
    
    // Check for existing pending swap for this item
    $stmt = $pdo->prepare("
        SELECT id FROM swaps 
        WHERE owner_item_id = ? AND status = 'pending'
    ");
    $stmt->execute([$ownerItemId]);
    
    if ($stmt->fetch()) {
        sendResponse(['error' => 'This item already has a pending swap request'], 409);
    }
    
    // Create swap request
    $stmt = $pdo->prepare("
        INSERT INTO swaps (
            requester_id, owner_id, requester_item_id, owner_item_id,
            swap_type, points_used, message, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $user['user_id'],
        $ownerItem['owner_id'],
        $swapType === 'direct' ? $requesterItemId : null,
        $ownerItemId,
        $swapType,
        $swapType === 'points' ? $pointsUsed : null,
        $message
    ]);
    
    $swapId = $pdo->lastInsertId();
    
    // Create notification for item owner
    $requesterName = $user['name'] ?? 'A user';
    $notificationTitle = 'New Swap Request!';
    $notificationMessage = $swapType === 'direct' ?
        "$requesterName wants to swap their item for your '{$ownerItem['title']}'." :
        "$requesterName wants to redeem your '{$ownerItem['title']}' for {$pointsUsed} points.";
    
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, related_id)
        VALUES (?, 'swap_request', ?, ?, ?)
    ");
    $stmt->execute([
        $ownerItem['owner_id'],
        $notificationTitle,
        $notificationMessage,
        $swapId
    ]);
    
    $pdo->commit();
    
    sendResponse([
        'success' => true,
        'message' => 'Swap request created successfully',
        'swap_id' => $swapId
    ], 201);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Swap creation error: " . $e->getMessage());
    sendResponse(['error' => 'Failed to create swap request'], 500);
}
?>