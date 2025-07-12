<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();

try {
    // Get the session token from Authorization header
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        
        // In a more sophisticated system, you would decode the JWT to get session info
        // For now, we'll just delete all sessions for this user
        $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Logout successful'
    ]);
    
} catch (PDOException $e) {
    error_log("Logout error: " . $e->getMessage());
    sendResponse(['error' => 'Logout failed'], 500);
}
?>