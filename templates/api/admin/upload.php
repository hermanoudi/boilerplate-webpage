<?php
// LL Magazine - Image Upload API
// Handles product image uploads (protected by JWT)

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../JWT.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded or upload error']);
    exit();
}

$file = $_FILES['image'];
$uploadDir = __DIR__ . '/../../assets/images/products/';

// Create directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validate file type
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

// Get file extension
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

// Check mime type if available
$fileType = '';
if (function_exists('mime_content_type') && file_exists($file['tmp_name'])) {
    $fileType = mime_content_type($file['tmp_name']);
}

// Debug info
error_log("Upload debug - Extension: $extension, MIME: $fileType, Filename: {$file['name']}");

// Validate by extension first (most reliable)
if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid file extension. Only JPG, PNG, GIF, WEBP, and AVIF are allowed',
        'debug' => ['extension' => $extension, 'allowed' => $allowedExtensions]
    ]);
    exit();
}

// Validate MIME type with all common variations
if ($fileType) {
    $validMimeTypes = [
        'image/jpeg', 'image/pjpeg', 'image/jpg',
        'image/png', 'image/x-png',
        'image/gif',
        'image/webp',
        'image/avif',
        'application/octet-stream' // Fallback for some systems
    ];

    if (!in_array($fileType, $validMimeTypes)) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid file MIME type. Please use JPG, PNG, GIF, WEBP, or AVIF images',
            'debug' => ['mime' => $fileType, 'extension' => $extension]
        ]);
        exit();
    }
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Maximum size is 5MB']);
    exit();
}

// Generate safe filename (reuse $extension from validation above)
$safeName = preg_replace('/[^a-zA-Z0-9-_]/', '-', pathinfo($file['name'], PATHINFO_FILENAME));
$safeName = strtolower($safeName);
$fileName = $safeName . '-' . time() . '.' . $extension;
$filePath = $uploadDir . $fileName;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file']);
    exit();
}

// Return relative path
$relativePath = 'assets/images/products/' . $fileName;

echo json_encode([
    'success' => true,
    'message' => 'Image uploaded successfully',
    'path' => $relativePath,
    'filename' => $fileName
]);
?>
