# LD11 Campaign Data Visualization Dashboard

A comprehensive dashboard for the LD11 team to visualize campaign data and manage voter information.

## Features

### Data Tab
- **Ad Spend Analytics**: Visualizations of campaign spending by optimization type and target
- **Voter Registration Data**: Party affiliation breakdowns and registration statistics
- **Election Results**: Precinct-level turnout analysis and candidate performance
- **Interactive Charts**: Bar charts, pie charts, area charts, and data tables
- **Key Metrics**: Total spend, reach, turnout percentages, and voter counts

### Voters Tab
- **Database Management**: Upload and manage LD11.csv voter data
- **CSV Import**: Automatic parsing and import of voter information
- **Data Viewing**: Searchable table of voter records
- **Database Status**: Real-time connection status monitoring

## Technology Stack

- **Frontend**: React 18 with Recharts for visualizations
- **Backend**: PHP with MySQL database
- **Deployment**: HostGator compatible

## Installation & Deployment

### 1. HostGator Database Setup

1. Log into your HostGator cPanel
2. Navigate to "MySQL Databases" in the Databases section
3. Create a new database named "ld11_voters"
4. Create a new MySQL user with a strong password
5. Add the user to the database with "All Privileges"
6. Note down the database details:
   - Database name: `yourusername_ld11_voters`
   - Username: `yourusername_dbuser`
   - Password: `[your chosen password]`
   - Host: `localhost`

### 2. Update Database Configuration

Edit `voters_api.php` and update the database configuration:

```php
$db_config = [
    'host' => 'localhost',
    'dbname' => 'yourusername_ld11_voters', // Your actual database name
    'username' => 'yourusername_dbuser',     // Your actual username
    'password' => 'your_password_here'       // Your actual password
];
```

### 3. Upload Files to HostGator

Upload all files to your HostGator public_html directory:

```
public_html/
├── index.php
├── voters_api.php
├── package.json
├── public/
│   ├── index.html
│   ├── ld11adspend.csv
│   ├── ld11results.json
│   └── results.csv
└── src/
    ├── index.js
    ├── App.js
    ├── App.css
    └── components/
        ├── DataTab.js
        └── VotersTab.js
```

### 4. Build React Application

If you have Node.js installed locally:

```bash
npm install
npm run build
```

Then upload the `build/` folder contents to your HostGator directory.

Alternatively, you can use the development version by serving the files directly.

### 5. Access the Dashboard

Visit your domain to access the dashboard:
- `https://yourdomain.com/` - Main dashboard
- `https://yourdomain.com/data` - Data visualization tab
- `https://yourdomain.com/voters` - Voter management tab

## Data Sources

The dashboard uses three main data sources:

1. **ld11adspend.csv**: Campaign advertising data with spending, reach, and performance metrics
2. **ld11results.json**: Voter registration and turnout data by party affiliation
3. **results.csv**: Detailed election results by precinct with candidate performance

## API Endpoints

### Data API (index.php)
- `?endpoint=adspend` - Ad spend data and analytics
- `?endpoint=voterdata` - Voter registration data
- `?endpoint=results` - Election results data
- `?endpoint=dashboard` - Dashboard summary data

### Voters API (voters_api.php)
- `?action=status` - Check database connection status
- `?action=fetch` - Retrieve voter records
- `?action=upload` - Upload CSV file (POST)
- `?action=clear` - Clear all voter data (POST)

## File Structure

```
├── index.php                 # Main API endpoint for data
├── voters_api.php           # Voter database management API
├── package.json             # React dependencies
├── public/
│   ├── index.html          # Main HTML template
│   ├── ld11adspend.csv     # Ad spend data
│   ├── ld11results.json    # Voter registration data
│   └── results.csv         # Election results data
└── src/
    ├── index.js            # React entry point
    ├── App.js              # Main React component
    ├── App.css             # Global styles
    └── components/
        ├── DataTab.js      # Data visualization component
        └── VotersTab.js    # Voter management component
```

## Usage

### Data Tab
- View campaign spending analytics and performance metrics
- Analyze voter registration patterns by party
- Review election results and turnout by precinct
- Export data or take screenshots for reports

### Voters Tab
1. Ensure database is connected (green status indicator)
2. Upload your LD11.csv file using the file upload interface
3. View imported voter data in the table
4. Use refresh to reload data or clear to remove all records

## Troubleshooting

### Database Connection Issues
- Verify database credentials in `voters_api.php`
- Ensure database and user exist in HostGator cPanel
- Check that user has proper permissions

### File Upload Issues
- Ensure CSV file is properly formatted
- Check file size limits on HostGator
- Verify file permissions on server

### React Build Issues
- Run `npm install` to install dependencies
- Use `npm run build` to create production build
- Ensure all files are uploaded to correct directories

## Support

For technical support or questions about the dashboard, please contact the development team.

## License

This project is proprietary software for the LD11 campaign team.
