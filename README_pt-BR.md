# Boilerplate Webpage Generator

[English](README.md) | **Português**

Gerador de sites de vitrine virtual. Cria rapidamente sites completos com backend PHP, MySQL e frontend responsivo.

## Características

- **Frontend**: HTML5, CSS3, JavaScript (ES6+) - Sem frameworks, sem build tools
- **Backend**: PHP + MySQL com API REST
- **Design**: Responsivo, mobile-first
- **Integração**: WhatsApp para vendas
- **Customização**: Cores personalizáveis via linha de comando

## Requisitos

- Python 3.6+
- PHP 7.4+
- MySQL 5.7+
- Apache2 (opcional, para produção)

## Uso Rápido

### 1. Criar um novo projeto

```bash
# Crie uma pasta para o novo projeto
mkdir minha-loja-page
cd minha-loja-page

# Copie o script gerador
cp /path/to/boilerplate-webpage/create_webpage.py .

# Execute o gerador
./create_webpage.py minha-loja-page
```

### 2. Com customização de cor e nome

```bash
./create_webpage.py zezinho-parafusos-page \
  --color "#1e40af" \
  --company "Zezinho Parafusos"
```

### 3. Parâmetros disponíveis

```bash
./create_webpage.py PROJECT_NAME [OPTIONS]

Opções:
  --color COLOR       Cor primária em hex (ex: #dc2626)
  --company NAME      Nome da empresa
  --whatsapp NUMBER   Número WhatsApp (ex: 5534991234567)
```

## O que é gerado

Após executar o script, você terá a seguinte estrutura:

```
minha-loja-page/
├── index.html              # Página principal
├── config.php              # Configuração PHP
├── .env.example            # Template de variáveis de ambiente
├── .htaccess              # Configuração Apache
├── 404.html / 500.html    # Páginas de erro
├── README.md              # Documentação do projeto
├── admin/                 # Painel administrativo
│   ├── login.html         # Login do admin
│   ├── index.html         # Dashboard de produtos
│   ├── css/
│   │   └── admin.css      # Estilos do painel admin
│   └── js/
│       ├── admin.js       # JavaScript do dashboard
│       └── login.js       # JavaScript do login
├── api/
│   ├── products.php       # API REST pública
│   └── admin/
│       ├── products.php   # API CRUD de produtos
│       └── upload.php     # Upload de imagens
├── assets/
│   ├── css/
│   │   └── style.css      # Estilos (com variáveis CSS)
│   ├── js/
│   │   └── script.js      # JavaScript
│   └── images/
│       └── products/      # Imagens dos produtos
├── database/
│   ├── schema.sql         # Schema do banco (produtos)
│   ├── seed.sql           # Dados iniciais
│   └── admin_schema.sql   # Schema de usuários admin
└── logs/                  # Logs da aplicação
```

## Setup do Projeto Gerado

### 1. Configurar ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais MySQL e WhatsApp
```

### 2. Criar database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p nome_do_banco < database/seed.sql
mysql -u root -p nome_do_banco < database/admin_schema.sql
```

### 3. Iniciar servidor local

```bash
# PHP built-in server (recomendado para desenvolvimento)
php -S localhost:8080

# OU Apache (para produção)
sudo ./setup-apache.sh
```

### 4. Acessar

- Site: `http://localhost:8080`
- Painel Admin: `http://localhost:8080/admin/login.html`
  - Usuário padrão: `admin`
  - Senha padrão: configurada no database (altere após primeiro login)

## Customização de Cores

O script automaticamente converte a cor primária fornecida em variáveis CSS:

```css
:root {
    --primary-color: #1e40af;        /* Sua cor */
    --primary-color-dark: #1530ab;   /* Auto-gerada (mais escura) */
    --primary-color-light: #1e40af1a; /* Com transparência */
}
```

## Exemplos de Uso

### Loja de roupas (rosa)
```bash
./create_webpage.py boutique-elegance-page \
  --color "#ec4899" \
  --company "Boutique Elegance"
```

