// LL Magazine - JavaScript for Virtual Storefront

// Configuration (will be loaded from API)
let CONFIG = {
    whatsappNumber: '',
    whatsappMessage: 'Olá! Gostaria de saber mais sobre este produto da LL Magazine:',
    apiUrl: 'api/products.php',
    siteName: 'LL Magazine'
};

// Global variables
let products = [];
let filteredProducts = [];
let currentCategory = 'all';
let cartCount = 0;

// DOM elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const categoriesScroll = document.getElementById('categoriesScroll');
const productsGrid = document.getElementById('productsGrid');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');
const cartCountElement = document.getElementById('cartCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    await loadConfig();
    await loadProducts();
    setupEventListeners();
    setupHeroCarousel();
}

// Load configuration from API
async function loadConfig() {
    try {
        const response = await fetch(CONFIG.apiUrl + '?config=1');
        if (response.ok) {
            const config = await response.json();
            CONFIG.whatsappNumber = config.whatsappNumber || CONFIG.whatsappNumber;
            CONFIG.whatsappMessage = config.whatsappMessage || CONFIG.whatsappMessage;
            CONFIG.siteName = config.siteName || CONFIG.siteName;
        }
    } catch (error) {
        console.warn('Failed to load config from API, using defaults:', error);
    }
}

// Event Listeners
function setupEventListeners() {
    // Mobile menu
    menuToggle.addEventListener('click', toggleMobileMenu);
    closeMenu.addEventListener('click', closeMobileMenu);
    
    // Modal
    closeModal.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeProductModal();
        }
    });
    
    // Categories (desktop)
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProductsByCategory(category);
            updateActiveCategory(this);
        });
    });

    // Categories (mobile menu)
    const mobileCategoryItems = document.querySelectorAll('.mobile-category-item');
    mobileCategoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            filterProductsByCategory(category);
            updateActiveMobileCategory(this);
            closeMobileMenu();

            // Scroll to products section
            const productsSection = document.querySelector('.products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Hero indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            showHeroSlide(index);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeMobileMenu();
        }
    });
}

// Mobile Menu Functions
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Hero Carousel
function setupHeroCarousel() {
    // Get featured products or fallback to default images
    const featuredProducts = products.filter(p => p.featured);

    let heroImages = [];

    if (featuredProducts.length > 0) {
        // Use featured product images
        heroImages = featuredProducts.map(p => p.image);
    } else {
        // Fallback to default hero images
        heroImages = [
            'assets/images/hero-model.jpg',
            'assets/images/hero-model-2.jpg',
            'assets/images/hero-model-3.jpg'
        ];
    }

    let currentSlide = 0;
    const heroImage = document.getElementById('heroImage');
    const indicators = document.querySelectorAll('.indicator');

    // Update indicators to match number of slides
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    if (indicatorsContainer && heroImages.length !== indicators.length) {
        indicatorsContainer.innerHTML = heroImages.map((_, i) =>
            `<button class="indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>`
        ).join('');

        // Re-attach event listeners
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                showHeroSlide(index);
            });
        });
    }

    function showSlide(index) {
        if (heroImages[index]) {
            heroImage.src = heroImages[index];

            // Add click event to hero image for featured products
            if (featuredProducts.length > 0) {
                heroImage.style.cursor = 'pointer';
                heroImage.onclick = () => openProductModal(featuredProducts[index]);
            }
        }

        const currentIndicators = document.querySelectorAll('.indicator');
        currentIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
    }

    window.showHeroSlide = function(index) {
        currentSlide = index;
        showSlide(currentSlide);
    }

    // Show first slide
    showSlide(0);

    // Auto-advance carousel
    setInterval(() => {
        currentSlide = (currentSlide + 1) % heroImages.length;
        showSlide(currentSlide);
    }, 5000);
}

// Product Loading and Display
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch(CONFIG.apiUrl);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        products = await response.json();
        filteredProducts = [...products];
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Erro ao carregar produtos. Tente novamente mais tarde.');
    }
}

function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

function displayError(message) {
    productsGrid.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc2626;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
            <p>${message}</p>
        </div>
    `;
}

function displayProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p>Nenhum produto encontrado nesta categoria.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.discount ? `<div class="product-badge">${product.discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${product.originalPrice ? `<span class="original-price">R$ ${product.originalPrice}</span>` : ''}
                    <span class="current-price">R$ ${product.price}</span>
                </div>
                <button class="buy-btn" onclick="event.stopPropagation(); buyProduct(${product.id})">
                    <i class="fab fa-whatsapp"></i>
                    COMPRAR
                </button>
            </div>
        </div>
    `).join('');
}

// Product Filtering
function filterProductsByCategory(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.category === category
        );
    }
    
    displayProducts();
}

function updateActiveCategory(activeElement) {
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => item.classList.remove('active'));
    activeElement.classList.add('active');
}

function updateActiveMobileCategory(activeElement) {
    const mobileCategoryItems = document.querySelectorAll('.mobile-category-item');
    mobileCategoryItems.forEach(item => item.classList.remove('active'));
    activeElement.classList.add('active');
}

// Product Modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
            <div class="product-image-large">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 15px;">
            </div>
            <div class="product-details">
                <h2 style="color: #dc2626; margin-bottom: 15px; font-size: 28px;">${product.name}</h2>
                
                <div class="product-price" style="margin-bottom: 20px;">
                    ${product.originalPrice ? `<span class="original-price" style="font-size: 18px;">R$ ${product.originalPrice}</span>` : ''}
                    <span class="current-price" style="font-size: 32px;">R$ ${product.price}</span>
                </div>
                
                ${product.description ? `<p style="color: #666; margin-bottom: 20px; line-height: 1.6;">${product.description}</p>` : ''}
                
                <div style="margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px; color: #333;">Cores disponíveis:</h4>
                    <div style="display: flex; gap: 10px;">
                        ${product.colors ? product.colors.map(color => `
                            <div style="width: 30px; height: 30px; border-radius: 50%; background-color: ${color}; border: 2px solid #ddd; cursor: pointer;"></div>
                        `).join('') : ''}
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 10px; color: #333;">Tamanhos:</h4>
                    <div style="display: flex; gap: 10px;">
                        ${product.sizes ? product.sizes.map(size => `
                            <button style="width: 40px; height: 40px; border: 2px solid #ddd; border-radius: 50%; background: white; cursor: pointer; font-weight: 600;">${size}</button>
                        `).join('') : ''}
                    </div>
                </div>
                
                <button class="buy-btn" style="width: 100%; padding: 15px; font-size: 18px;" onclick="buyProduct(${product.id})">
                    <i class="fab fa-whatsapp"></i>
                    COMPRAR AGORA
                </button>
            </div>
        </div>
    `;
    
    productModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// WhatsApp Integration
function openWhatsApp(message = '') {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

function buyProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const message = `${CONFIG.whatsappMessage} ${product.name} - R$ ${product.price}`;
    openWhatsApp(message);
    
    // Update cart count (visual feedback)
    cartCount++;
    updateCartCount();
    
    // Close modal if open
    closeProductModal();
}

// Favorites
function toggleFavorite(productId) {
    const favoriteBtn = event.target.closest('.product-favorite');
    favoriteBtn.classList.toggle('favorited');
    
    // Here you could save to localStorage or send to server
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Cart Management
function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
setupLazyLoading();

// Performance optimization: Preload critical images
function preloadImages() {
    const criticalImages = [
        'assets/images/hero-model.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadImages();

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'assets/images/placeholder.jpg';
        e.target.alt = 'Imagem não disponível';
    }
}, true);

// Service Worker registration removed to avoid 404 errors
