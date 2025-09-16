<?php
// Simple redirect to the React app
// Check if index.html exists (from React build)
if (file_exists('./index.html')) {
    // Serve the React app
    include './index.html';
} else {
    // Fallback - show error
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>LD11 Dashboard - Setup Required</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .error { background: #fee; color: #c33; padding: 20px; border-radius: 8px; border: 1px solid #fcc; }
    </style>
</head>
<body>
    <div class="error">
        <h2>Setup Required</h2>
        <p>The React app has not been built yet. Please run:</p>
        <pre>npm run build</pre>
        <p>Then deploy the build files to the server.</p>
    </div>
</body>
</html>';
}
?>