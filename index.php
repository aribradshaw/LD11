<?php
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

switch ($request) {
    case 'adspend':
        getAdSpendData();
        break;
    case 'voterdata':
        getVoterData();
        break;
    case 'results':
        getResultsData();
        break;
    case 'dashboard':
        getDashboardData();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

function getAdSpendData() {
    $csvFile = 'public/ld11adspend.csv';
    
    if (!file_exists($csvFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Ad spend data not found']);
        return;
    }
    
    $data = [];
    $handle = fopen($csvFile, 'r');
    $headers = fgetcsv($handle);
    
    while (($row = fgetcsv($handle)) !== false) {
        $data[] = array_combine($headers, $row);
    }
    
    fclose($handle);
    
    // Process and aggregate data for visualizations
    $processed = [
        'raw' => $data,
        'by_optimization' => aggregateByOptimization($data),
        'by_target' => aggregateByTarget($data),
        'spending_summary' => getSpendingSummary($data),
        'performance_metrics' => getPerformanceMetrics($data)
    ];
    
    echo json_encode($processed);
}

function getVoterData() {
    $jsonFile = 'public/ld11results.json';
    
    if (!file_exists($jsonFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Voter data not found']);
        return;
    }
    
    $data = json_decode(file_get_contents($jsonFile), true);
    echo json_encode($data);
}

function getResultsData() {
    $csvFile = 'public/results.csv';
    
    if (!file_exists($csvFile)) {
        http_response_code(404);
        echo json_encode(['error' => 'Results data not found']);
        return;
    }
    
    $data = [];
    $handle = fopen($csvFile, 'r');
    
    // Skip the first few header rows and get to the actual data
    $line = 0;
    while (($row = fgetcsv($handle)) !== false) {
        $line++;
        if ($line >= 5) { // Start from row 5 where actual data begins
            if (!empty($row[0]) && is_numeric($row[1])) { // Valid precinct data
                $data[] = [
                    'precinct' => $row[0],
                    'registered' => (int)$row[1],
                    'ballots_cast' => (int)$row[2],
                    'turnout_pct' => floatval(str_replace('%', '', $row[3])),
                    'trump_votes' => (int)$row[25] ?? 0,
                    'harris_votes' => (int)$row[26] ?? 0,
                    'mitchell_votes' => (int)$row[28] ?? 0,
                    'lake_votes' => (int)$row[30] ?? 0,
                    'hobbs_votes' => (int)$row[31] ?? 0
                ];
            }
        }
    }
    
    fclose($handle);
    
    // Process results data
    $processed = [
        'raw' => $data,
        'turnout_summary' => getTurnoutSummary($data),
        'candidate_performance' => getCandidatePerformance($data),
        'precinct_analysis' => getPrecinctAnalysis($data)
    ];
    
    echo json_encode($processed);
}

function getDashboardData() {
    // Return summary data for dashboard overview
    $adSpend = json_decode(file_get_contents('public/ld11adspend.csv'), true);
    $voterData = json_decode(file_get_contents('public/ld11results.json'), true);
    
    echo json_encode([
        'total_spent' => calculateTotalSpent(),
        'total_reach' => calculateTotalReach(),
        'voter_summary' => $voterData[0] ?? null,
        'last_updated' => date('Y-m-d H:i:s')
    ]);
}

function aggregateByOptimization($data) {
    $aggregated = [];
    foreach ($data as $row) {
        $opt = $row['Optimization'];
        if (!isset($aggregated[$opt])) {
            $aggregated[$opt] = [
                'count' => 0,
                'total_spent' => 0,
                'total_reach' => 0,
                'total_impressions' => 0
            ];
        }
        
        $aggregated[$opt]['count']++;
        $aggregated[$opt]['total_spent'] += floatval(str_replace(['$', ','], '', $row['Spent']));
        $aggregated[$opt]['total_reach'] += intval(str_replace(',', '', $row['Reach']));
        $aggregated[$opt]['total_impressions'] += intval(str_replace(',', '', $row['Impressions']));
    }
    
    return $aggregated;
}

function aggregateByTarget($data) {
    $aggregated = [];
    foreach ($data as $row) {
        $target = $row['Target'];
        if (!isset($aggregated[$target])) {
            $aggregated[$target] = [
                'count' => 0,
                'total_spent' => 0,
                'total_reach' => 0,
                'total_impressions' => 0
            ];
        }
        
        $aggregated[$target]['count']++;
        $aggregated[$target]['total_spent'] += floatval(str_replace(['$', ','], '', $row['Spent']));
        $aggregated[$target]['total_reach'] += intval(str_replace(',', '', $row['Reach']));
        $aggregated[$target]['total_impressions'] += intval(str_replace(',', '', $row['Impressions']));
    }
    
    return $aggregated;
}

function getSpendingSummary($data) {
    $total = 0;
    $count = 0;
    $max = 0;
    $min = PHP_FLOAT_MAX;
    
    foreach ($data as $row) {
        $spent = floatval(str_replace(['$', ','], '', $row['Spent']));
        $total += $spent;
        $count++;
        $max = max($max, $spent);
        $min = min($min, $spent);
    }
    
    return [
        'total' => $total,
        'average' => $count > 0 ? $total / $count : 0,
        'max' => $max,
        'min' => $min,
        'count' => $count
    ];
}

function getPerformanceMetrics($data) {
    $metrics = [
        'total_reach' => 0,
        'total_impressions' => 0,
        'avg_frequency' => 0,
        'frequency_count' => 0
    ];
    
    foreach ($data as $row) {
        $metrics['total_reach'] += intval(str_replace(',', '', $row['Reach']));
        $metrics['total_impressions'] += intval(str_replace(',', '', $row['Impressions']));
        
        if (is_numeric($row['Frequency'])) {
            $metrics['avg_frequency'] += floatval($row['Frequency']);
            $metrics['frequency_count']++;
        }
    }
    
    if ($metrics['frequency_count'] > 0) {
        $metrics['avg_frequency'] /= $metrics['frequency_count'];
    }
    
    return $metrics;
}

function getTurnoutSummary($data) {
    $total_registered = 0;
    $total_ballots = 0;
    $turnout_rates = [];
    
    foreach ($data as $row) {
        $total_registered += $row['registered'];
        $total_ballots += $row['ballots_cast'];
        $turnout_rates[] = $row['turnout_pct'];
    }
    
    return [
        'total_registered' => $total_registered,
        'total_ballots_cast' => $total_ballots,
        'overall_turnout' => $total_registered > 0 ? ($total_ballots / $total_registered) * 100 : 0,
        'avg_turnout' => count($turnout_rates) > 0 ? array_sum($turnout_rates) / count($turnout_rates) : 0,
        'max_turnout' => count($turnout_rates) > 0 ? max($turnout_rates) : 0,
        'min_turnout' => count($turnout_rates) > 0 ? min($turnout_rates) : 0
    ];
}

function getCandidatePerformance($data) {
    $candidates = [
        'trump' => ['total' => 0, 'precincts' => 0],
        'harris' => ['total' => 0, 'precincts' => 0],
        'mitchell' => ['total' => 0, 'precincts' => 0],
        'lake' => ['total' => 0, 'precincts' => 0],
        'hobbs' => ['total' => 0, 'precincts' => 0]
    ];
    
    foreach ($data as $row) {
        foreach ($candidates as $candidate => &$stats) {
            if ($row[$candidate . '_votes'] > 0) {
                $stats['total'] += $row[$candidate . '_votes'];
                $stats['precincts']++;
            }
        }
    }
    
    return $candidates;
}

function getPrecinctAnalysis($data) {
    $precincts = [];
    foreach ($data as $row) {
        $precincts[] = [
            'name' => $row['precinct'],
            'turnout' => $row['turnout_pct'],
            'registered' => $row['registered'],
            'ballots_cast' => $row['ballots_cast']
        ];
    }
    
    // Sort by turnout
    usort($precincts, function($a, $b) {
        return $b['turnout'] <=> $a['turnout'];
    });
    
    return [
        'highest_turnout' => array_slice($precincts, 0, 5),
        'lowest_turnout' => array_slice($precincts, -5),
        'all_precincts' => $precincts
    ];
}

function calculateTotalSpent() {
    $csvFile = 'public/ld11adspend.csv';
    if (!file_exists($csvFile)) return 0;
    
    $total = 0;
    $handle = fopen($csvFile, 'r');
    $headers = fgetcsv($handle);
    
    while (($row = fgetcsv($handle)) !== false) {
        $data = array_combine($headers, $row);
        $total += floatval(str_replace(['$', ','], '', $data['Spent']));
    }
    
    fclose($handle);
    return $total;
}

function calculateTotalReach() {
    $csvFile = 'public/ld11adspend.csv';
    if (!file_exists($csvFile)) return 0;
    
    $total = 0;
    $handle = fopen($csvFile, 'r');
    $headers = fgetcsv($handle);
    
    while (($row = fgetcsv($handle)) !== false) {
        $data = array_combine($headers, $row);
        $total += intval(str_replace(',', '', $data['Reach']));
    }
    
    fclose($handle);
    return $total;
}
?>
