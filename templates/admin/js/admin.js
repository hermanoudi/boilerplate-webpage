// LL Magazine Admin - Dashboard Script

// Global variables
let currentUser = null;
let authToken = null;
let products = [];
let categories = [];
let editingProductId = null;

// Pagination variables
let currentPage = 1;
let pageSize = 10;
let totalProducts = 0;
let totalPages = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

async function initializeAdmin() {
    // Check authentication
    authToken = localStorage.getItem('admin_token');
    const userDataString = localStorage.getItem('admin_user');

    if (!authToken || !userDataString) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(userDataString);

    // Verify token is still valid
    const isValid = await verifyToken();
    if (!isValid) {
        logout();
        return;
    }

    // Update UI with user info
    document.getElementById('userName').textContent = currentUser.full_name || currentUser.username;

    // Load categories first
    await loadCategories();

    // Load products
    await loadProducts();

    // Setup event listeners
    setupEventListeners();
}

async function verifyToken() {
    try {
        const response = await fetch('../api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ action: 'verify' })
        });

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Navigation
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);

            // Close mobile menu on navigation
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    });

    // New product button
    document.getElementById('btnNewProduct').addEventListener('click', function() {
        openProductModal();
    });

    // Close modal buttons
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('cancelProductBtn').addEventListener('click', closeProductModal);

    // Product form submit
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);

    // Pagination controls
    document.getElementById('pageSizeSelect').addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        renderProductsTable();
        renderPagination();
    });

    document.getElementById('btnFirstPage').addEventListener('click', () => goToPage(1));
    document.getElementById('btnPrevPage').addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('btnNextPage').addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('btnLastPage').addEventListener('click', () => goToPage(totalPages));

    // Click outside modal to close
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeProductModal();
        }
    });

    // Image upload preview
    document.getElementById('productImageFile').addEventListener('change', handleImageSelect);
}

