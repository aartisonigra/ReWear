<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = requireAuth();

// Check if request is multipart/form-data (file upload)
$isMultipart = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;

if ($isMultipart) {
    $input = $_POST;
    $files = $_FILES;
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    $files = [];
}

// Validate required fields
$required_fields = ['title', 'description', 'category_id', 'size', 'condition_type'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        sendResponse(['error' => "Field '$field' is required"], 400);
    }
}

$title = trim($input['title']);
$description = trim($input['description']);
$categoryId = intval($input['category_id']);
$size = trim($input['size']);
$conditionType = $input['condition_type'];
$pointValue = isset($input['point_value']) ? intval($input['point_value']) : null;
$allowSwaps = isset($input['allow_swaps']) ? (bool)$input['allow_swaps'] : true;
$allowPoints = isset($input['allow_points']) ? (bool)$input['allow_points'] : true;
$tags = isset($input['tags']) ? $input['tags'] : '';

// Validation
if (strlen($title) < 3 || strlen($title) > 255) {
    sendResponse(['error' => 'Title must be between 3 and 255 characters'], 400);
}

if (strlen($description) < 10) {
    sendResponse(['error' => 'Description must be at least 10 characters'], 400);
}

if (!in_array($conditionType, ['new', 'like-new', 'good', 'fair'])) {
    sendResponse(['error' => 'Invalid condition type'], 400);
}

if (!$allowSwaps && !$allowPoints) {
    sendResponse(['error' => 'At least one exchange option must be enabled'], 400);
}

if ($allowPoints && $pointValue && $pointValue < 1) {
    sendResponse(['error' => 'Point value must be positive'], 400);
}

try {
    // Verify category exists
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    if (!$stmt->fetch()) {
        sendResponse(['error' => 'Invalid category'], 400);
    }
    
    // Process tags
    if (is_string($tags)) {
        $tagsArray = array_map('trim', explode(',', $tags));
        $tagsArray = array_filter($tagsArray);
        $tagsJson = json_encode($tagsArray);
    } else {
        $tagsJson = json_encode([]);
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Insert item
    $stmt = $pdo->prepare("
        INSERT INTO items (
            user_id, category_id, title, description, size, condition_type,
            point_value, allow_swaps, allow_points, tags, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $user['user_id'],
        $categoryId,
        $title,
        $description,
        $size,
        $conditionType,
        $pointValue,
        $allowSwaps,
        $allowPoints,
        $tagsJson
    ]);
    
    $itemId = $pdo->lastInsertId();
    
    // Handle image uploads
    $uploadedImages = [];
    if (isset($files['images'])) {
        $images = $files['images'];
        
        // Handle both single and multiple file uploads
        if (!is_array($images['name'])) {
            $images = [
                'name' => [$images['name']],
                'type' => [$images['type']],
                'tmp_name' => [$images['tmp_name']],
                'error' => [$images['error']],
                'size' => [$images['size']]
            ];
        }
        
        $imageCount = count($images['name']);
        if ($imageCount > 5) {
            throw new Exception('Maximum 5 images allowed');
        }
        
        for ($i = 0; $i < $imageCount; $i++) {
            if ($images['error'][$i] === UPLOAD_ERR_OK) {
                $imageFile = [
                    'name' => $images['name'][$i],
                    'type' => $images['type'][$i],
                    'tmp_name' => $images['tmp_name'][$i],
                    'error' => $images['error'][$i],
                    'size' => $images['size'][$i]
                ];
                
                $uploadResult = uploadImage($imageFile, 'items');
                
                if ($uploadResult['success']) {
                    // Insert image record
                    $stmt = $pdo->prepare("
                        INSERT INTO item_images (item_id, filename, file_path, is_primary, order_index)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    
                    $stmt->execute([
                        $itemId,
                        $uploadResult['filename'],
                        $uploadResult['path'],
                        $i === 0, // First image is primary
                        $i
                    ]);
                    
                    $uploadedImages[] = $uploadResult;
                } else {
                    throw new Exception($uploadResult['message']);
                }
            }
        }
    }
    
    // If no images uploaded, require at least one
    if (empty($uploadedImages)) {
        throw new Exception('At least one image is required');
    }
    
    $pdo->commit();
    
    sendResponse([
        'success' => true,
        'message' => 'Item created successfully and is pending approval',
        'item' => [
            'id' => $itemId,
            'title' => $title,
            'status' => 'pending',
            'images' => $uploadedImages
        ]
    ], 201);
    
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Item creation error: " . $e->getMessage());
    sendResponse(['error' => $e->getMessage()], 400);
} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Database error in item creation: " . $e->getMessage());
    sendResponse(['error' => 'Failed to create item. Please try again.'], 500);
}
?>