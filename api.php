<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'adspend':
        getAdSpend();
        break;
    case 'voters':
        getVoters();
        break;
    case 'results':
        getResults();
        break;
    default:
        echo json_encode(['error' => 'Invalid action', 'available' => ['adspend', 'voters', 'results']]);
        break;
}

function getAdSpend() {
    $file = 'public/ld11adspend.csv';
    if (!file_exists($file)) {
        echo json_encode(['error' => 'File not found']);
        return;
    }
    
    $data = [];
    $handle = fopen($file, 'r');
    $headers = fgetcsv($handle);
    
    while (($row = fgetcsv($handle)) !== false) {
        $data[] = array_combine($headers, $row);
    }
    fclose($handle);
    
    echo json_encode(['success' => true, 'data' => $data]);
}

function getVoters() {
    $file = 'public/ld11results.json';
    if (!file_exists($file)) {
        echo json_encode(['error' => 'File not found']);
        return;
    }
    
    $data = json_decode(file_get_contents($file), true);
    echo json_encode(['success' => true, 'data' => $data]);
}

function getResults() {
    $file = 'public/results.csv';
    if (!file_exists($file)) {
        echo json_encode(['error' => 'File not found']);
        return;
    }
    
    $data = [];
    $handle = fopen($file, 'r');
    
    // Skip headers
    for ($i = 0; $i < 5; $i++) {
        fgetcsv($handle);
    }
    
    while (($row = fgetcsv($handle)) !== false) {
        if (!empty($row[0]) && is_numeric($row[1])) {
            $data[] = [
                'precinct' => $row[0],
                'registered' => (int)$row[1],
                'ballots_cast' => (int)$row[2],
                'turnout' => floatval(str_replace('%', '', $row[3]))
            ];
        }
    }
    fclose($handle);
    
    echo json_encode(['success' => true, 'data' => $data]);
}
?>
