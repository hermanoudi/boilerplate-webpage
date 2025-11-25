# Boilerplate Webpage Generator

**English** | [Português](README_pt-BR.md)

Virtual storefront website generator. Quickly creates complete websites with PHP backend, MySQL, and responsive frontend.

## Features

- **Frontend**: HTML5, CSS3, JavaScript (ES6+) - No frameworks, no build tools
- **Backend**: PHP + MySQL with REST API
- **Design**: Responsive, mobile-first
- **Integration**: WhatsApp for sales
- **Customization**: Customizable colors via command line

## Requirements

- Python 3.6+
- PHP 7.4+
- MySQL 5.7+
- Apache2 (optional, for production)

## Quick Start

### 1. Create a new project

```bash
# Create a folder for the new project
mkdir my-store-page
cd my-store-page

# Copy the generator script
cp /path/to/boilerplate-webpage/create_webpage.py .

# Run the generator
./create_webpage.py my-store-page
```

### 2. With custom color and name

```bash
./create_webpage.py johns-hardware-page \
  --color "#1e40af" \
  --company "John's Hardware Store"
```

### 3. Available parameters

```bash
./create_webpage.py PROJECT_NAME [OPTIONS]

Options:
  --color COLOR       Primary color in hex (e.g., #dc2626)
  --company NAME      Company name
  --whatsapp NUMBER   WhatsApp number (e.g., 5534991234567)
```

## What Gets Generated

After running the script, you'll have the following structure:

```
my-store-page/
├── index.html              # Main page
├── config.php              # PHP configuration
├── .env.example            # Environment variables template
├── .htaccess              # Apache configuration
├── 404.html / 500.html    # Error pages
├── README.md              # Project documentation
├── admin/                 # Admin panel
│   ├── login.html         # Admin login
│   ├── index.html         # Product dashboard
│   ├── css/
│   │   └── admin.css      # Admin panel styles
│   └── js/
│       ├── admin.js       # Dashboard JavaScript
│       └── login.js       # Login JavaScript
├── api/
│   ├── products.php       # Public REST API
│   └── admin/
│       ├── products.php   # Product CRUD API
│       └── upload.php     # Image upload
├── assets/
│   ├── css/
│   │   └── style.css      # Styles (with CSS variables)
│   ├── js/
│   │   └── script.js      # JavaScript
│   └── images/
│       └── products/      # Product images
├── database/
│   ├── schema.sql         # Database schema (products)
│   ├── seed.sql           # Initial data
│   └── admin_schema.sql   # Admin users schema
└── logs/                  # Application logs
```

## Generated Project Setup

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and WhatsApp
```

### 2. Create database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p database_name < database/seed.sql
mysql -u root -p database_name < database/admin_schema.sql
```

### 3. Start local server

```bash
# PHP built-in server (recommended for development)
php -S localhost:8080

# OR Apache (for production)
sudo ./setup-apache.sh
```

### 4. Access

- Website: `http://localhost:8080`
- Admin Panel: `http://localhost:8080/admin/login.html`
  - Default user: `admin`
  - Default password: configured in database (change after first login)

## Color Customization

The script automatically converts the provided primary color into CSS variables:

```css
:root {
    --primary-color: #1e40af;        /* Your color */
    --primary-color-dark: #1530ab;   /* Auto-generated (darker) */
    --primary-color-light: #1e40af1a; /* With transparency */
}
```

## Usage Examples

### Clothing store (pink)
```bash
./create_webpage.py boutique-elegance-page \
  --color "#ec4899" \
  --company "Boutique Elegance"
```

### Hardware store (blue)
```bash
./create_webpage.py johns-hardware-page \
  --color "#1e40af" \
  --company "John's Hardware Store"
```

### Cosmetics store (purple)
```bash
./create_webpage.py beauty-cosmetics-page \
  --color "#9333ea" \
  --company "Beauty Cosmetics"
```

## Included Templates

### Frontend
- Responsive layout (mobile, tablet, desktop)
- Category system
- Product modal
- WhatsApp integration
- Loading states
- Error pages (404, 500)
- Complete admin panel
- Login system with JWT authentication

### Backend
- REST API in PHP
- Complete product CRUD (admin)
- Public read API
- Category filters
- Image upload
- Authentication system
- Rate limiting
- CORS configured
- Prepared statements (security)

### Database
- Schema with foreign keys
- JSON support (colors, sizes)
- Optimized indexes
- Sample seed data
- Administrative users table
- Bcrypt password hashing

## Utility Scripts

Each generated project includes:

- **create_images.py** - Generates placeholder images for products
- **test-local.sh** - Tests API and connectivity
- **setup-apache.sh** - Configures Apache virtual host

```bash
# Generate placeholder images
python3 create_images.py

# Test environment
./test-local.sh

# Configure Apache
sudo ./setup-apache.sh
```

## API Structure

### Public Endpoints

```
GET  /api/products.php              # All products
GET  /api/products.php?category=X   # Filter by category
GET  /api/products.php?config=1     # Configuration (WhatsApp)
GET  /api/products/{id}             # Specific product
GET  /api/products/categories       # All categories
POST /api/products.php              # Contact/Newsletter
```

### Admin Endpoints (requires authentication)

```
POST /api/admin/login.php           # Admin login
GET  /api/admin/products.php        # List products (admin)
POST /api/admin/products.php        # Create product
PUT  /api/admin/products.php        # Update product
DELETE /api/admin/products.php      # Delete product
POST /api/admin/upload.php          # Image upload
```

## Security

- Input sanitization
- Prepared statements (PDO)
- JWT for admin authentication
- Bcrypt password hashing
- CSRF tokens
- Rate limiting
- Security headers
- .env not committed to git
- File upload validation

## Deploy (Hostinger)

1. Upload files to `public_html/`
2. Create `.env` on server (copy from `.env.example`)
3. Import schemas via phpMyAdmin:
   - `database/schema.sql`
   - `database/seed.sql`
   - `database/admin_schema.sql`
4. Check permissions: `logs/` = 777, `assets/images/products/` = 755
5. Enable SSL/HTTPS in Hostinger panel
6. Access admin panel and change default password

## Troubleshooting

### "Database connection failed"
- Check credentials in `.env`
- Confirm database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "API returns 404"
- Check if `.htaccess` exists
- Test with PHP server: `php -S localhost:8080`

### "WhatsApp doesn't open"
- Check `WHATSAPP_NUMBER` in `.env`
- Correct format: `55DDD9XXXXXXXX` (no spaces or symbols)

## License

This boilerplate is available for free use.

## Contributing

To improve the boilerplate:
1. Edit templates in `boilerplate-webpage/templates/`
2. Test by generating a new project
3. Document changes

---

**Generated by**: Boilerplate Webpage Generator
**Version**: 1.0.0