function switchPage(pageName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-page="${pageName}"]`).classList.add('active');

    // Show/hide pages
    document.getElementById('productsPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';

    if (pageName === 'products') {
        document.getElementById('productsPage').style.display = 'block';
        document.querySelector('.page-header h1').textContent = 'Gerenciar Produtos';
        document.getElementById('btnNewProduct').style.display = 'flex';
    } else if (pageName === 'settings') {
        document.getElementById('settingsPage').style.display = 'block';
        document.querySelector('.page-header h1').textContent = 'Configurações';
        document.getElementById('btnNewProduct').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
}

// Categories Management
async function loadCategories() {
    try {
        // Use admin=1 to get ALL categories, including those without products
        const response = await fetch('../api/products.php?categories=1&admin=1');
        if (response.ok) {
            categories = await response.json();
            populateCategorySelect();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        showAlert('Erro ao carregar categorias', 'error');
    }
}

function populateCategorySelect() {
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;

    // Keep the first option (Selecione...)
    const firstOption = categorySelect.querySelector('option[value=""]');
    categorySelect.innerHTML = '';

    if (firstOption) {
        categorySelect.appendChild(firstOption);
    }

    // Add categories from database (skip "all" category)
    categories.forEach(category => {
        if (category.id !== 'all') {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        }
    });
}

// Products Management
async function loadProducts() {
    showLoading(true);
    try {
        const response = await fetch('../api/admin/products.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            products = data.products;
            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / pageSize);
            currentPage = 1;
            renderProductsTable();
            renderPagination();
        } else {
            showAlert('Erro ao carregar produtos: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Load products error:', error);
        showAlert('Erro ao conectar com o servidor', 'error');
    } finally {
        showLoading(false);
    }
}

// Pagination functions
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProductsTable();
    renderPagination();
}

function renderPagination() {
    totalPages = Math.ceil(totalProducts / pageSize);

    // Update info text
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalProducts);
    document.getElementById('paginationInfo').textContent =
        `Exibindo ${start}-${end} de ${totalProducts} produtos`;

    // Update navigation buttons state
    document.getElementById('btnFirstPage').disabled = currentPage === 1;
    document.getElementById('btnPrevPage').disabled = currentPage === 1;
    document.getElementById('btnNextPage').disabled = currentPage === totalPages;
    document.getElementById('btnLastPage').disabled = currentPage === totalPages;

    // Generate page numbers
    const pagesContainer = document.getElementById('paginationPages');
    pagesContainer.innerHTML = '';

    // Calculate which pages to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if near the start or end
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
        pagesContainer.innerHTML += `<button class="pagination-page" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            pagesContainer.innerHTML += `<span style="padding: 0 5px; color: #6b7280;">...</span>`;
        }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        pagesContainer.innerHTML += `<button class="pagination-page ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagesContainer.innerHTML += `<span style="padding: 0 5px; color: #6b7280;">...</span>`;
        }
        pagesContainer.innerHTML += `<button class="pagination-page" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Hide pagination if only one page
    const paginationContainer = document.getElementById('paginationContainer');
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
    } else {
        paginationContainer.style.display = 'flex';
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const cardsContainer = document.getElementById('productsCards');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">Nenhum produto cadastrado</td></tr>';
        cardsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Nenhum produto cadastrado</div>';
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, products.length);
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Render table (desktop view)
    tbody.innerHTML = paginatedProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="../${product.image}" alt="${product.name}" class="product-img" onerror="this.src='../assets/images/placeholder.jpg'"></td>
            <td>${product.name}</td>
            <td><span class="badge badge-warning">${getCategoryName(product.category)}</span></td>
            <td>R$ ${product.price}</td>
            <td>
                ${product.inStock
                    ? '<span class="badge badge-success">Em estoque</span>'
                    : '<span class="badge badge-danger">Esgotado</span>'}
            </td>
            <td>
                ${product.featured
                    ? '<i class="fas fa-star" style="color: #fbbf24;"></i>'
                    : ''}
            </td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Render cards (mobile view)
    cardsContainer.innerHTML = paginatedProducts.map(product => `
        <div class="product-card-mobile">
            <div class="product-card-header">
                <img src="../${product.image}" alt="${product.name}" onerror="this.src='../assets/images/placeholder.jpg'">
                <div class="product-card-info">
                    <h3>${product.name}</h3>
                    <div class="product-card-meta">
                        <span class="badge badge-warning">${getCategoryName(product.category)}</span>
                        ${product.inStock
                            ? '<span class="badge badge-success">Em estoque</span>'
                            : '<span class="badge badge-danger">Esgotado</span>'}
                        ${product.featured ? '<i class="fas fa-star" style="color: #fbbf24;"></i>' : ''}
                    </div>
                    <div class="product-card-price">R$ ${product.price}</div>
                </div>
            </div>
            <div class="product-card-footer">
                <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        'looks': 'Looks',
        'masculino': 'Masculino',
        'feminino': 'Feminino',
        'infantil': 'Infantil',
        'acessorios': 'Acessórios'
    };
    return categories[category] || category;
}

function openProductModal(productId = null) {
    editingProductId = productId;

    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');

    form.reset();
    document.getElementById('imagePreview').style.display = 'none';

    if (productId) {
        // Edit mode
        title.textContent = 'Editar Produto';
        const product = products.find(p => p.id === productId);

        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productOriginalPrice').value = product.originalPrice || '';
            document.getElementById('productDiscount').value = product.discount || '';
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description;

            // Convert hex colors to names for display
            const colorNames = product.colors ? product.colors.map(hex => hexToColorName(hex)) : [];
            document.getElementById('productColors').value = colorNames.join(', ');

            document.getElementById('productSizes').value = product.sizes ? product.sizes.join(', ') : '';
            document.getElementById('productInStock').checked = product.inStock;
            document.getElementById('productFeatured').checked = product.featured;

            // Show existing image preview
            if (product.image) {
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('previewImg');
                previewImg.src = '../' + product.image;
                preview.style.display = 'block';
            }
        }
    } else {
        // Create mode
        title.textContent = 'Novo Produto';
        document.getElementById('productId').value = '';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productImageFile').value = '';
    document.getElementById('fileNameDisplay').textContent = 'Nenhum arquivo selecionado';
    document.getElementById('fileNameDisplay').style.color = '#666';
    editingProductId = null;
}

function handleImageSelect(e) {
    const file = e.target.files[0];

    // Update file name display
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (file) {
        fileNameDisplay.textContent = file.name;
        fileNameDisplay.style.color = '#059669';
    } else {
        fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        fileNameDisplay.style.color = '#666';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = event.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function uploadImage(file) {
    console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
    });

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('../api/admin/upload.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        body: formData
    });

    const responseText = await response.text();
    console.log('Upload raw response:', responseText);

    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error('Erro no servidor: ' + responseText.substring(0, 200));
    }

    console.log('Upload response:', data);

    if (!data.success) {
        const errorMsg = data.error || 'Falha ao fazer upload da imagem';
        const debugInfo = data.debug ? JSON.stringify(data.debug) : '';
        throw new Error(errorMsg + (debugInfo ? ' - ' + debugInfo : ''));
    }

    return data.path;
}

async function handleProductSubmit(e) {
    e.preventDefault();

    showLoading(true);

    try {
        // Handle image upload if new image selected
        let imagePath = document.getElementById('productImage').value;
        const imageFile = document.getElementById('productImageFile').files[0];

        if (imageFile) {
            imagePath = await uploadImage(imageFile);
        }

        if (!imagePath) {
            showAlert('Imagem é obrigatória', 'error');
            showLoading(false);
            return;
        }

        // Convert color names to hex codes
        const colorNames = document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c);
        const colorHexCodes = colorNamesToHex(colorNames);

        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: document.getElementById('productPrice').value,
            originalPrice: document.getElementById('productOriginalPrice').value || null,
            discount: document.getElementById('productDiscount').value || null,
            image: imagePath,
            description: document.getElementById('productDescription').value,
            colors: colorHexCodes,
            sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
            inStock: document.getElementById('productInStock').checked ? 1 : 0,
            featured: document.getElementById('productFeatured').checked ? 1 : 0
        };

        const isEdit = editingProductId !== null && editingProductId !== undefined;
        const url = isEdit
            ? `../api/admin/products.php/${editingProductId}`
            : '../api/admin/products.php';
        const method = isEdit ? 'PUT' : 'POST';

        console.log('Submitting product:', { isEdit, editingProductId, url, method });

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.success) {
            showAlert(data.message || 'Produto salvo com sucesso!', 'success');
            closeProductModal();
            await loadProducts();
        } else {
            showAlert('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Save product error:', error);
        showAlert('Erro ao salvar produto: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

window.editProduct = function(productId) {
    openProductModal(productId);
};

window.deleteProduct = async function(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`../api/admin/products.php/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Produto excluído com sucesso!', 'success');
            await loadProducts();
        } else {
            showAlert('Erro ao excluir: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        showAlert('Erro ao excluir produto', 'error');
    } finally {
        showLoading(false);
    }
};

// Change Password
async function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showAlert('As senhas não conferem!', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch('../api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                action: 'change_password',
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Senha alterada com sucesso!', 'success');
            document.getElementById('changePasswordForm').reset();
        } else {
            showAlert('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showAlert('Erro ao alterar senha', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = type === 'error' ? 'error-message' : 'success-message';
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.animation = 'slideIn 0.3s';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
