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
    target_dir = Path.cwd() / project_name

    # Check if target directory already exists
    if target_dir.exists():
        print(f"❌ Erro: O diretório '{project_name}' já existe!")
        print(f"   Caminho: {target_dir}")
        sys.exit(1)

    print(f"📦 Criando projeto: {project_name}")
    print(f"🏢 Empresa: {company_name}")
    print(f"🎨 Cor primária: {primary_color}")
    print(f"💾 Database: {db_name}")
    print(f"📂 Destino: {target_dir}")
    print()

    # Create directory structure
    directories = [
        'api',
        'api/admin',
        'assets/css',
        'assets/js',
        'assets/images/products',
        'admin/css',
        'admin/js',
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
        ('assets/js/color-mapping.js', 'assets/js/color-mapping.js'),
        ('api/products.php', 'api/products.php'),
        ('api/auth.php', 'api/auth.php'),
        ('api/JWT.php', 'api/JWT.php'),
        ('api/admin/products.php', 'api/admin/products.php'),
        ('api/admin/upload.php', 'api/admin/upload.php'),
        ('admin/login.html', 'admin/login.html'),
        ('admin/index.html', 'admin/index.html'),
        ('admin/css/admin.css', 'admin/css/admin.css'),
        ('admin/js/admin.js', 'admin/js/admin.js'),
        ('admin/js/login.js', 'admin/js/login.js'),
        ('database/schema.sql', 'database/schema.sql'),
        ('database/seed.sql', 'database/seed.sql'),
        ('database/admin_schema.sql', 'database/admin_schema.sql'),
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
            try:
                copy_template_file(src, dst, variables)
                print(f"  ✓ {dst_path}")
            except Exception as e:
                print(f"  ❌ Erro ao copiar {dst_path}: {e}")
        else:
            print(f"  ⚠️  Template não encontrado: {src_path}")

    # Copy utility scripts
    utility_files = ['create_images.py', 'test-local.sh', 'setup-apache.sh']
    print("\n🔧 Copiando scripts utilitários...")
    for file_name in utility_files:
        src = template_dir / file_name
        dst = target_dir / file_name
        if src.exists():
            try:
                copy_template_file(src, dst, variables)
                os.chmod(dst, 0o755)
                print(f"  ✓ {file_name}")
            except Exception as e:
                print(f"  ❌ Erro ao copiar {file_name}: {e}")
        else:
            print(f"  ⚠️  Script não encontrado: {file_name}")

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
   mysql -u root -p {db_name} < database/admin_schema.sql
   ```

3. **Iniciar servidor:**
   ```bash
   php -S localhost:8080
   ```

4. **Acessar:**
   - Site: http://localhost:8080
   - Admin: http://localhost:8080/admin/login.html
     - Usuário: `admin`
     - Senha: `admin123`

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

    # Generate placeholder images
    print("\n🖼️  Gerando imagens placeholder...")
    try:
        import subprocess
        create_images_script = target_dir / 'create_images.py'
        if create_images_script.exists():
            result = subprocess.run(
                ['python3', str(create_images_script)],
                cwd=str(target_dir),
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                print("  ✓ Imagens placeholder geradas com sucesso")
            else:
                print(f"  ⚠️  Erro ao gerar imagens: {result.stderr}")
                print("  Execute manualmente: python3 create_images.py")
    except Exception as e:
        print(f"  ⚠️  Não foi possível gerar imagens automaticamente: {e}")
        print("  Execute manualmente: python3 create_images.py")

    # Create .env from .env.example
    print("\n⚙️  Configurando .env...")
    try:
        env_example = target_dir / '.env.example'
        env_file = target_dir / '.env'
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print("  ✓ Arquivo .env criado (edite as credenciais MySQL)")
        else:
            print("  ⚠️  .env.example não encontrado")
    except Exception as e:
        print(f"  ⚠️  Erro ao criar .env: {e}")

    print(f"\n✅ Projeto {project_name} criado com sucesso!")
    print("\n📋 Próximos passos:")
    print("  1. Edite .env com suas credenciais MySQL")
    print(f"     nano .env")
    print(f"     DB_PASS=sua_senha_mysql")
    print("")
    print("  2. Criar e popular banco de dados:")
    print(f"     cd {project_name}")
    print(f"     mysql -u root -p < database/schema.sql")
    print(f"     mysql -u root -p {db_name} < database/seed.sql")
    print(f"     mysql -u root -p {db_name} < database/admin_schema.sql")
    print("")
    print("  3. Iniciar servidor:")
    print(f"     php -S localhost:8080")
    print("\n🌐 Acesse:")
    print("  - Site: http://localhost:8080")
    print("  - Admin: http://localhost:8080/admin/login.html")
    print("    Usuário: admin")
    print("    Senha: admin123")

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
