<?php
require_once '../config.php';

$user = requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get pending items for review
    $status = $_GET['status'] ?? 'pending';
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(1, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    if (!in_array($status, ['pending', 'approved', 'rejected'])) {
        sendResponse(['error' => 'Invalid status'], 400);
    }
    
    try {
        // Get total count
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total 
            FROM items 
            WHERE status = ?
        ");
        $stmt->execute([$status]);
        $totalItems = $stmt->fetch()['total'];
        
        // Get items
        $stmt = $pdo->prepare("
            SELECT 
                i.id,
                i.title,
                i.description,
                i.size,
                i.condition_type,
                i.point_value,
                i.allow_swaps,
                i.allow_points,
                i.tags,
                i.created_at,
                i.approved_at,
                c.name as category_name,
                u.name as user_name,
                u.email as user_email,
                approver.name as approved_by_name,
                GROUP_CONCAT(
                    CONCAT(img.filename, ':', img.is_primary, ':', img.order_index)
                    ORDER BY img.order_index
                ) as images
            FROM items i
            JOIN categories c ON i.category_id = c.id
            JOIN users u ON i.user_id = u.id
            LEFT JOIN users approver ON i.approved_by = approver.id
            LEFT JOIN item_images img ON i.id = img.item_id
            WHERE i.status = ?
            GROUP BY i.id
            ORDER BY i.created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([$status, $limit, $offset]);
        $items = $stmt->fetchAll();
        
        // Process items
        $processedItems = [];
        foreach ($items as $item) {
            $images = [];
            if ($item['images']) {
                $imageData = explode(',', $item['images']);
                foreach ($imageData as $imageInfo) {
                    [$filename, $isPrimary, $orderIndex] = explode(':', $imageInfo);
                    $images[] = [
                        'filename' => $filename,
                        'url' => APP_URL . '/' . UPLOAD_PATH . 'items/' . $filename,
                        'is_primary' => (bool)$isPrimary,
                        'order_index' => intval($orderIndex)
                    ];
                }
            }
            
            $processedItems[] = [
                'id' => intval($item['id']),
                'title' => $item['title'],
                'description' => $item['description'],
                'size' => $item['size'],
                'condition' => $item['condition_type'],
                'point_value' => intval($item['point_value']),
                'allow_swaps' => (bool)$item['allow_swaps'],
                'allow_points' => (bool)$item['allow_points'],
                'tags' => json_decode($item['tags'] ?? '[]'),
                'category' => $item['category_name'],
                'user' => [
                    'name' => $item['user_name'],
                    'email' => $item['user_email']
                ],
                'images' => $images,
                'created_at' => $item['created_at'],
                'approved_at' => $item['approved_at'],
                'approved_by' => $item['approved_by_name']
            ];
        }
        
        $totalPages = ceil($totalItems / $limit);
        
        sendResponse([
            'success' => true,
            'items' => $processedItems,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total_items' => intval($totalItems),
                'total_pages' => $totalPages,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Admin items fetch error: " . $e->getMessage());
        sendResponse(['error' => 'Failed to fetch items'], 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Approve or reject item
    $input = json_decode(file_get_contents('php://input'), true);
    
    $itemId = intval($input['item_id'] ?? 0);
    $action = $input['action'] ?? '';
    $reason = trim($input['reason'] ?? '');
    
    if ($itemId <= 0) {
        sendResponse(['error' => 'Invalid item ID'], 400);
    }
    
    if (!in_array($action, ['approve', 'reject'])) {
        sendResponse(['error' => 'Invalid action'], 400);
    }
    
    if ($action === 'reject' && empty($reason)) {
        sendResponse(['error' => 'Reason is required for rejection'], 400);
    }
    
    try {
        // Check if item exists and is pending
        $stmt = $pdo->prepare("
            SELECT id, user_id, title, status 
            FROM items 
            WHERE id = ? AND status = 'pending'
        ");
        $stmt->execute([$itemId]);
        $item = $stmt->fetch();
        
        if (!$item) {
            sendResponse(['error' => 'Item not found or already processed'], 404);
        }
        
        $newStatus = $action === 'approve' ? 'approved' : 'rejected';
        
        $pdo->beginTransaction();
        
        // Update item status
        $stmt = $pdo->prepare("
            UPDATE items 
            SET status = ?, approved_at = NOW(), approved_by = ?
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $user['user_id'], $itemId]);
        
        // Log admin action
        $stmt = $pdo->prepare("
            INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address)
            VALUES (?, ?, 'item', ?, ?, ?)
        ");
        
        $details = json_encode([
            'action' => $action,
            'item_title' => $item['title'],
            'reason' => $reason
        ]);
        
        $stmt->execute([
            $user['user_id'],
            "item_$action",
            $itemId,
            $details,
            $_SERVER['REMOTE_ADDR'] ?? ''
        ]);
        
        // Create notification for user
        $notificationType = $action === 'approve' ? 'item_approved' : 'item_rejected';
        $notificationTitle = $action === 'approve' ? 
            'Item Approved!' : 
            'Item Rejected';
        $notificationMessage = $action === 'approve' ? 
            "Your item '{$item['title']}' has been approved and is now live." :
            "Your item '{$item['title']}' was rejected. Reason: $reason";
        
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, title, message, related_id)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $item['user_id'],
            $notificationType,
            $notificationTitle,
            $notificationMessage,
            $itemId
        ]);
        
        $pdo->commit();
        
        sendResponse([
            'success' => true,
            'message' => ucfirst($action) . ' successful',
            'item_id' => $itemId,
            'new_status' => $newStatus
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Admin item action error: " . $e->getMessage());
        sendResponse(['error' => 'Failed to process item'], 500);
    }
    
} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>