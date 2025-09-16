<?php
// Debug file to test PHP and file paths
header('Content-Type: application/json');

$debug_info = [
    'php_working' => true,
    'current_dir' => __DIR__,
    'files_in_directory' => [],
    'data_files_exist' => [],
    'timestamp' => date('Y-m-d H:i:s')
];

// Check what files are in the current directory
if (is_dir(__DIR__)) {
    $debug_info['files_in_directory'] = array_values(array_diff(scandir(__DIR__), ['.', '..']));
}

// Check if data files exist
$data_files = [
    'public/ld11adspend.csv',
    'public/ld11results.json', 
    'public/results.csv'
];

foreach ($data_files as $file) {
    $debug_info['data_files_exist'][$file] = file_exists($file);
}

// Test if we can read the CSV file
if (file_exists('public/ld11adspend.csv')) {
    $handle = fopen('public/ld11adspend.csv', 'r');
    if ($handle) {
        $first_line = fgetcsv($handle);
        $debug_info['csv_test'] = [
            'can_read' => true,
            'first_line' => $first_line
        ];
        fclose($handle);
    }
}

echo json_encode($debug_info, JSON_PRETTY_PRINT);
?>
