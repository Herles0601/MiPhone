/* ==========================================================================
   MI PHONE HN — LÓGICA DE APLICACIÓN
   Los productos se cargan desde: products.json
   ========================================================================== */

// URL del archivo de datos (relativa al sitio)
const PRODUCTS_API = './products.json';

// 1. Base de datos de productos (se llena con fetch)
let products = [];
    {
        id: 1,
        title: "iPhone 15 Pro Max",
        brand: "Apple",
        price: 29500,
        oldPrice: 32000,
        category: "iphones",
        condition: "nuevo",
        badge: "Nuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150"><rect x="15" y="10" width="70" height="130" rx="15" fill="%232c2c2e" stroke="%238e8e93" stroke-width="2"/><rect x="18" y="13" width="64" height="124" rx="12" fill="%231c1c1e"/><circle cx="50" cy="20" r="2" fill="%238e8e93"/><circle cx="35" cy="50" r="12" fill="%232c2c2e" opacity="0.3"/><circle cx="65" cy="55" r="10" fill="%232c2c2e" opacity="0.3"/></svg>`,
        description: "El iPhone más potente de Apple con chasis de titanio de calidad aeroespacial, chip A17 Pro ultra rápido y el sistema de cámaras más avanzado en un iPhone.",
        specs: [
            "Pantalla Super Retina XDR OLED de 6.7 pulgadas",
            "Chip A17 Pro con GPU de 6 núcleos",
            "Cámara principal de 48 MP con teleobjetivo 5x",
            "Puerto USB-C compatible con USB 3",
            "Batería de hasta 29 horas de reproducción de video"
        ],
        variants: {
            colors: [
                { name: "Titanio Natural", value: "#bebeb6" },
                { name: "Titanio Azul",    value: "#2f4452" },
                { name: "Titanio Negro",   value: "#3b3c3e" }
            ],
            storage: ["256GB", "512GB", "1TB"]
        }
    },
    {
        id: 2,
        title: "iPhone 13 Pro",
        brand: "Apple",
        price: 15900,
        oldPrice: 18500,
        category: "iphones",
        condition: "seminuevo",
        badge: "Seminuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150"><rect x="15" y="10" width="70" height="130" rx="15" fill="%233a3d40" stroke="%23bebeb6" stroke-width="2"/><rect x="18" y="13" width="64" height="124" rx="12" fill="%231c1c1e"/><circle cx="50" cy="18" r="3" fill="%238e8e93"/><circle cx="50" cy="40" r="10" fill="%233a3d40" opacity="0.4"/></svg>`,
        description: "Increíble rendimiento y pantalla ProMotion de 120Hz. Autonomía sobresaliente y cámaras que redefinieron la fotografía móvil.",
        specs: [
            "Pantalla Super Retina XDR con ProMotion (120Hz)",
            "Chip A15 Bionic con GPU de 5 núcleos",
            "Sistema de cámaras Pro de 12 MP (Teleobjetivo, Gran angular y Ultra gran angular)",
            "Escáner LiDAR para retratos en modo Noche",
            "Garantía de salud de batería de 85% o superior"
        ],
        variants: {
            colors: [
                { name: "Sierra Blue", value: "#a7c1d6" },
                { name: "Graphite",    value: "#4e4f50" },
                { name: "Gold",        value: "#fae0c5" }
            ],
            storage: ["128GB", "256GB"]
        }
    },
    {
        id: 3,
        title: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        price: 27900,
        oldPrice: 31000,
        category: "samsung",
        condition: "nuevo",
        badge: "Nuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150"><rect x="15" y="10" width="70" height="130" rx="6" fill="%23333333" stroke="%23555555" stroke-width="2"/><rect x="18" y="13" width="64" height="124" rx="4" fill="%231c1c1e"/><circle cx="30" cy="30" r="8" fill="%23333333" opacity="0.3"/><line x1="20" y1="130" x2="30" y2="130" stroke="%23555555" stroke-width="2"/></svg>`,
        description: "Lidera la era de la IA móvil con Galaxy AI. Fotografía de 200 MP y S Pen integrado para máxima productividad.",
        specs: [
            "Pantalla Dynamic AMOLED 2X de 6.8 pulgadas QHD+",
            "Procesador Snapdragon 8 Gen 3 para Galaxy",
            "Cámara principal de 200 MP con Zoom Óptico Quad",
            "S Pen integrado para productividad y notas rápidas",
            "Marco de Titanio ultra resistente"
        ],
        variants: {
            colors: [
                { name: "Titanium Gray",   value: "#8e8e93" },
                { name: "Titanium Yellow", value: "#f7e7c4" },
                { name: "Titanium Violet", value: "#4b415a" }
            ],
            storage: ["256GB", "512GB"]
        }
    },
    {
        id: 4,
        title: "iPhone 12",
        brand: "Apple",
        price: 10500,
        oldPrice: 12500,
        category: "iphones",
        condition: "seminuevo",
        badge: "Seminuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150"><rect x="16" y="10" width="68" height="130" rx="14" fill="%231c1c1e" stroke="%233a3d40" stroke-width="2"/><rect x="19" y="13" width="62" height="124" rx="11" fill="%23111"/><circle cx="50" cy="18" r="4" fill="%233a3d40"/></svg>`,
        description: "Diseño de bordes planos icónico, conectividad 5G, pantalla Super Retina XDR y sistema de doble cámara trasera avanzado.",
        specs: [
            "Pantalla Super Retina XDR OLED de 6.1 pulgadas",
            "Chip A14 Bionic súper potente",
            "Sistema de doble cámara de 12 MP (Ultra gran angular y Gran angular)",
            "Frente de Ceramic Shield",
            "Inspección técnica de 30 puntos aprobada"
        ],
        variants: {
            colors: [
                { name: "Negro", value: "#1c1c1e" },
                { name: "Blanco", value: "#f5f5f7" },
                { name: "Azul",  value: "#203a43" }
            ],
            storage: ["64GB", "128GB"]
        }
    },
    {
        id: 5,
        title: "iPad Air (5ta Generación)",
        brand: "Apple",
        price: 12900,
        oldPrice: 14500,
        category: "ipads",
        condition: "seminuevo",
        badge: "Seminuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="120" height="150"><rect x="10" y="10" width="100" height="130" rx="10" fill="%232c2c2e" stroke="%238e8e93" stroke-width="2"/><rect x="14" y="14" width="92" height="122" rx="7" fill="%23111"/><circle cx="60" cy="140" r="3" fill="%238e8e93"/></svg>`,
        description: "Potenciada por el chip M1 de Apple. Ideal para estudiantes, diseñadores y profesionales que buscan portabilidad y potencia extrema.",
        specs: [
            "Pantalla Liquid Retina de 10.9 pulgadas con True Tone",
            "Chip M1 de Apple con Neural Engine",
            "Cámara trasera de 12 MP y frontal ultra gran angular de 12 MP",
            "Compatible con Apple Pencil (2da generación)",
            "Conexión USB-C de alta velocidad"
        ],
        variants: {
            colors: [
                { name: "Gris Espacial", value: "#4e4f50" },
                { name: "Azul",          value: "#a7c1d6" },
                { name: "Púrpura",       value: "#d7c3eb" }
            ],
            storage: ["64GB", "256GB"]
        }
    },
    {
        id: 6,
        title: "Samsung Galaxy A55 5G",
        brand: "Samsung",
        price: 9500,
        oldPrice: 11000,
        category: "samsung",
        condition: "nuevo",
        badge: "Nuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150"><rect x="15" y="10" width="70" height="130" rx="10" fill="%23444" stroke="%23666" stroke-width="2"/><rect x="18" y="13" width="64" height="124" rx="8" fill="%231c1c1e"/></svg>`,
        description: "Excelente relación calidad-precio. Diseño premium, procesador Exynos potente y resistencia al agua IP67.",
        specs: [
            "Pantalla Super AMOLED de 6.6 pulgadas a 120Hz",
            "Procesador Exynos 1480",
            "Cámara principal de 50 MP con OIS",
            "Batería de 5,000 mAh con carga rápida",
            "Certificación IP67"
        ],
        variants: {
            colors: [
                { name: "Awesome Iceblue", value: "#e3f2fd" },
                { name: "Awesome Navy",    value: "#1a237e" }
            ],
            storage: ["128GB", "256GB"]
        }
    },
    {
        id: 7,
        title: "Cargador Apple USB-C de 20W",
        brand: "Apple",
        price: 750,
        oldPrice: 950,
        category: "accessories",
        condition: "nuevo",
        badge: "Nuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="30" y="25" width="40" height="40" rx="8" fill="%23f5f5f7" stroke="%23d2d2d7" stroke-width="2"/><rect x="42" y="65" width="4" height="12" fill="%23d2d2d7"/><rect x="54" y="65" width="4" height="12" fill="%23d2d2d7"/><circle cx="50" cy="45" r="4" fill="%23bebeb6"/></svg>`,
        description: "Adaptador USB-C original de Apple de 20W. Carga tu iPhone al 50% en solo 30 minutos de forma segura.",
        specs: [
            "Carga rápida de 20W",
            "Puerto USB-C universal",
            "Protección contra sobrecargas",
            "Compatible con iPhones del modelo 8 en adelante"
        ],
        variants: {
            colors: [{ name: "Blanco", value: "#ffffff" }],
            storage: ["Estándar"]
        }
    },
    {
        id: 8,
        title: "AirPods Pro (2da Generación)",
        brand: "Apple",
        price: 5900,
        oldPrice: 6800,
        category: "accessories",
        condition: "nuevo",
        badge: "Nuevo",
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect x="25" y="30" width="50" height="40" rx="15" fill="%23ffffff" stroke="%23d2d2d7" stroke-width="2"/><circle cx="50" cy="50" r="3" fill="%2334c759"/></svg>`,
        description: "Cancelación Activa de Ruido, audio espacial personalizado y estuche de carga MagSafe. La experiencia de audio más avanzada de Apple.",
        specs: [
            "Chip H2 de Apple",
            "Cancelación Activa de Ruido Inteligente",
            "Audio espacial con seguimiento dinámico",
            "Hasta 6 horas de reproducción",
            "Compatible con MagSafe"
        ],
        variants: {
            colors: [{ name: "Blanco", value: "#ffffff" }],
            storage: ["Estándar"]
        }
    }
];

// 2. Estado de la aplicación
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let activeCategory = "all";
let activeCondition = "all";
let searchQuery = "";
let currentSelectedProduct = null;
let modalSelectedColor = "";
let modalSelectedStorage = "";
const WHATSAPP_PHONE = "50488238432";

// Elementos del DOM
const productsGrid      = document.getElementById('products-grid');
const noResults         = document.getElementById('no-results');
const searchInput       = document.getElementById('search-input');
const filterTabs        = document.querySelectorAll('.filter-tab');
const filterTags        = document.querySelectorAll('.filter-tag');
const cartDrawer        = document.getElementById('cart-drawer');
const cartToggleBtn     = document.getElementById('cart-toggle');
const cartCloseBtn      = document.getElementById('cart-close');
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
const cartItemsContainer= document.getElementById('cart-items-container');
const cartSubtotalEl    = document.getElementById('cart-subtotal');
const cartBadge         = document.getElementById('cart-badge');
const checkoutBtn       = document.getElementById('checkout-whatsapp-btn');
const productModal      = document.getElementById('product-modal');
const productModalOverlay = document.getElementById('product-modal-overlay');
const productModalClose = document.getElementById('product-modal-close');
const productModalBody  = document.getElementById('product-modal-body');
const calcAmount        = document.getElementById('calc-amount');
const calcMonths        = document.getElementById('calc-months');
const calcValue         = document.getElementById('calc-value');
const calcWhatsappBtn   = document.getElementById('calc-whatsapp-btn');
const themeToggle       = document.getElementById('theme-toggle');
const mobileMenuToggle  = document.getElementById('mobile-menu-toggle');
const navMenu           = document.getElementById('nav-menu');

/* ==========================================================================
   3. Inicialización
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCartUI();
    setupEventListeners();
    calculateFinancing();
    loadProducts(); // Cargar productos desde el JSON
});

// Cargar productos desde products.json
async function loadProducts() {
    showCatalogLoading();
    try {
        const response = await fetch(PRODUCTS_API);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        products = await response.json();
        renderProducts();
    } catch (err) {
        console.error('No se pudo cargar products.json:', err);
        showCatalogError();
    }
}

function showCatalogLoading() {
    productsGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-secondary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="animation:spin 1s linear infinite; margin-bottom:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <p>Cargando productos...</p>
        </div>
    `;
}

