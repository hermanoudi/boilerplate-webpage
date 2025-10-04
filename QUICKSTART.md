# 🚀 Quick Start - Boilerplate Webpage

Crie um site completo em **3 comandos**.

## 📦 Uso Básico

```bash
# 1. Crie a pasta do projeto
mkdir minha-loja-page && cd minha-loja-page

# 2. Copie o script gerador
cp /caminho/para/boilerplate-webpage/create_webpage.py .

# 3. Execute o gerador
./create_webpage.py minha-loja-page
```

## 🎨 Com Customização

```bash
./create_webpage.py nome-do-projeto \
  --color "#1e40af" \
  --company "Nome da Empresa" \
  --whatsapp "5534991234567"
```

## ⚙️ Setup Rápido

```bash
# 1. Configurar
cp .env.example .env
nano .env  # Edite DB e WhatsApp

# 2. Database
mysql -u root -p < database/schema.sql
mysql -u root -p nome_do_banco < database/seed.sql

# 3. Rodar
php -S localhost:8080
```

## 📚 Documentação Completa

- **README.md** - Documentação completa do boilerplate
- **EXAMPLE.md** - Exemplo passo a passo com Zezinho Parafusos

## 🎯 Exemplos Rápidos

### Loja de Roupas
```bash
./create_webpage.py boutique-page --color "#ec4899" --company "Boutique Elegance"
```

### Loja de Ferramentas
```bash
./create_webpage.py ferramentas-page --color "#1e40af" --company "Zezinho Parafusos"
```

### Loja de Cosméticos
```bash
./create_webpage.py cosmeticos-page --color "#9333ea" --company "Beleza & Cia"
```

## 🔧 Scripts Incluídos

Cada projeto gerado vem com:

- **create_images.py** - Gera imagens placeholder
- **test-local.sh** - Testa API e database
- **setup-apache.sh** - Configura Apache (produção)

```bash
# Gerar imagens
python3 create_images.py

# Testar tudo
./test-local.sh
```

## ✅ Checklist

- [ ] Criar pasta do projeto
- [ ] Copiar `create_webpage.py`
- [ ] Executar script com parâmetros
- [ ] Copiar `.env.example` para `.env`
- [ ] Editar credenciais MySQL no `.env`
- [ ] Importar `schema.sql` e `seed.sql`
- [ ] Iniciar `php -S localhost:8080`
- [ ] Acessar `http://localhost:8080`

## 🆘 Precisa de Ajuda?

```bash
# Ver opções do script
./create_webpage.py --help

# Testar ambiente após setup
./test-local.sh
```

---

**Tempo estimado**: 5 minutos ⏱️
**Resultado**: Site completo e funcional! 🎉
