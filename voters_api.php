<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration - UPDATE THESE VALUES FOR YOUR HOSTGATOR SETUP
$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters', // Replace with your actual database name
    'username' => 'yourusername_dbuser',     // Replace with your actual username
    'password' => 'your_password_here'       // Replace with your actual password
];

try {
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8mb4",
        $db_config['username'],
        $db_config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Create voters table if it doesn't exist
function createVotersTable($pdo) {
    $sql = "CREATE TABLE IF NOT EXISTS voters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        party VARCHAR(50),
        precinct VARCHAR(100),
        voter_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'status':
        checkDatabaseStatus($pdo);
        break;
    case 'fetch':
        fetchVoters($pdo);
        break;
    case 'upload':
        uploadVoters($pdo);
        break;
    case 'clear':
        clearVoters($pdo);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function checkDatabaseStatus($pdo) {
    try {
        // Try to create the table to ensure it exists
        createVotersTable($pdo);
        
        // Test a simple query
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM voters");
        $result = $stmt->fetch();
        
        echo json_encode([
            'connected' => true,
            'voter_count' => $result['count']
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'connected' => false,
            'error' => $e->getMessage()
        ]);
    }
}

function fetchVoters($pdo) {
    try {
        createVotersTable($pdo);
        
        $stmt = $pdo->query("SELECT * FROM voters ORDER BY created_at DESC LIMIT 1000");
        $voters = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'voters' => $voters,
            'count' => count($voters)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch voters: ' . $e->getMessage()]);
    }
}

function uploadVoters($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    if (!isset($_FILES['csv_file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        return;
    }
    
    $file = $_FILES['csv_file'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'File upload error: ' . $file['error']]);
        return;
    }
    
    if (!str_ends_with(strtolower($file['name']), '.csv')) {
        http_response_code(400);
        echo json_encode(['error' => 'File must be a CSV']);
        return;
    }
    
    try {
        createVotersTable($pdo);
        
        // Clear existing data
        $pdo->exec("TRUNCATE TABLE voters");
        
        $handle = fopen($file['tmp_name'], 'r');
        if (!$handle) {
            throw new Exception('Could not open uploaded file');
        }
        
        $headers = fgetcsv($handle);
        if (!$headers) {
            throw new Exception('Could not read CSV headers');
        }
        
        // Map CSV columns to database fields
        $column_mapping = [
            'name' => findColumn($headers, ['name', 'full_name', 'voter_name']),
            'address' => findColumn($headers, ['address', 'street_address', 'residence']),
            'party' => findColumn($headers, ['party', 'party_affiliation', 'registration']),
            'precinct' => findColumn($headers, ['precinct', 'district', 'ward']),
            'voter_id' => findColumn($headers, ['voter_id', 'id', 'registration_id'])
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO voters (name, address, party, precinct, voter_id) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $imported = 0;
        $errors = [];
        
        while (($row = fgetcsv($handle)) !== false) {
            try {
                $data = array_combine($headers, $row);
                
                $name = $data[$column_mapping['name']] ?? '';
                $address = $data[$column_mapping['address']] ?? '';
                $party = $data[$column_mapping['party']] ?? '';
                $precinct = $data[$column_mapping['precinct']] ?? '';
                $voter_id = $data[$column_mapping['voter_id']] ?? '';
                
                if (empty($name)) {
                    continue; // Skip rows without names
                }
                
                $stmt->execute([$name, $address, $party, $precinct, $voter_id]);
                $imported++;
                
            } catch (Exception $e) {
                $errors[] = "Row " . ($imported + 1) . ": " . $e->getMessage();
            }
        }
        
        fclose($handle);
        
        echo json_encode([
            'success' => true,
            'imported' => $imported,
            'errors' => $errors
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload failed: ' . $e->getMessage()]);
    }
}

function clearVoters($pdo) {
    try {
        createVotersTable($pdo);
        $pdo->exec("TRUNCATE TABLE voters");
        
        echo json_encode([
            'success' => true,
            'message' => 'All voter data cleared'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to clear data: ' . $e->getMessage()]);
    }
}

function findColumn($headers, $possible_names) {
    foreach ($possible_names as $name) {
        foreach ($headers as $header) {
            if (stripos($header, $name) !== false) {
                return $header;
            }
        }
    }
    return null;
}
?>
