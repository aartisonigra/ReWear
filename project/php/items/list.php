<?php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

// Get query parameters
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(1, intval($_GET['limit'] ?? 12)));
$offset = ($page - 1) * $limit;

$search = trim($_GET['search'] ?? '');
$categoryId = intval($_GET['category_id'] ?? 0);
$size = trim($_GET['size'] ?? '');
$condition = trim($_GET['condition'] ?? '');
$minPoints = intval($_GET['min_points'] ?? 0);
$maxPoints = intval($_GET['max_points'] ?? 0);
$allowSwaps = isset($_GET['allow_swaps']) ? (bool)$_GET['allow_swaps'] : null;
$allowPoints = isset($_GET['allow_points']) ? (bool)$_GET['allow_points'] : null;
$sortBy = $_GET['sort'] ?? 'newest';

// Build WHERE clause
$whereConditions = ["i.status = 'approved'"];
$params = [];

if (!empty($search)) {
    $whereConditions[] = "MATCH(i.title, i.description) AGAINST(? IN NATURAL LANGUAGE MODE)";
    $params[] = $search;
}

if ($categoryId > 0) {
    $whereConditions[] = "i.category_id = ?";
    $params[] = $categoryId;
}

if (!empty($size)) {
    $whereConditions[] = "i.size = ?";
    $params[] = $size;
}

if (!empty($condition)) {
    $whereConditions[] = "i.condition_type = ?";
    $params[] = $condition;
}

if ($minPoints > 0) {
    $whereConditions[] = "i.point_value >= ?";
    $params[] = $minPoints;
}

if ($maxPoints > 0) {
    $whereConditions[] = "i.point_value <= ?";
    $params[] = $maxPoints;
}

if ($allowSwaps !== null) {
    $whereConditions[] = "i.allow_swaps = ?";
    $params[] = $allowSwaps ? 1 : 0;
}

if ($allowPoints !== null) {
    $whereConditions[] = "i.allow_points = ?";
    $params[] = $allowPoints ? 1 : 0;
}

// Build ORDER BY clause
$orderBy = "i.created_at DESC"; // default
switch ($sortBy) {
    case 'oldest':
        $orderBy = "i.created_at ASC";
        break;
    case 'points_low':
        $orderBy = "i.point_value ASC";
        break;
    case 'points_high':
        $orderBy = "i.point_value DESC";
        break;
    case 'views':
        $orderBy = "i.views DESC";
        break;
    case 'likes':
        $orderBy = "i.likes DESC";
        break;
}

$whereClause = implode(' AND ', $whereConditions);

try {
    // Get total count
    $countSql = "
        SELECT COUNT(*) as total
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN users u ON i.user_id = u.id
        WHERE $whereClause
    ";
    
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $totalItems = $stmt->fetch()['total'];
    
    // Get items
    $sql = "
        SELECT 
            i.id,
            i.title,
            i.description,
            i.size,
            i.condition_type,
            i.point_value,
            i.allow_swaps,
            i.allow_points,
            i.views,
            i.likes,
            i.tags,
            i.created_at,
            c.name as category_name,
            u.name as user_name,
            u.location as user_location,
            GROUP_CONCAT(
                CONCAT(img.filename, ':', img.is_primary, ':', img.order_index)
                ORDER BY img.order_index
            ) as images
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN users u ON i.user_id = u.id
        LEFT JOIN item_images img ON i.id = img.item_id
        WHERE $whereClause
        GROUP BY i.id
        ORDER BY $orderBy
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
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
            'views' => intval($item['views']),
            'likes' => intval($item['likes']),
            'tags' => json_decode($item['tags'] ?? '[]'),
            'category' => $item['category_name'],
            'user' => [
                'name' => $item['user_name'],
                'location' => $item['user_location']
            ],
            'images' => $images,
            'created_at' => $item['created_at']
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
    error_log("Items list error: " . $e->getMessage());
    sendResponse(['error' => 'Failed to fetch items'], 500);
}
?>