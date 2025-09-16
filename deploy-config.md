# GitHub Actions Deployment Configuration

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository at [https://github.com/aribradshaw/LD11](https://github.com/aribradshaw/LD11):

### 1. Navigate to Repository Settings
1. Go to your repository: https://github.com/aribradshaw/LD11
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret" for each of the following:

### 2. Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `HOST` | Your server's IP address or domain | `123.456.789.012` or `sunbeltsolutions.org` |
| `USERNAME` | SSH username for your server | `root` or `your_username` |
| `SSH_KEY` | Private SSH key for authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PORT` | SSH port (optional, defaults to 22) | `22` or `2222` |

### 3. SSH Key Setup

#### Generate SSH Key Pair (if you don't have one):
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@sunbeltsolutions.org"
```

#### Add Public Key to Server:
```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub username@sunbeltsolutions.org

# Or manually add to ~/.ssh/authorized_keys on server
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

#### Add Private Key to GitHub:
1. Copy the private key content:
   ```bash
   cat ~/.ssh/id_rsa
   ```
2. Add as `SSH_KEY` secret in GitHub

### 4. Server Directory Structure

The deployment will create this structure on your server:
```
/sunbeltsolutions.org/ld11/
├── live/           # Current active deployment
│   ├── index.php
│   ├── voters_api.php
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   ├── ld11adspend.csv
│   │   ├── ld11results.json
│   │   └── results.csv
│   └── build/      # React build files
└── backup/         # Previous deployment (auto-cleaned)
```

### 5. Web Server Configuration

#### For Apache (most common on HostGator):
The deployment automatically creates a `.htaccess` file for proper routing.

#### For Nginx:
Add this to your Nginx configuration:
```nginx
location /ld11/ {
    alias /sunbeltsolutions.org/ld11/live/;
    try_files $uri $uri/ /ld11/index.html;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $request_filename;
    }
}
```

### 6. Database Configuration

Update the database credentials in `voters_api.php` before deployment:

```php
$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters',
    'username' => 'yourusername_dbuser',
    'password' => 'your_password_here'
];
```

### 7. Deployment Process

1. **Push to main/master branch** triggers deployment
2. **Build React app** on GitHub Actions runner
3. **SSH to server** and prepare deployment directory
4. **Copy files** to server
5. **Set permissions** and create .htaccess
6. **Activate deployment** by moving to live directory
7. **Clean up** old backup

### 8. Monitoring Deployment

- Check GitHub Actions tab in your repository for deployment status
- View logs for any errors
- Test the deployment at: https://sunbeltsolutions.org/ld11/

### 9. Rollback Process

If deployment fails, the previous version remains in the backup directory:
```bash
# On your server, if you need to rollback:
mv /sunbeltsolutions.org/ld11/live /sunbeltsolutions.org/ld11/failed
mv /sunbeltsolutions.org/ld11/backup /sunbeltsolutions.org/ld11/live
```

### 10. Troubleshooting

#### Common Issues:
- **SSH Connection Failed**: Check HOST, USERNAME, SSH_KEY secrets
- **Permission Denied**: Ensure SSH key is properly added to server
- **Build Failed**: Check Node.js version and dependencies
- **Files Not Found**: Verify file paths in workflow

#### Debug Commands:
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa username@sunbeltsolutions.org

# Check directory permissions
ls -la /sunbeltsolutions.org/ld11/

# View web server logs
tail -f /var/log/apache2/error.log
```

## Security Considerations

1. **SSH Key Security**: Use a dedicated SSH key for GitHub Actions
2. **File Permissions**: The workflow sets appropriate permissions (755 for directories, 644 for files)
3. **Security Headers**: .htaccess includes security headers
4. **Database Credentials**: Store in environment variables or secure configuration

## Next Steps

1. Add the required secrets to your GitHub repository
2. Push your code to the main/master branch
3. Monitor the GitHub Actions workflow
4. Test the deployment at https://sunbeltsolutions.org/ld11/
5. Set up your database using the instructions in the README
