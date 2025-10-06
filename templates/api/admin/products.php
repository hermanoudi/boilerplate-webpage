<?php
// LL Magazine - Admin Products API
// CRUD operations for products (protected by JWT)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../JWT.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify JWT token
$token = JWT::getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit();
}

$secret = defined('JWT_SECRET') ? JWT_SECRET : 'your-secret-key-change-this';
$payload = JWT::decode($token, $secret);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid or expired token']);
    exit();
}

// Get database connection
try {
    $pdo = getDBConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Find product ID in path (last numeric part)
$productId = null;
for ($i = count($pathParts) - 1; $i >= 0; $i--) {
    if (is_numeric($pathParts[$i])) {
        $productId = (int)$pathParts[$i];
        break;
    }
}

// Debug logging
error_log("API Debug - Method: $method, Path: $path, Product ID: " . ($productId ?? 'none'));

// Route handling
switch ($method) {
    case 'GET':
        if ($productId) {
            getProduct($pdo, $productId);
        } else {
            getAllProducts($pdo);
        }
        break;

    case 'POST':
        createProduct($pdo);
        break;

    case 'PUT':
        if ($productId) {
            updateProduct($pdo, $productId);
        } else {
            http_response_code(400);
            echo json_encode([
                'error' => 'Product ID required',
                'debug' => ['path' => $path, 'pathParts' => $pathParts]
            ]);
        }
        break;

    case 'DELETE':
        if ($productId) {
            deleteProduct($pdo, $productId);
        } else {
            http_response_code(400);
            echo json_encode([
                'error' => 'Product ID required',
                'debug' => ['path' => $path, 'pathParts' => $pathParts]
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

/**
 * Get all products
 */
function getAllProducts($pdo) {
    $sql = "SELECT
                id,
                name,
                category,
                price,
                original_price as originalPrice,
                discount,
                image,
                description,
                colors,
                sizes,
                in_stock as inStock,
                featured,
                created_at,
                updated_at
            FROM products
            ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode JSON fields
    $products = array_map(function($product) {
        $product['colors'] = $product['colors'] ? json_decode($product['colors'], true) : null;
        $product['sizes'] = $product['sizes'] ? json_decode($product['sizes'], true) : null;
        $product['inStock'] = (bool)$product['inStock'];
        $product['featured'] = (bool)$product['featured'];
        return $product;
    }, $products);

    echo json_encode(['success' => true, 'products' => $products]);
}

/**
 * Get single product
 */
function getProduct($pdo, $id) {
    $sql = "SELECT * FROM products WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }

    $product['colors'] = $product['colors'] ? json_decode($product['colors'], true) : null;
    $product['sizes'] = $product['sizes'] ? json_decode($product['sizes'], true) : null;
    $product['in_stock'] = (bool)$product['in_stock'];
    $product['featured'] = (bool)$product['featured'];

    echo json_encode(['success' => true, 'product' => $product]);
}

/**
 * Create new product
 */
function createProduct($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required = ['name', 'category', 'price', 'image', 'description'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Field '$field' is required"]);
            return;
        }
    }

    // Prepare data
    $colors = isset($input['colors']) ? json_encode($input['colors']) : json_encode([]);
    $sizes = isset($input['sizes']) ? json_encode($input['sizes']) : json_encode(['PP', 'P', 'M', 'G', 'GG']);

    $sql = "INSERT INTO products (
                name, category, price, original_price, discount,
                image, description, colors, sizes, in_stock, featured
            ) VALUES (
                :name, :category, :price, :original_price, :discount,
                :image, :description, :colors, :sizes, :in_stock, :featured
            )";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'name' => sanitizeInput($input['name']),
        'category' => sanitizeInput($input['category']),
        'price' => sanitizeInput($input['price']),
        'original_price' => !empty($input['originalPrice']) ? sanitizeInput($input['originalPrice']) : null,
        'discount' => !empty($input['discount']) ? (int)$input['discount'] : null,
        'image' => sanitizeInput($input['image']),
        'description' => sanitizeInput($input['description']),
        'colors' => $colors,
        'sizes' => $sizes,
        'in_stock' => isset($input['inStock']) ? (int)$input['inStock'] : 1,
        'featured' => isset($input['featured']) ? (int)$input['featured'] : 0
    ]);

    if ($result) {
        $productId = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'product_id' => $productId
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product']);
    }
}

/**
 * Update existing product
 */
function updateProduct($pdo, $id) {
    $input = json_decode(file_get_contents('php://input'), true);

    // Check if product exists
    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }

    // Build update query dynamically
    $fields = [];
    $params = ['id' => $id];

    if (isset($input['name'])) {
        $fields[] = "name = :name";
        $params['name'] = sanitizeInput($input['name']);
    }
    if (isset($input['category'])) {
        $fields[] = "category = :category";
        $params['category'] = sanitizeInput($input['category']);
    }
    if (isset($input['price'])) {
        $fields[] = "price = :price";
        $params['price'] = sanitizeInput($input['price']);
    }
    if (isset($input['originalPrice'])) {
        $fields[] = "original_price = :original_price";
        $params['original_price'] = !empty($input['originalPrice']) ? sanitizeInput($input['originalPrice']) : null;
    }
    if (isset($input['discount'])) {
        $fields[] = "discount = :discount";
        $params['discount'] = !empty($input['discount']) ? (int)$input['discount'] : null;
    }
    if (isset($input['image'])) {
        $fields[] = "image = :image";
        $params['image'] = sanitizeInput($input['image']);
    }
    if (isset($input['description'])) {
        $fields[] = "description = :description";
        $params['description'] = sanitizeInput($input['description']);
    }
    if (isset($input['colors'])) {
        $fields[] = "colors = :colors";
        $params['colors'] = json_encode($input['colors']);
    }
    if (isset($input['sizes'])) {
        $fields[] = "sizes = :sizes";
        $params['sizes'] = json_encode($input['sizes']);
    }
    if (isset($input['inStock'])) {
        $fields[] = "in_stock = :in_stock";
        $params['in_stock'] = (int)$input['inStock'];
    }
    if (isset($input['featured'])) {
        $fields[] = "featured = :featured";
        $params['featured'] = (int)$input['featured'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        return;
    }

    $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product']);
    }
}

/**
 * Delete product
 */
function deleteProduct($pdo, $id) {
    // Check if product exists
    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
    $result = $stmt->execute(['id' => $id]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete product']);
    }
}
?>
