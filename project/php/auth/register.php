<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['name', 'email', 'password'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendResponse(['error' => "Field '$field' is required"], 400);
    }
}

$name = trim($input['name']);
$email = trim(strtolower($input['email']));
$password = $input['password'];
$confirmPassword = $input['confirmPassword'] ?? '';

// Validation
if (strlen($name) < 2 || strlen($name) > 100) {
    sendResponse(['error' => 'Name must be between 2 and 100 characters'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(['error' => 'Invalid email format'], 400);
}

if (strlen($password) < 6) {
    sendResponse(['error' => 'Password must be at least 6 characters'], 400);
}

if ($password !== $confirmPassword) {
    sendResponse(['error' => 'Passwords do not match'], 400);
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        sendResponse(['error' => 'Email already registered'], 409);
    }
    
    // Create new user
    $passwordHash = hashPassword($password);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password_hash, points) 
        VALUES (?, ?, ?, ?)
    ");
    
    $stmt->execute([$name, $email, $passwordHash, SIGNUP_BONUS_POINTS]);
    $userId = $pdo->lastInsertId();
    
    // Create JWT token
    $payload = [
        'user_id' => $userId,
        'email' => $email,
        'role' => 'user',
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
        $userId,
        $sessionToken,
        $expiresAt,
        $_SERVER['REMOTE_ADDR'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    // Log the signup bonus transaction (handled by trigger)
    
    sendResponse([
        'success' => true,
        'message' => 'Registration successful',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'points' => SIGNUP_BONUS_POINTS,
            'role' => 'user'
        ]
    ], 201);
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    sendResponse(['error' => 'Registration failed. Please try again.'], 500);
}
?>