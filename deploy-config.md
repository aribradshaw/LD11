# HostGator Deployment Configuration

## GitHub Secrets Setup

To enable automatic deployment to HostGator, you need to configure the following secrets in your GitHub repository:

### Required Secrets (Already Configured ✅)

1. **FTP_HOST**: Your HostGator FTP server hostname
   - Example: `ftp.sunbeltsolutions.org` or `gator1234.hostgator.com`

2. **FTP_USERNAME**: Your HostGator FTP username
   - Example: `yourusername`

3. **FTP_PASSWORD**: Your HostGator FTP password
   - Your cPanel FTP password

### Setting up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret" for each secret above

### FTP Access Setup on HostGator

1. Log into your HostGator cPanel
2. Go to "FTP Accounts" in the Files section
3. Create or use existing FTP account
4. Note the FTP credentials for the GitHub secrets

## Directory Structure

The deployment will create the following structure on HostGator:

```
/public_html/sunbeltsolutions.org/ld11/
├── index.html        # React app entry point
├── static/           # React build assets
├── *.php            # Backend API files
├── .htaccess        # Apache configuration for React Router
└── public/          # Data files and assets
    ├── ld11adspend.csv
    ├── ld11results.json
    ├── results.csv
    └── LD11.csv
```

## Manual Deployment

If you prefer manual deployment:

1. Build the React app: `npm run build`
2. Upload the `build/` folder contents to `/public_html/sunbeltsolutions.org/ld11/`
3. Upload all PHP files to the same directory
4. Upload the `public/` folder contents to `/public_html/sunbeltsolutions.org/ld11/public/`
5. Upload the `.htaccess` file to the root directory

## Database Configuration

Update the database credentials in `voters_api.php`:

```php
$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters',
    'username' => 'yourusername_dbuser',
    'password' => 'your_secure_password'
];
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure SSH key has proper permissions (600)
2. **Build Fails**: Check Node.js version compatibility
3. **Database Connection**: Verify database credentials and MySQL service
4. **React Router 404**: Ensure `.htaccess` file is properly configured

### Logs

Check GitHub Actions logs for deployment issues:
- Go to your repository → Actions tab
- Click on the latest workflow run
- Review the logs for any errors

## Security Notes

- Never commit SSH keys or database passwords to the repository
- Use environment variables for sensitive configuration
- Regularly rotate SSH keys and database passwords
- Enable two-factor authentication on your HostGator account