### Loja de ferramentas (azul)
```bash
./create_webpage.py ferramentas-zezinho-page \
  --color "#1e40af" \
  --company "Zezinho Parafusos"
```

### Loja de cosméticos (roxo)
```bash
./create_webpage.py beleza-cosmeticos-page \
  --color "#9333ea" \
  --company "Beleza Cosméticos"
```

## Templates Incluídos

### Frontend
- Layout responsivo (mobile, tablet, desktop)
- Sistema de categorias
- Modal de produtos
- Integração WhatsApp
- Loading states
- Error pages (404, 500)
- Painel administrativo completo
- Sistema de login com autenticação JWT

### Backend
- API REST em PHP
- CRUD completo de produtos (admin)
- API pública de leitura
- Filtros por categoria
- Upload de imagens
- Sistema de autenticação
- Rate limiting
- CORS configurado
- Prepared statements (segurança)

### Database
- Schema com foreign keys
- Suporte a JSON (cores, tamanhos)
- Índices otimizados
- Seed data de exemplo
- Tabela de usuários administrativos
- Hash de senhas com bcrypt

## Scripts Utilitários

Cada projeto gerado inclui:

- **create_images.py** - Gera imagens placeholder para produtos
- **test-local.sh** - Testa API e conectividade
- **setup-apache.sh** - Configura Apache virtual host

```bash
# Gerar imagens placeholder
python3 create_images.py

# Testar ambiente
./test-local.sh

# Configurar Apache
sudo ./setup-apache.sh
```

## Estrutura da API

### Endpoints Públicos

```
GET  /api/products.php              # Todos os produtos
GET  /api/products.php?category=X   # Filtrar por categoria
GET  /api/products.php?config=1     # Configuração (WhatsApp)
GET  /api/products/{id}             # Produto específico
GET  /api/products/categories       # Todas as categorias
POST /api/products.php              # Contact/Newsletter
```

### Endpoints Admin (requer autenticação)

```
POST /api/admin/login.php           # Login administrativo
GET  /api/admin/products.php        # Listar produtos (admin)
POST /api/admin/products.php        # Criar produto
PUT  /api/admin/products.php        # Atualizar produto
DELETE /api/admin/products.php      # Deletar produto
POST /api/admin/upload.php          # Upload de imagem
```

## Segurança

- Sanitização de inputs
- Prepared statements (PDO)
- JWT para autenticação admin
- Hash de senhas com bcrypt
- CSRF tokens
- Rate limiting
- Headers de segurança
- .env não commitado no git
- Validação de upload de arquivos

## Deploy (Hostinger)

1. Upload dos arquivos para `public_html/`
2. Criar `.env` no servidor (copiar de `.env.example`)
3. Importar schemas via phpMyAdmin:
   - `database/schema.sql`
   - `database/seed.sql`
   - `database/admin_schema.sql`
4. Verificar permissões: `logs/` = 777, `assets/images/products/` = 755
5. Ativar SSL/HTTPS no painel Hostinger
6. Acessar painel admin e alterar senha padrão

## Troubleshooting

### "Database connection failed"
- Verifique credenciais no `.env`
- Confirme que o banco existe: `mysql -u root -p -e "SHOW DATABASES;"`

### "API returns 404"
- Verifique se `.htaccess` existe
- Teste com PHP server: `php -S localhost:8080`

### "WhatsApp não abre"
- Verifique `WHATSAPP_NUMBER` no `.env`
- Formato correto: `55DDD9XXXXXXXX` (sem espaços ou símbolos)

## Licença

Este boilerplate está disponível para uso livre.

## Contribuindo

Para melhorias no boilerplate:
1. Edite os templates em `boilerplate-webpage/templates/`
2. Teste gerando um novo projeto
3. Documente as mudanças

---

**Gerado por**: Boilerplate Webpage Generator
**Versão**: 1.0.0
