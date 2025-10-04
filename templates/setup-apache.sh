#!/bin/bash
# Apache Setup Script for {{COMPANY_NAME}}
# Configures Apache virtual host for local development

echo "🔧 Setting up Apache for {{COMPANY_NAME}}"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

# Configuration
PROJECT_DIR="$(pwd)"
SITE_NAME="{{PROJECT_NAME}}"
DOMAIN="${SITE_NAME}.local"
CONF_FILE="/etc/apache2/sites-available/${SITE_NAME}.conf"

# Create Apache configuration
echo "📝 Creating Apache configuration..."
cat > "$CONF_FILE" << EOF
<VirtualHost *:80>
    ServerName ${DOMAIN}
    DocumentRoot ${PROJECT_DIR}

    <Directory ${PROJECT_DIR}>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/${SITE_NAME}-error.log
    CustomLog \${APACHE_LOG_DIR}/${SITE_NAME}-access.log combined

    # PHP Configuration
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
</VirtualHost>
EOF

echo "✓ Configuration file created: $CONF_FILE"

# Enable site
echo "🔗 Enabling site..."
a2ensite "${SITE_NAME}.conf"

# Enable required Apache modules
echo "📦 Enabling Apache modules..."
a2enmod rewrite headers deflate expires

# Add to /etc/hosts if not already present
if ! grep -q "${DOMAIN}" /etc/hosts; then
    echo "📝 Adding ${DOMAIN} to /etc/hosts..."
    echo "127.0.0.1    ${DOMAIN}" >> /etc/hosts
    echo "✓ Added ${DOMAIN} to /etc/hosts"
else
    echo "✓ ${DOMAIN} already in /etc/hosts"
fi

# Test Apache configuration
echo "🧪 Testing Apache configuration..."
if apache2ctl configtest; then
    echo "✓ Apache configuration is valid"
else
    echo "❌ Apache configuration has errors"
    exit 1
fi

# Reload Apache
echo "🔄 Reloading Apache..."
systemctl reload apache2

echo ""
echo "✅ Apache setup complete!"
echo ""
echo "📌 Your site is now available at:"
echo "   http://${DOMAIN}"
echo ""
echo "💡 Tips:"
echo "   - Make sure your .env file is configured"
echo "   - Run database migrations: mysql -u root -p < database/schema.sql"
echo "   - Check Apache logs: sudo tail -f /var/log/apache2/${SITE_NAME}-error.log"
