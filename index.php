<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="./public/favicon2.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#34419A" />
    <meta
      name="description"
      content="LD11 Campaign Data Visualization Dashboard"
    />
    <title>LD11 Dashboard</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #F1F1F1;
      }
      
      code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
          monospace;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    
    <!-- Load React app -->
    <?php
    // Debug: Check what files exist
    $staticDir = './static/';
    $jsDir = $staticDir . 'js/';
    $cssDir = $staticDir . 'css/';
    
    // Check if directories exist
    if (is_dir($jsDir)) {
        $jsFiles = glob($jsDir . '*.js');
    } else {
        $jsFiles = [];
    }
    
    if (is_dir($cssDir)) {
        $cssFiles = glob($cssDir . '*.css');
    } else {
        $cssFiles = [];
    }
    
    // Debug output
    echo "<!-- Debug: JS files found: " . count($jsFiles) . " -->\n    ";
    echo "<!-- Debug: CSS files found: " . count($cssFiles) . " -->\n    ";
    
    // Load CSS files
    foreach ($cssFiles as $cssFile) {
        echo '<link rel="stylesheet" href="' . $cssFile . '">' . "\n    ";
    }
    
    // Load JS files
    foreach ($jsFiles as $jsFile) {
        echo '<script src="' . $jsFile . '"></script>' . "\n    ";
    }
    
    // If no files found, show debug info
    if (empty($jsFiles) && empty($cssFiles)) {
        echo "<!-- Debug: No React files found. Checking directories... -->\n    ";
        echo "<!-- JS dir exists: " . (is_dir($jsDir) ? 'yes' : 'no') . " -->\n    ";
        echo "<!-- CSS dir exists: " . (is_dir($cssDir) ? 'yes' : 'no') . " -->\n    ";
        echo "<!-- Static dir exists: " . (is_dir($staticDir) ? 'yes' : 'no') . " -->\n    ";
        
        // List all files in static directory
        if (is_dir($staticDir)) {
            $allFiles = scandir($staticDir);
            echo "<!-- Files in static/: " . implode(', ', $allFiles) . " -->\n    ";
        }
    }
    ?>
  </body>
</html>