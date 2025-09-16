<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Simple test API that should always work
$endpoint = $_GET['endpoint'] ?? '';

switch ($endpoint) {
    case 'test':
        echo json_encode([
            'status' => 'success',
            'message' => 'Simple API is working!',
            'endpoint' => $endpoint,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;
        
    case 'adspend':
        // Simple ad spend data
        echo json_encode([
            'status' => 'success',
            'data' => [
                'total_spent' => 5000,
                'total_reach' => 100000,
                'campaigns' => [
                    ['name' => 'Test Campaign', 'spent' => 1000, 'reach' => 20000]
                ]
            ]
        ]);
        break;
        
    case 'voterdata':
        // Simple voter data
        echo json_encode([
            'status' => 'success',
            'data' => [
                'registered_voters' => [
                    'Republican' => 20000,
                    'Democrat' => 50000,
                    'Other' => 30000
                ]
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'available_endpoints' => ['test', 'adspend', 'voterdata'],
            'requested_endpoint' => $endpoint
        ]);
        break;
}
?>
