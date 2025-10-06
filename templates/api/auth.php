<?php
// LL Magazine - Authentication API
// Login and token management

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/JWT.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    switch ($action) {
        case 'login':
            handleLogin($pdo, $input);
            break;

        case 'verify':
            handleVerify();
            break;

        case 'change_password':
            handleChangePassword($pdo, $input);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

/**
 * Handle login request
 */
function handleLogin($pdo, $input) {
    $username = sanitizeInput($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        return;
    }

    // Get user from database
    $stmt = $pdo->prepare("
        SELECT id, username, email, password_hash, full_name, is_active
        FROM admin_users
        WHERE username = :username AND is_active = 1
    ");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    // Update last login
    $stmt = $pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
    $stmt->execute(['id' => $user['id']]);

    // Generate JWT token
    $secret = defined('JWT_SECRET') ? JWT_SECRET : 'your-secret-key-change-this';
    $payload = [
        'user_id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name']
    ];

    $token = JWT::encode($payload, $secret, 86400); // 24 hours

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name']
        ]
    ]);
}

/**
 * Verify token validity
 */
function handleVerify() {
    $token = JWT::getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return;
    }

    $secret = defined('JWT_SECRET') ? JWT_SECRET : 'your-secret-key-change-this';
    $payload = JWT::decode($token, $secret);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $payload['user_id'],
            'username' => $payload['username'],
            'email' => $payload['email'],
            'full_name' => $payload['full_name']
        ]
    ]);
}

/**
 * Change password (requires valid token)
 */
function handleChangePassword($pdo, $input) {
    $token = JWT::getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        return;
    }

    $secret = defined('JWT_SECRET') ? JWT_SECRET : 'your-secret-key-change-this';
    $payload = JWT::decode($token, $secret);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        return;
    }

    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Current and new password are required']);
        return;
    }

    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 6 characters']);
        return;
    }

    // Get current user
    $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE id = :id");
    $stmt->execute(['id' => $payload['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }

    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Current password is incorrect']);
        return;
    }

    // Update password
    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = :password WHERE id = :id");
    $stmt->execute([
        'password' => $newPasswordHash,
        'id' => $payload['user_id']
    ]);

    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
}
?>