function showCatalogError() {
    productsGrid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-secondary);">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--danger,#ff3b30); margin-bottom:16px;">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <h3 style="margin-bottom:8px;">No se pudo cargar el catálogo</h3>
            <p>Verifica que el archivo <code>products.json</code> exista y esté bien formateado.</p>
            <button onclick="loadProducts()" class="btn btn-secondary" style="margin-top:16px;">Reintentar</button>
        </div>
    `;
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
}

function setupEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', e => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
    });

    // Filtros de categoría
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.category;
            renderProducts();
        });
    });

    // Filtros de condición
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeCondition = tag.dataset.condition;
            renderProducts();
        });
    });

    // Carrito
    cartToggleBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartDrawerOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkoutCartWhatsApp);

    // Modal
    productModalClose.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', closeProductModal);

    // Calculadora
    calcAmount.addEventListener('input', calculateFinancing);
    calcMonths.addEventListener('change', calculateFinancing);

    // Tema
    themeToggle.addEventListener('click', toggleTheme);

    // Menú móvil
    mobileMenuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
    });

    // FAQ acordeón
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

/* ==========================================================================
   4. Renderizado del Catálogo
   ========================================================================== */

function renderProducts() {
    const filtered = products.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchQuery) ||
                            p.brand.toLowerCase().includes(searchQuery);
        const matchCat    = activeCategory === "all" || p.category === activeCategory;
        const matchCond   = activeCondition === "all" || p.condition === activeCondition;
        return matchSearch && matchCat && matchCond;
    });

    productsGrid.innerHTML = "";

    if (filtered.length === 0) {
        noResults.style.display = "block";
        return;
    }
    noResults.style.display = "none";

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = "product-card";

        const formattedPrice    = formatCurrency(product.price);
        const formattedOldPrice = product.oldPrice ? formatCurrency(product.oldPrice) : "";
        const oldPriceHTML      = product.oldPrice
            ? `<span class="price-old">${formattedOldPrice}</span>` : "";
        const badgeClass = product.condition === "nuevo" ? "tag-nuevo" : "tag-seminuevo";

        card.innerHTML = `
            <span class="product-tag-badge ${badgeClass}">${product.badge}</span>
            <div class="product-image-container" onclick="openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-title" onclick="openProductModal(${product.id})">${product.title}</h3>
                <p class="product-condition">${product.condition === 'nuevo' ? 'Equipo nuevo de fábrica' : 'Seminuevo Grado A+'}</p>
                <div class="product-price-row">
                    <span class="price-current">${formattedPrice}</span>
                    ${oldPriceHTML}
                </div>
                <button class="btn btn-primary" onclick="quickAddToCart(${product.id})">
                    Agregar al Carrito
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

