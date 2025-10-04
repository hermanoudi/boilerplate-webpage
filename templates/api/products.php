<?php
// LL Magazine - Products API
// Backend PHP for virtual storefront with MySQL database

require_once __DIR__ . '/../config.php';

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

// Handle different API endpoints
$request = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Parse the request
$path = parse_url($request, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// API routing
if ($method === 'GET') {
    // Check for config endpoint
    if (isset($_GET['config'])) {
        // Return WhatsApp configuration
        echo json_encode([
            'whatsappNumber' => WHATSAPP_NUMBER,
            'whatsappMessage' => WHATSAPP_MESSAGE,
            'siteName' => SITE_NAME
        ]);
        exit();
    }

    if (isset($pathParts[2]) && $pathParts[2] === 'categories') {
        // Get categories
        $categories = getCategories($pdo);
        echo json_encode($categories, JSON_UNESCAPED_UNICODE);

    } elseif (isset($pathParts[2]) && $pathParts[2] === 'products' && isset($pathParts[3]) && is_numeric($pathParts[3])) {
        // Get single product by ID
        $productId = (int)$pathParts[3];
        $product = getProductById($pdo, $productId);

        if ($product) {
            // Decode JSON fields
            $product['colors'] = json_decode($product['colors'], true);
            $product['sizes'] = json_decode($product['sizes'], true);
            $product['inStock'] = (bool)$product['in_stock'];
            unset($product['in_stock']);

            echo json_encode($product, JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }

    } else {
        // Get all products or filter by category
        $category = $_GET['category'] ?? 'all';
        $products = getProducts($pdo, $category);

        // Decode JSON fields for each product
        $products = array_map(function($product) {
            $product['colors'] = json_decode($product['colors'], true);
            $product['sizes'] = json_decode($product['sizes'], true);
            $product['inStock'] = (bool)$product['in_stock'];
            unset($product['in_stock']);
            return $product;
        }, $products);

        echo json_encode($products, JSON_UNESCAPED_UNICODE);
    }

} elseif ($method === 'POST') {
    // Handle form submissions (contact, newsletter, etc.)
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['action'])) {
        switch ($input['action']) {
            case 'contact':
                // Handle contact form
                $name = sanitizeInput($input['name'] ?? '');
                $email = sanitizeInput($input['email'] ?? '');
                $message = sanitizeInput($input['message'] ?? '');

                // Validate email
                if (!validateEmail($email)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email inválido']);
                    exit();
                }

                // Here you would typically save to database or send email
                // For now, just return success
                echo json_encode([
                    'success' => true,
                    'message' => 'Mensagem enviada com sucesso!'
                ]);
                break;

            case 'newsletter':
                // Handle newsletter subscription
                $email = sanitizeInput($input['email'] ?? '');

                // Validate email
                if (!validateEmail($email)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Email inválido']);
                    exit();
                }

                // Here you would typically save to database
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscrição realizada com sucesso!'
                ]);
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'No action specified']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Database functions
function getProducts($pdo, $category = null) {
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
                in_stock,
                featured
            FROM products
            WHERE in_stock = 1";
    $params = [];

    if ($category && $category !== 'all') {
        $sql .= " AND category = :category";
        $params['category'] = $category;
    }

    $sql .= " ORDER BY featured DESC, created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getProductById($pdo, $id) {
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
                in_stock,
                featured
            FROM products
            WHERE id = :id AND in_stock = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $id]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getCategories($pdo) {
    $sql = "SELECT id, name, icon FROM categories ORDER BY display_order ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Rate limiting (basic implementation)
function checkRateLimit($ip) {
    $rateLimitFile = __DIR__ . '/../logs/rate_limit.json';
    $currentTime = time();
    $window = RATE_LIMIT_WINDOW;
    $maxRequests = RATE_LIMIT_REQUESTS;

    if (!file_exists($rateLimitFile)) {
        $data = [];
    } else {
        $data = json_decode(file_get_contents($rateLimitFile), true) ?: [];
    }

    // Clean old entries
    $data = array_filter($data, function($timestamp) use ($currentTime, $window) {
        return ($currentTime - $timestamp) < $window;
    });

    // Check if IP has exceeded limit
    if (count($data) >= $maxRequests) {
        return false;
    }

    // Add current request
    $data[] = $currentTime;

    // Save updated data
    file_put_contents($rateLimitFile, json_encode($data));

    return true;
}

// Apply rate limiting
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!checkRateLimit($clientIp)) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded. Please try again later.']);
    exit();
}
?>
