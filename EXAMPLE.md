# Exemplo de Uso - Boilerplate Webpage

Este guia mostra como criar um site completo do zero em menos de 5 minutos.

## 📝 Cenário

Vamos criar uma loja virtual para "Zezinho Parafusos", uma loja de ferramentas com cor azul (#1e40af).

## 🚀 Passo a Passo

### 1. Preparar o ambiente

```bash
# Criar pasta do projeto
mkdir ~/projetos/zezinho-parafusos-page
cd ~/projetos/zezinho-parafusos-page

# Copiar o script gerador
cp ~/projetos/boilerplate-webpage/create_webpage.py .
```

### 2. Gerar o projeto

```bash
./create_webpage.py zezinho-parafusos-page \
  --color "#1e40af" \
  --company "Zezinho Parafusos" \
  --whatsapp "5534991234567"
```

**Saída esperada:**
```
📦 Criando projeto: zezinho-parafusos-page
🏢 Empresa: Zezinho Parafusos
🎨 Cor primária: #1e40af
💾 Database: zezinho_parafusos_page_db
📂 Destino: /home/user/projetos/zezinho-parafusos-page

📝 Copiando arquivos template...
  ✓ index.html
  ✓ assets/css/style.css
  ✓ assets/js/script.js
  ✓ api/products.php
  ✓ database/schema.sql
  ✓ database/seed.sql
  ✓ .env.example
  ✓ config.php
  ...

✅ Projeto zezinho-parafusos-page criado com sucesso!
```

### 3. Configurar ambiente

```bash
# Copiar template de configuração
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**Exemplo de .env:**
```env
DB_HOST=localhost
DB_NAME=zezinho_parafusos_page_db
DB_USER=root
DB_PASS=sua_senha_mysql

WHATSAPP_NUMBER=5534991234567
WHATSAPP_MESSAGE=Olá! Gostaria de saber mais sobre este produto da Zezinho Parafusos:

SITE_NAME=Zezinho Parafusos
SITE_URL=http://localhost:8080
SITE_EMAIL=contato@zezinhoparafusos.com

APP_ENV=development
```

### 4. Criar database

```bash
# Login no MySQL
mysql -u root -p

# Criar database (já incluído no schema.sql)
mysql -u root -p < database/schema.sql

# Popular com dados de exemplo
mysql -u root -p zezinho_parafusos_page_db < database/seed.sql
```

### 5. Gerar imagens placeholder (opcional)

```bash
# Instalar Pillow se necessário
pip3 install Pillow

# Gerar imagens
python3 create_images.py
```

### 6. Iniciar servidor

```bash
# PHP built-in server (desenvolvimento)
php -S localhost:8080
```

### 7. Testar

```bash
# Em outro terminal
./test-local.sh
```

**Saída esperada:**
```
🧪 Testing Zezinho Parafusos Local Environment
==============================================
1. Checking .env file... ✓
2. Checking PHP server... ✓
3. Testing API (GET all products)... ✓
   Found 6 products
4. Testing API (GET config)... ✓
   WhatsApp: 5534991234567
5. Testing API (GET single product)... ✓
6. Testing database connection... ✓

✅ All tests passed!
🌐 Access your site at: http://localhost:8080
```

### 8. Acessar o site

Abra no navegador: **http://localhost:8080**

Você verá:
- Header com logo "Zezinho Parafusos"
- Hero banner com cor azul (#1e40af)
- Categorias de produtos
- Grid de produtos com dados de exemplo
- Integração com WhatsApp funcionando

## 🎨 Customizações Comuns

### Alterar produtos

Edite `database/seed.sql` e reimporte:

```sql
INSERT INTO `products` (...) VALUES
(
    'Furadeira Profissional 1000W',
    'ferramentas',
    '449,90',
    '599,90',
    25,
    'assets/images/products/furadeira.jpg',
    'Furadeira de impacto com maleta e acessórios',
    JSON_ARRAY('#000000', '#FFD700'),
    NULL,  -- Sem tamanhos
    TRUE,
    TRUE
);
```

### Alterar categorias

Edite `database/seed.sql`:

```sql
INSERT INTO `categories` (`id`, `name`, `icon`, `display_order`) VALUES
('ferramentas', 'Ferramentas', 'fas fa-tools', 1),
('eletricas', 'Elétricas', 'fas fa-bolt', 2),
('manuais', 'Manuais', 'fas fa-wrench', 3);
```

### Adicionar suas próprias imagens

```bash
# Criar pasta de imagens
mkdir -p assets/images/products

# Copiar suas imagens
cp ~/fotos/produto1.jpg assets/images/products/

# Atualizar banco de dados
UPDATE products
SET image = 'assets/images/products/produto1.jpg'
WHERE id = 1;
```

## 🚀 Deploy para Produção (Hostinger)

### 1. Preparar arquivos

```bash
# Criar arquivo zip
zip -r zezinho-parafusos.zip . -x "*.git*" "logs/*" ".env"
```

### 2. Upload via FTP

- Conectar ao FTP do Hostinger
- Upload para `public_html/`
- Extrair arquivos

### 3. Configurar no servidor

```bash
# Criar .env no servidor (via File Manager ou FTP)
# Copiar conteúdo de .env.example e editar:

APP_ENV=production
DB_HOST=localhost
DB_NAME=u123456_zezinho
DB_USER=u123456_user
DB_PASS=senha_gerada_pelo_hostinger
SITE_URL=https://zezinhoparafusos.com
```

### 4. Importar database

- Acessar phpMyAdmin no hPanel
- Criar database (se não existe)
- Importar `database/schema.sql`
- Importar `database/seed.sql`

### 5. Verificar permissões

```bash
# Via SSH ou File Manager
chmod 755 assets/images/products
chmod 777 logs
```

### 6. Ativar SSL

- No hPanel, ativar SSL/HTTPS
- Site estará disponível em: `https://zezinhoparafusos.com`

## 🎯 Outros Exemplos

### Boutique de roupas (Rosa)

```bash
./create_webpage.py boutique-elegance-page \
  --color "#ec4899" \
  --company "Boutique Elegance" \
  --whatsapp "5534998765432"
```

### Loja de cosméticos (Roxo)

```bash
./create_webpage.py beleza-cosmeticos-page \
  --color "#9333ea" \
  --company "Beleza Cosméticos" \
  --whatsapp "5534987654321"
```

### Loja de esportes (Verde)

```bash
./create_webpage.py esportes-action-page \
  --color "#16a34a" \
  --company "Esportes Action" \
  --whatsapp "5534976543210"
```

## 💡 Dicas

### Performance
- Otimize imagens antes do upload (use TinyPNG ou similar)
- Ative GZIP no servidor (já configurado no .htaccess)
- Use CDN para assets estáticos (opcional)

### SEO
- Edite `<title>` e `<meta>` tags no index.html
- Adicione `sitemap.xml` e `robots.txt`
- Configure Google Analytics (se necessário)

### Segurança
- Nunca commite o arquivo `.env`
- Use senhas fortes no banco de dados
- Mantenha PHP atualizado
- Ative firewall no Hostinger

## 🐛 Troubleshooting

### Erro "Database connection failed"
```bash
# Verificar credenciais
cat .env | grep DB_

# Testar conexão MySQL
mysql -h localhost -u root -p -e "SHOW DATABASES;"
```

### Erro "API returns 404"
```bash
# Verificar se PHP está rodando
ps aux | grep php

# Reiniciar servidor
killall php
php -S localhost:8080
```

### WhatsApp não abre
```bash
# Verificar formato do número (sem espaços ou símbolos)
# Correto: 5534991234567
# Errado: (34) 99123-4567
```

---

**Tempo total**: ~5 minutos
**Resultado**: Site completo, responsivo, com backend e banco de dados funcionando!