/* ==========================================================================
   5. Modal de Detalle de Producto
   ========================================================================== */

window.openProductModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentSelectedProduct = product;
    modalSelectedColor   = product.variants.colors[0].name;
    modalSelectedStorage = product.variants.storage[0];

    renderModalContent();
    productModal.classList.add('active');
    document.body.style.overflow = "hidden";
};

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = "";
}

function renderModalContent() {
    const p = currentSelectedProduct;
    const formattedPrice    = formatCurrency(p.price);
    const formattedOldPrice = p.oldPrice ? formatCurrency(p.oldPrice) : "";
    const oldPriceHTML      = p.oldPrice ? `<span class="modal-price-old">${formattedOldPrice}</span>` : "";
    const cuotaBAC          = formatCurrency(Math.round(p.price / 6));

    const colorsHTML = p.variants.colors.map(c => {
        const active = c.name === modalSelectedColor ? 'active' : '';
        return `<button class="color-dot-btn ${active}" data-color="${c.name}" style="background-color:${c.value};" title="${c.name}"></button>`;
    }).join('');

    const storageHTML = p.variants.storage.map(s => {
        const active = s === modalSelectedStorage ? 'active' : '';
        return `<button class="variant-btn ${active}" data-storage="${s}">${s}</button>`;
    }).join('');

    const specsHTML = p.specs ? p.specs.map(s => `<li>${s}</li>`).join('') : '';

    productModalBody.innerHTML = `
        <div class="modal-grid">
            <div class="modal-gallery">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="modal-details">
                <span class="product-brand">${p.brand}</span>
                <h1 class="modal-title">${p.title}</h1>
                <div class="modal-price-row">
                    <span class="modal-price">${formattedPrice}</span>
                    ${oldPriceHTML}
                </div>

                <div class="option-group">
                    <span class="option-label">Color: <strong id="modal-color-name">${modalSelectedColor}</strong></span>
                    <div class="option-selectors" id="modal-colors-container">${colorsHTML}</div>
                </div>

                <div class="option-group">
                    <span class="option-label">Capacidad:</span>
                    <div class="option-selectors" id="modal-storage-container">${storageHTML}</div>
                </div>

                <div class="option-group" style="margin-bottom:24px;">
                    <span class="option-label">Facilidades de Pago:</span>
                    <div class="trust-summary-item" style="font-weight:500; color:var(--text-primary);">
                        Lléveselo en 6 cuotas de ${cuotaBAC}/mes sin intereses.
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn btn-primary btn-block" onclick="addModalProductToCart()">
                        Agregar al Carrito
                    </button>
                </div>

                <div class="modal-trust-summary">
                    <div class="trust-summary-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        <span>Garantía de 90 días por escrito (Fallas de Fábrica)</span>
                    </div>
                    <div class="trust-summary-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        <span>Envío por Rápido Cargo asegurado desde Choluteca</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-tabs">
            <div class="modal-tab-content">
                <h3>Descripción del Producto</h3>
                <p>${p.description}</p>
                ${specsHTML ? `<h3>Especificaciones Técnicas</h3><ul>${specsHTML}</ul>` : ''}
                <h3>¿Qué incluye tu paquete?</h3>
                <p>El dispositivo inspeccionado, cable de carga compatible, empaque seguro y póliza de garantía impresa por 90 días.</p>
            </div>
        </div>
    `;

    // Listeners de variantes dentro del modal
    productModalBody.querySelectorAll('.color-dot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            productModalBody.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            modalSelectedColor = btn.dataset.color;
            document.getElementById('modal-color-name').textContent = modalSelectedColor;
        });
    });

    productModalBody.querySelectorAll('.variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            productModalBody.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            modalSelectedStorage = btn.dataset.storage;
        });
    });
}

