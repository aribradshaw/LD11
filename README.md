# LD11 Campaign Dashboard

A comprehensive dashboard for visualizing 2024 Meta ad spend data and election results for Legislative District 11, with voter database management capabilities.

## Features

### 📊 Dashboard Tab
- **Ad Spend Analytics**: Visualize Meta advertising spend by optimization type and target audience
- **Election Results**: Display precinct-level turnout and candidate performance
- **Key Metrics**: Total spend, reach, impressions, and voter turnout statistics
- **Interactive Charts**: Bar charts, pie charts, and area charts for data visualization
- **Real-time Data**: Refresh functionality to update data from CSV/JSON sources

### 👥 Voters Tab
- **Database Management**: MySQL integration for voter data storage
- **CSV Import**: Upload and process LD11.csv voter files
- **Data Visualization**: View and manage voter records
- **Database Status**: Real-time connection monitoring

## Technology Stack

- **Frontend**: React 18 with React Router
- **Charts**: Recharts for data visualization
- **Backend**: PHP with MySQL
- **Deployment**: GitHub Actions to HostGator
- **Styling**: Custom CSS with mobile-first responsive design

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PHP 7.4+ with MySQL support
- HostGator hosting account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ld11
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser
   - The dashboard will load with sample data from the `public/` folder

### Data Files

The dashboard uses the following data files in the `public/` directory:

- `ld11adspend.csv` - Meta advertising spend data
- `ld11results.json` - Voter registration statistics
- `results.csv` - Election results by precinct
- `LD11.csv` - Voter database for import

## HostGator Deployment

### Automatic Deployment (Recommended)

1. **Set up GitHub Secrets** (see `deploy-config.md` for details):
   - `HOSTGATOR_HOST`
   - `HOSTGATOR_USERNAME`
   - `HOSTGATOR_SSH_KEY`

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **Monitor deployment** in GitHub Actions tab

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Upload files to HostGator**:
   - Upload `build/` contents to `/public_html/sunbeltsolutions.org/ld11/`
   - Upload PHP files to the same directory
   - Upload `public/` contents to `/public_html/sunbeltsolutions.org/ld11/public/`

3. **Configure Apache** (create `.htaccess`):
   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

## Database Setup

### MySQL Database Configuration

1. **Log into HostGator cPanel**
2. **Navigate to "MySQL Databases"**
3. **Create database**: `ld11_voters`
4. **Create MySQL user** with strong password
5. **Add user to database** with "All Privileges"
6. **Update configuration** in `voters_api.php`:

```php
$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters',
    'username' => 'yourusername_dbuser',
    'password' => 'your_secure_password'
];
```

### Database Schema

The application automatically creates the following table:

```sql
CREATE TABLE voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    party VARCHAR(50),
    precinct VARCHAR(100),
    voter_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Data API (`fixed-api.php`)

- `GET /ld11/fixed-api.php?endpoint=adspend` - Ad spend data
- `GET /ld11/fixed-api.php?endpoint=voterdata` - Voter registration data
- `GET /ld11/fixed-api.php?endpoint=results` - Election results
- `GET /ld11/fixed-api.php?endpoint=dashboard` - Dashboard summary

### Voters API (`voters_api.php`)

- `GET /ld11/voters_api.php?action=status` - Database connection status
- `GET /ld11/voters_api.php?action=fetch` - Retrieve voter records
- `POST /ld11/voters_api.php?action=upload` - Upload CSV file
- `POST /ld11/voters_api.php?action=clear` - Clear all voter data

## Mobile Optimization

The dashboard is fully responsive and optimized for mobile devices:

- **Responsive Grid**: Charts and tables adapt to screen size
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Navigation**: Collapsible navigation for small screens
- **Optimized Typography**: Readable text at all screen sizes

## File Structure

```
ld11/
├── .github/workflows/     # GitHub Actions deployment
├── public/                # Static assets and data files
├── src/
│   ├── components/        # React components
│   │   ├── DataTab.js     # Dashboard visualizations
│   │   └── VotersTab.js   # Voter management
│   ├── App.js            # Main application
│   ├── App.css           # Styling
│   └── index.js          # Entry point
├── *.php                 # Backend API files
├── package.json          # Dependencies
├── deploy-config.md      # Deployment instructions
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## Support

For issues and questions:

1. Check the GitHub Issues page
2. Review the deployment configuration in `deploy-config.md`
3. Verify database connectivity and file permissions
4. Check browser console for JavaScript errors

## License

This project is proprietary software for LD11 campaign use.

---

**Built with ❤️ for LD11 Campaign**