<?php
// Simple test file to verify PHP is working
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'PHP API is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'current_dir' => __DIR__,
        'files_in_dir' => scandir(__DIR__)
    ]
]);
?>