/* ==========================================================================
   6. Carrito de Compras
   ========================================================================== */

function openCart()  { cartDrawer.classList.add('active'); }
function closeCart() { cartDrawer.classList.remove('active'); }

window.quickAddToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    addToCart(product, product.variants.colors[0].name, product.variants.storage[0]);
};

window.addModalProductToCart = function() {
    if (!currentSelectedProduct) return;
    addToCart(currentSelectedProduct, modalSelectedColor, modalSelectedStorage);
    closeProductModal();
};

function addToCart(product, color, storage) {
    const cartItemId = `${product.id}-${color}-${storage}`;
    const existing   = cart.find(i => i.cartItemId === cartItemId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            cartItemId,
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: product.price,
            image: product.image,
            color,
            storage,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    openCart();
}

window.changeCartQty = function(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.cartItemId !== cartItemId);
    saveCart();
    updateCartUI();
};

window.removeFromCart = function(cartItemId) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartBadge.textContent = total;

    cartItemsContainer.innerHTML = "";
    const checkoutForm = document.getElementById('cart-checkout-form');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <p>Tu carrito está vacío.</p>
                <p style="font-size:0.8rem;margin-top:8px;">¡Añade productos para empezar!</p>
            </div>
        `;
        cartSubtotalEl.textContent = formatCurrency(0);
        if (checkoutForm) checkoutForm.style.display = "none";
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const el = document.createElement('div');
        el.className = "cart-item";
        el.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h4>${item.title}</h4>
                <p class="cart-item-meta">${item.color} | ${item.storage}</p>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeCartQty('${item.cartItemId}', -1)">−</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeCartQty('${item.cartItemId}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-price-remove">
                <span class="cart-item-price">${formatCurrency(itemTotal)}</span>
                <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">Eliminar</button>
            </div>
        `;
        cartItemsContainer.appendChild(el);
    });

    cartSubtotalEl.textContent = formatCurrency(subtotal);
    if (checkoutForm) checkoutForm.style.display = "block";
}

