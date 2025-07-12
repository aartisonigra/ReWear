<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email']) || empty($input['password'])) {
    sendResponse(['error' => 'Email and password are required'], 400);
}

$email = trim(strtolower($input['email']));
$password = $input['password'];

try {
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT id, name, email, password_hash, role, points, status
        FROM users 
        WHERE email = ?
    ");
    
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !verifyPassword($password, $user['password_hash'])) {
        sendResponse(['error' => 'Invalid email or password'], 401);
    }
    
    if ($user['status'] !== 'active') {
        sendResponse(['error' => 'Account is suspended or inactive'], 403);
    }
    
    // Create JWT token
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + SESSION_TIMEOUT
    ];
    
    $token = createJWT($payload);
    
    // Create session record
    $sessionToken = generateToken();
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TIMEOUT);
    
    $stmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $user['id'],
        $sessionToken,
        $expiresAt,
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    // Update last login time (you might want to add this field to users table)
    // $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    // $stmt->execute([$user['id']]);
    
    sendResponse([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'points' => $user['points'],
            'role' => $user['role']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendResponse(['error' => 'Login failed. Please try again.'], 500);
}
?>