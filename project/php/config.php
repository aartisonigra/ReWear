<?php
// Database configuration for ReWear platform

// Database connection settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'rewear_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_CHARSET', 'utf8mb4');

// Application settings
define('APP_NAME', 'ReWear');
define('APP_URL', 'http://localhost');
define('UPLOAD_PATH', 'uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Security settings
define('JWT_SECRET', 'your-secret-key-here'); // Change this in production
define('PASSWORD_SALT', 'your-salt-here'); // Change this in production
define('SESSION_TIMEOUT', 24 * 60 * 60); // 24 hours

// Email settings (for notifications)
define('SMTP_HOST', 'your-smtp-host');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@domain.com');
define('SMTP_PASS', 'your-email-password');
define('FROM_EMAIL', 'noreply@rewear.com');
define('FROM_NAME', 'ReWear Platform');

// Point system settings
define('SIGNUP_BONUS_POINTS', 100);
define('SUCCESSFUL_SWAP_POINTS', 50);
define('ITEM_LISTING_POINTS', 10);

// CORS settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Helper functions
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function hashPassword($password) {
    return password_hash($password . PASSWORD_SALT, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password . PASSWORD_SALT, $hash);
}

function createJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    [$header, $payload, $signature] = $parts;
    
    $expectedSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    $expectedBase64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    if ($signature !== $expectedBase64Signature) {
        return false;
    }
    
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    if ($decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}

function validateImageUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Upload error occurred'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['success' => false, 'message' => 'File too large'];
    }
    
    $imageInfo = getimagesize($file['tmp_name']);
    if (!$imageInfo) {
        return ['success' => false, 'message' => 'Invalid image file'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_IMAGE_TYPES)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }
    
    return ['success' => true];
}

function uploadImage($file, $directory = 'items') {
    $validation = validateImageUpload($file);
    if (!$validation['success']) {
        return $validation;
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = generateToken(16) . '.' . $extension;
    $uploadDir = UPLOAD_PATH . $directory . '/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filepath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return [
            'success' => true,
            'filename' => $filename,
            'path' => $filepath,
            'url' => APP_URL . '/' . $filepath
        ];
    }
    
    return ['success' => false, 'message' => 'Failed to save file'];
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function requireAuth() {
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendResponse(['error' => 'Authorization required'], 401);
    }
    
    $token = $matches[1];
    $payload = verifyJWT($token);
    
    if (!$payload) {
        sendResponse(['error' => 'Invalid token'], 401);
    }
    
    return $payload;
}

function requireAdmin() {
    $user = requireAuth();
    
    if ($user['role'] !== 'admin') {
        sendResponse(['error' => 'Admin access required'], 403);
    }
    
    return $user;
}
?>