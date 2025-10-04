#!/usr/bin/env python3
"""
Web Page Generator Script
Generates a complete storefront webpage based on the LL Magazine boilerplate.

Usage: ./create_webpage.py project-name [--color PRIMARY_COLOR] [--company "Company Name"]
Example: ./create_webpage.py zezinho-parafusos-page --color "#1e40af" --company "Zezinho Parafusos"
"""

import os
import sys
import shutil
import argparse
import re
from pathlib import Path

# Template variables that will be replaced
TEMPLATE_VARS = {
    'PROJECT_NAME': '',
    'COMPANY_NAME': '',
    'PRIMARY_COLOR': '#dc2626',
    'PRIMARY_COLOR_DARK': '#b91c1c',
    'DB_NAME': '',
    'SITE_URL': 'http://localhost:8080',
    'WHATSAPP_NUMBER': '5534991738581'
}

def hex_to_darker(hex_color):
    """Convert hex color to a darker shade"""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    # Darken by 20%
    r, g, b = int(r * 0.7), int(g * 0.7), int(b * 0.7)
    return f"#{r:02x}{g:02x}{b:02x}"

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def replace_vars(content, variables):
    """Replace template variables in content"""
    for key, value in variables.items():
        content = content.replace(f'{{{{{key}}}}}', str(value))
    return content

def copy_template_file(src, dst, variables):
    """Copy file and replace variables"""
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()

    content = replace_vars(content, variables)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)

def create_project(project_name, company_name=None, primary_color='#dc2626'):
    """Generate complete project structure"""

    # Setup variables
    if company_name is None:
        company_name = project_name.replace('-page', '').replace('-', ' ').title()

    db_name = slugify(project_name).replace('-', '_') + '_db'
    primary_color_dark = hex_to_darker(primary_color)

    variables = {
        'PROJECT_NAME': project_name,
        'COMPANY_NAME': company_name,
        'PRIMARY_COLOR': primary_color,
        'PRIMARY_COLOR_DARK': primary_color_dark,
        'DB_NAME': db_name,
        'SITE_URL': 'http://localhost:8080',
        'WHATSAPP_NUMBER': '5534991738581'
    }

    # Get paths
    script_dir = Path(__file__).parent
    template_dir = script_dir / 'templates'
    target_dir = Path.cwd()

    print(f"📦 Criando projeto: {project_name}")
    print(f"🏢 Empresa: {company_name}")
    print(f"🎨 Cor primária: {primary_color}")
    print(f"💾 Database: {db_name}")
    print(f"📂 Destino: {target_dir}")
    print()

    # Create directory structure
    directories = [
        'api',
        'assets/css',
        'assets/js',
        'assets/images/products',
        'database',
        'logs'
    ]

    for directory in directories:
        (target_dir / directory).mkdir(parents=True, exist_ok=True)

    # Copy template files
    template_files = [
        ('index.html', 'index.html'),
        ('assets/css/style.css', 'assets/css/style.css'),
        ('assets/js/script.js', 'assets/js/script.js'),
        ('api/products.php', 'api/products.php'),
        ('database/schema.sql', 'database/schema.sql'),
        ('database/seed.sql', 'database/seed.sql'),
        ('config/.env.example', '.env.example'),
        ('config/config.php', 'config.php'),
        ('config/.htaccess', '.htaccess'),
        ('config/404.html', '404.html'),
        ('config/500.html', '500.html')
    ]

    print("📝 Copiando arquivos template...")
    for src_path, dst_path in template_files:
        src = template_dir / src_path
        dst = target_dir / dst_path
        if src.exists():
            copy_template_file(src, dst, variables)
            print(f"  ✓ {dst_path}")

    # Copy utility scripts
    utility_files = ['create_images.py', 'test-local.sh', 'setup-apache.sh']
    print("\n🔧 Copiando scripts utilitários...")
    for file_name in utility_files:
        src = template_dir / file_name
        dst = target_dir / file_name
        if src.exists():
            copy_template_file(src, dst, variables)
            os.chmod(dst, 0o755)
            print(f"  ✓ {file_name}")

    # Create .gitignore
    gitignore_content = """.env
logs/*
!logs/.gitkeep
.DS_Store
*.log
"""
    (target_dir / '.gitignore').write_text(gitignore_content)

    # Create logs/.gitkeep
    (target_dir / 'logs' / '.gitkeep').touch()

    # Create README
    readme_content = f"""# {company_name}

Vitrine virtual responsiva para {company_name}.

## Setup Rápido

1. **Configurar ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

2. **Criar database:**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p {db_name} < database/seed.sql
   ```

3. **Iniciar servidor:**
   ```bash
   php -S localhost:8080
   ```

4. **Acessar:** http://localhost:8080

## Comandos

- **Servidor local:** `php -S localhost:8080`
- **Testar API:** `./test-local.sh`
- **Gerar imagens:** `python3 create_images.py`
- **Setup Apache:** `sudo ./setup-apache.sh`

## Configuração

Todas as configurações estão no arquivo `.env`:
- Database credentials
- WhatsApp número
- Site URL e email

Veja `.env.example` para referência.

---
🤖 Gerado com boilerplate-webpage
"""
    (target_dir / 'README.md').write_text(readme_content)

    print(f"\n✅ Projeto {project_name} criado com sucesso!")
    print("\n📋 Próximos passos:")
    print("  1. cp .env.example .env")
    print("  2. Edite .env com suas credenciais MySQL e WhatsApp")
    print("  3. mysql -u root -p < database/schema.sql")
    print(f"  4. mysql -u root -p {db_name} < database/seed.sql")
    print("  5. php -S localhost:8080")
    print("\n🌐 Acesse: http://localhost:8080")

def main():
    parser = argparse.ArgumentParser(
        description='Gerador de páginas web baseado no boilerplate LL Magazine',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  ./create_webpage.py minha-loja-page
  ./create_webpage.py zezinho-parafusos-page --color "#1e40af" --company "Zezinho Parafusos"
  ./create_webpage.py boutique-page --color "#ec4899" --company "Boutique Elegance"
        """
    )

    parser.add_argument('project_name', help='Nome do projeto (ex: minha-loja-page)')
    parser.add_argument('--color', default='#dc2626', help='Cor primária em hex (default: #dc2626)')
    parser.add_argument('--company', help='Nome da empresa (default: deriva do project_name)')
    parser.add_argument('--whatsapp', help='Número WhatsApp (default: 5534991738581)')

    args = parser.parse_args()

    # Validate color format
    if not re.match(r'^#[0-9a-fA-F]{6}$', args.color):
        print(f"❌ Erro: Cor inválida '{args.color}'. Use formato hex: #RRGGBB")
        sys.exit(1)

    # Update WhatsApp if provided
    if args.whatsapp:
        TEMPLATE_VARS['WHATSAPP_NUMBER'] = args.whatsapp

    create_project(args.project_name, args.company, args.color)

if __name__ == '__main__':
    main()