/* ==========================================================================
   7. Checkout por WhatsApp
   ========================================================================== */

function checkoutCartWhatsApp() {
    if (cart.length === 0) return;

    const name     = document.getElementById('client-name').value.trim();
    const dni      = document.getElementById('client-dni').value.trim();
    const location = document.getElementById('client-location').value.trim();

    if (!name || !dni || !location) {
        alert("Por favor completa todos los datos de entrega (Nombre, DNI y Localidad) antes de enviar tu pedido.");
        return;
    }

    let subtotal = 0;
    let msg = "*NUEVO PEDIDO — MI PHONE HN*\n\n";
    msg += `Cliente: ${name}\nDNI: ${dni}\nCiudad/Envío: ${location}\n\n`;
    msg += `*Productos:*\n`;

    cart.forEach(item => {
        const t = item.price * item.quantity;
        subtotal += t;
        msg += `- ${item.title} (${item.storage} | ${item.color})\n`;
        msg += `  Cant: ${item.quantity} — Subtotal: ${formatCurrency(t)}\n`;
    });

    msg += `\n*TOTAL: ${formatCurrency(subtotal)}*\n\n`;
    msg += `Despacho: Choluteca, Honduras\nLogística: Rápido Cargo`;

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ==========================================================================
   8. Calculadora de Extrafinanciamiento
   ========================================================================== */

function calculateFinancing() {
    const amount = parseFloat(calcAmount.value) || 0;
    const months = parseInt(calcMonths.value) || 6;

    if (amount <= 0) { calcValue.textContent = "L. 0 / mes"; return; }

    calcValue.textContent = `${formatCurrency(Math.round(amount / months))} / mes`;

    let msg = `Hola Mi Phone HN, me gustaría consultar por Extrafinanciamiento:\n`;
    msg += `Monto: ${formatCurrency(amount)}\nPlazo: ${months} meses sin intereses.\n\n`;
    msg += `¿Cuáles son los requisitos con BAC o Ficohsa?`;
    calcWhatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

/* ==========================================================================
   9. Utilidades
   ========================================================================== */

function formatCurrency(val) {
    return "L. " + val.toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}
