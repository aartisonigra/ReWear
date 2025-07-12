<?php
require_once '../config.php';

$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user profile
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.id, u.name, u.email, u.points, u.profile_image, 
                u.location, u.bio, u.created_at,
                COUNT(DISTINCT i.id) as items_listed,
                COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as swaps_completed,
                AVG(r.rating) as avg_rating,
                COUNT(DISTINCT r.id) as total_reviews
            FROM users u
            LEFT JOIN items i ON u.id = i.user_id AND i.status IN ('approved', 'swapped', 'redeemed')
            LEFT JOIN swaps s ON (u.id = s.requester_id OR u.id = s.owner_id)
            LEFT JOIN reviews r ON u.id = r.reviewed_id
            WHERE u.id = ?
            GROUP BY u.id
        ");
        
        $stmt->execute([$user['user_id']]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            sendResponse(['error' => 'User not found'], 404);
        }
        
        // Get recent activity
        $stmt = $pdo->prepare("
            SELECT 
                'item_listed' as type,
                i.title as item_title,
                i.created_at as activity_date
            FROM items i
            WHERE i.user_id = ? AND i.status != 'rejected'
            
            UNION ALL
            
            SELECT 
                'swap_completed' as type,
                CONCAT('Swap with ', u.name) as item_title,
                s.completed_at as activity_date
            FROM swaps s
            JOIN users u ON (
                CASE 
                    WHEN s.requester_id = ? THEN s.owner_id 
                    ELSE s.requester_id 
                END = u.id
            )
            WHERE (s.requester_id = ? OR s.owner_id = ?) 
            AND s.status = 'completed'
            
            ORDER BY activity_date DESC
            LIMIT 10
        ");
        
        $stmt->execute([
            $user['user_id'], 
            $user['user_id'], 
            $user['user_id'], 
            $user['user_id']
        ]);
        $activities = $stmt->fetchAll();
        
        sendResponse([
            'success' => true,
            'profile' => [
                'id' => intval($profile['id']),
                'name' => $profile['name'],
                'email' => $profile['email'],
                'points' => intval($profile['points']),
                'profile_image' => $profile['profile_image'],
                'location' => $profile['location'],
                'bio' => $profile['bio'],
                'items_listed' => intval($profile['items_listed']),
                'swaps_completed' => intval($profile['swaps_completed']),
                'avg_rating' => $profile['avg_rating'] ? round($profile['avg_rating'], 1) : null,
                'total_reviews' => intval($profile['total_reviews']),
                'member_since' => $profile['created_at']
            ],
            'recent_activity' => $activities
        ]);
        
    } catch (PDOException $e) {
        error_log("Profile fetch error: " . $e->getMessage());
        sendResponse(['error' => 'Failed to fetch profile'], 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update user profile
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = trim($input['name'] ?? '');
    $location = trim($input['location'] ?? '');
    $bio = trim($input['bio'] ?? '');
    
    // Validation
    if (strlen($name) < 2 || strlen($name) > 100) {
        sendResponse(['error' => 'Name must be between 2 and 100 characters'], 400);
    }
    
    if (strlen($location) > 100) {
        sendResponse(['error' => 'Location must be less than 100 characters'], 400);
    }
    
    if (strlen($bio) > 500) {
        sendResponse(['error' => 'Bio must be less than 500 characters'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE users 
            SET name = ?, location = ?, bio = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([$name, $location, $bio, $user['user_id']]);
        
        sendResponse([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
        
    } catch (PDOException $e) {
        error_log("Profile update error: " . $e->getMessage());
        sendResponse(['error' => 'Failed to update profile'], 500);
    }
    
} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>