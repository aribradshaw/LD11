<?php
// Test version of main API with error handling
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the requested endpoint
$request = $_GET['endpoint'] ?? '';

echo json_encode([
    'debug_info' => [
        'requested_endpoint' => $request,
        'all_get_params' => $_GET,
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'script_name' => $_SERVER['SCRIPT_NAME']
    ]
]);

// Test if we can include the main API
try {
    if (file_exists('index.php')) {
        echo json_encode(['main_api_exists' => true]);
    } else {
        echo json_encode(['main_api_exists' => false]);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
