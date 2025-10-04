<?php
// LL Magazine - Configuration File
// Loads configuration from .env file

// Load .env file
function loadEnv($path = '.env') {
    if (!file_exists($path)) {
        throw new Exception('.env file not found. Please copy .env.example to .env and configure it.');
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse key=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes if present
            $value = trim($value, '"\'');

            // Set as environment variable and define constant
            putenv("$key=$value");
            $_ENV[$key] = $value;

            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Load environment variables
loadEnv(__DIR__ . '/.env');

// Database Configuration (already defined by loadEnv, but set defaults if not present)
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'll_magazine_db');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');

// Site Configuration
if (!defined('SITE_NAME')) define('SITE_NAME', 'LL Magazine');
if (!defined('SITE_URL')) define('SITE_URL', 'http://localhost:8080');
if (!defined('SITE_EMAIL')) define('SITE_EMAIL', 'contato@llmagazine.com');

// WhatsApp Configuration
if (!defined('WHATSAPP_NUMBER')) define('WHATSAPP_NUMBER', '');
if (!defined('WHATSAPP_MESSAGE')) define('WHATSAPP_MESSAGE', 'Olá! Gostaria de saber mais sobre este produto da LL Magazine:');

// Environment
if (!defined('APP_ENV')) define('APP_ENV', 'development');
define('DEBUG_MODE', APP_ENV === 'development');

// Security Configuration
define('ENABLE_HTTPS', APP_ENV === 'production');
define('ENABLE_CORS', true);
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 300); // 5 minutes

// File Upload Configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Development/Production Mode
define('LOG_ERRORS', true);

// Cache Configuration
define('CACHE_ENABLED', true);
define('CACHE_DURATION', 3600); // 1 hour

// API Configuration
define('API_VERSION', '1.0');
define('API_RATE_LIMIT', 1000); // requests per hour

// Social Media Links
define('INSTAGRAM_URL', 'https://instagram.com/llmagazine');
define('FACEBOOK_URL', 'https://facebook.com/llmagazine');
define('WHATSAPP_URL', 'https://wa.me/' . WHATSAPP_NUMBER);

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Error Reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', ENABLE_HTTPS ? 1 : 0);
ini_set('session.use_strict_mode', 1);

// Memory and Time Limits
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 30);

// Headers for Security
if (ENABLE_HTTPS) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// CORS Headers
if (ENABLE_CORS) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Function to get configuration value
function getConfig($key, $default = null) {
    return defined($key) ? constant($key) : $default;
}

// Function to check if running in production
function isProduction() {
    return APP_ENV === 'production';
}

// Function to get full URL
function getFullUrl($path = '') {
    return SITE_URL . '/' . ltrim($path, '/');
}

// Function to get WhatsApp URL
function getWhatsAppUrl($message = '') {
    $encodedMessage = urlencode($message);
    return 'https://wa.me/' . WHATSAPP_NUMBER . '?text=' . $encodedMessage;
}

// Function to log errors
function logError($message, $context = []) {
    if (!LOG_ERRORS) return;

    $logFile = __DIR__ . '/logs/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? ' | Context: ' . json_encode($context) : '';
    $logMessage = "[$timestamp] $message$contextStr" . PHP_EOL;

    // Create logs directory if it doesn't exist
    if (!file_exists(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0755, true);
    }

    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// Function to sanitize input
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to generate CSRF token
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Function to verify CSRF token
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Database connection function
function getDBConnection() {
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            logError('Database connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }

    return $pdo;
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
