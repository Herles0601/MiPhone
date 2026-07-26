/* ==========================================================================
   MI PHONE HN — LÓGICA DE APLICACIÓN
   Los productos se cargan desde: products.json
   ========================================================================== */

const PRODUCTS_API = "./products.json";
const WHATSAPP_PHONE = "50488238432";

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let activeCategory = "all";
let activeCondition = "all";
let searchQuery = "";

let currentSelectedProduct = null;
let modalSelectedColor = "";
let modalSelectedStorage = "";

/* ==========================================================================
   ELEMENTOS DEL DOM
   ========================================================================== */

const productsGrid = document.getElementById("products-grid");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("search-input");

const filterTabs = document.querySelectorAll(".filter-tab");
const filterTags = document.querySelectorAll(".filter-tag");

const cartDrawer = document.getElementById("cart-drawer");
const cartToggleBtn = document.getElementById("cart-toggle");
const cartCloseBtn = document.getElementById("cart-close");
const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartBadge = document.getElementById("cart-badge");
const checkoutBtn = document.getElementById("checkout-whatsapp-btn");

const productModal = document.getElementById("product-modal");
const productModalOverlay = document.getElementById("product-modal-overlay");
const productModalClose = document.getElementById("product-modal-close");
const productModalBody = document.getElementById("product-modal-body");

const calcAmount = document.getElementById("calc-amount");
const calcMonths = document.getElementById("calc-months");
const calcValue = document.getElementById("calc-value");
const calcWhatsappBtn = document.getElementById("calc-whatsapp-btn");

const themeToggle = document.getElementById("theme-toggle");
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navMenu = document.getElementById("nav-menu");

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  updateCartUI();
  setupEventListeners();
  calculateFinancing();
  loadProducts();
});

/* ==========================================================================
   CARGAR PRODUCTOS
   ========================================================================== */

async function loadProducts() {
  showCatalogLoading();

  try {
    const response = await fetch(PRODUCTS_API);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error("products.json debe ser un arreglo de productos");
    }

    renderProducts();
  } catch (err) {
    console.error("No se pudo cargar products.json:", err);
    showCatalogError();
  }
}

function showCatalogLoading() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-secondary);">
      <p>Cargando productos...</p>
    </div>
  `;
}

function showCatalogError() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-secondary);">
      <h3>No se pudo cargar el catálogo</h3>
      <p>Verifica que el archivo <strong>products.json</strong> exista y esté bien escrito.</p>
      <button onclick="loadProducts()" class="btn btn-secondary" style="margin-top:16px;">
        Reintentar
      </button>
    </div>
  `;
}

/* ==========================================================================
   EVENTOS
   ========================================================================== */

function setupEventListeners() {
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.category;
      renderProducts();
    });
  });

  filterTags.forEach(tag => {
    tag.addEventListener("click", () => {
      filterTags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      activeCondition = tag.dataset.condition;
      renderProducts();
    });
  });

  if (cartToggleBtn) cartToggleBtn.addEventListener("click", openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener("click", closeCart);
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkoutCartWhatsApp);

  if (productModalClose) productModalClose.addEventListener("click", closeProductModal);
  if (productModalOverlay) productModalOverlay.addEventListener("click", closeProductModal);

  if (calcAmount) calcAmount.addEventListener("input", calculateFinancing);
  if (calcMonths) calcMonths.addEventListener("change", calculateFinancing);

  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (navMenu) navMenu.classList.remove("active");
    });
  });

  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach(i => {
        i.classList.remove("active");
      });

      if (!isActive) item.classList.add("active");
    });
  });
}

/* ==========================================================================
   CATÁLOGO
   ========================================================================== */

function renderProducts() {
  if (!productsGrid) return;

  const filtered = products.filter(product => {
    const title = product.title ? product.title.toLowerCase() : "";
    const brand = product.brand ? product.brand.toLowerCase() : "";

    const matchSearch =
      title.includes(searchQuery) ||
      brand.includes(searchQuery);

    const matchCategory =
      activeCategory === "all" ||
      product.category === activeCategory;

    const matchCondition =
      activeCondition === "all" ||
      product.condition === activeCondition;

    return matchSearch && matchCategory && matchCondition;
  });

  productsGrid.innerHTML = "";

  if (filtered.length === 0) {
    if (noResults) noResults.style.display = "block";
    return;
  }

  if (noResults) noResults.style.display = "none";

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const formattedPrice = formatCurrency(product.price);
    const formattedOldPrice = product.oldPrice ? formatCurrency(product.oldPrice) : "";
    const oldPriceHTML = product.oldPrice
      ? `<span class="price-old">${formattedOldPrice}</span>`
      : "";

    const badgeClass = product.condition === "nuevo" ? "tag-nuevo" : "tag-seminuevo";

    card.innerHTML = `
      <span class="product-tag-badge ${badgeClass}">
        ${product.badge || product.condition}
      </span>

      <div class="product-image-container" onclick="openProductModal(${product.id})">
        <img 
          src="${product.image}" 
          alt="${product.title}"
          onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
        >
      </div>

      <div class="product-info">
        <span class="product-brand">${product.brand}</span>

        <h3 class="product-title" onclick="openProductModal(${product.id})">
          ${product.title}
        </h3>

        <p class="product-condition">
          ${product.condition === "nuevo" ? "Equipo nuevo de fábrica" : "Seminuevo Grado A+"}
        </p>

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
   MODAL DE PRODUCTO
   ========================================================================== */

window.openProductModal = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  currentSelectedProduct = product;

  modalSelectedColor =
    product.variants &&
    product.variants.colors &&
    product.variants.colors.length > 0
      ? product.variants.colors[0].name
      : "Color estándar";

  modalSelectedStorage =
    product.variants &&
    product.variants.storage &&
    product.variants.storage.length > 0
      ? product.variants.storage[0]
      : "Estándar";

  renderModalContent();

  if (productModal) {
    productModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

function closeProductModal() {
  if (productModal) {
    productModal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function renderModalContent() {
  if (!productModalBody || !currentSelectedProduct) return;

  const product = currentSelectedProduct;

  const formattedPrice = formatCurrency(product.price);
  const formattedOldPrice = product.oldPrice ? formatCurrency(product.oldPrice) : "";
  const oldPriceHTML = product.oldPrice
    ? `<span class="modal-price-old">${formattedOldPrice}</span>`
    : "";

  const monthlyPayment = formatCurrency(Math.round(product.price / 6));

  const colors = product.variants?.colors || [
    { name: "Color estándar", value: "#cccccc" }
  ];

  const storage = product.variants?.storage || ["Estándar"];

  const colorsHTML = colors.map(color => {
    const active = color.name === modalSelectedColor ? "active" : "";

    return `
      <button 
        class="color-dot-btn ${active}" 
        data-color="${color.name}" 
        style="background-color:${color.value};" 
        title="${color.name}">
      </button>
    `;
  }).join("");

  const storageHTML = storage.map(item => {
    const active = item === modalSelectedStorage ? "active" : "";

    return `
      <button class="variant-btn ${active}" data-storage="${item}">
        ${item}
      </button>
    `;
  }).join("");

  const specsHTML = product.specs
    ? product.specs.map(spec => `<li>${spec}</li>`).join("")
    : "";

  productModalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <img 
          src="${product.image}" 
          alt="${product.title}"
          onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
        >
      </div>

      <div class="modal-details">
        <span class="product-brand">${product.brand}</span>

        <h1 class="modal-title">${product.title}</h1>

        <div class="modal-price-row">
          <span class="modal-price">${formattedPrice}</span>
          ${oldPriceHTML}
        </div>

        <div class="option-group">
          <span class="option-label">
            Color: <strong id="modal-color-name">${modalSelectedColor}</strong>
          </span>

          <div class="option-selectors" id="modal-colors-container">
            ${colorsHTML}
          </div>
        </div>

        <div class="option-group">
          <span class="option-label">Capacidad:</span>

          <div class="option-selectors" id="modal-storage-container">
            ${storageHTML}
          </div>
        </div>

        <div class="option-group" style="margin-bottom:24px;">
          <span class="option-label">Facilidades de Pago:</span>

          <div class="trust-summary-item" style="font-weight:500; color:var(--text-primary);">
            Lléveselo en 6 cuotas de ${monthlyPayment}/mes sin intereses.
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary btn-block" onclick="addModalProductToCart()">
            Agregar al Carrito
          </button>
        </div>

        <div class="modal-trust-summary">
          <div class="trust-summary-item">
            <span>✅ Garantía de 90 días por escrito</span>
          </div>

          <div class="trust-summary-item">
            <span>🚚 Envío por Rápido Cargo desde Choluteca</span>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-tabs">
      <div class="modal-tab-content">
        <h3>Descripción del Producto</h3>
        <p>${product.description || "Producto disponible en Mi Phone HN."}</p>

        ${specsHTML ? `<h3>Especificaciones Técnicas</h3><ul>${specsHTML}</ul>` : ""}

        <h3>¿Qué incluye tu paquete?</h3>
        <p>Dispositivo inspeccionado, cable compatible, empaque seguro y garantía por escrito.</p>
      </div>
    </div>
  `;

  productModalBody.querySelectorAll(".color-dot-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      productModalBody.querySelectorAll(".color-dot-btn").forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");
      modalSelectedColor = btn.dataset.color;

      const colorName = document.getElementById("modal-color-name");
      if (colorName) colorName.textContent = modalSelectedColor;
    });
  });

  productModalBody.querySelectorAll(".variant-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      productModalBody.querySelectorAll(".variant-btn").forEach(b => {
        b.classList.remove("active");
      });

      btn.classList.add("active");
      modalSelectedStorage = btn.dataset.storage;
    });
  });
}

/* ==========================================================================
   CARRITO
   ========================================================================== */

function openCart() {
  if (cartDrawer) cartDrawer.classList.add("active");
}

function closeCart() {
  if (cartDrawer) cartDrawer.classList.remove("active");
}

window.quickAddToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const color = product.variants?.colors?.[0]?.name || "Color estándar";
  const storage = product.variants?.storage?.[0] || "Estándar";

  addToCart(product, color, storage);
};

window.addModalProductToCart = function() {
  if (!currentSelectedProduct) return;

  addToCart(
    currentSelectedProduct,
    modalSelectedColor,
    modalSelectedStorage
  );

  closeProductModal();
};

function addToCart(product, color, storage) {
  const cartItemId = `${product.id}-${color}-${storage}`;
  const existing = cart.find(item => item.cartItemId === cartItemId);

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
  const item = cart.find(product => product.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.cartItemId !== cartItemId);
  }

  saveCart();
  updateCartUI();
};

window.removeFromCart = function(cartItemId) {
  cart = cart.filter(product => product.cartItemId !== cartItemId);
  saveCart();
  updateCartUI();
};

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  if (!cartItemsContainer || !cartSubtotalEl || !cartBadge) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;

  cartItemsContainer.innerHTML = "";

  const checkoutForm = document.getElementById("cart-checkout-form");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito está vacío.</p>
        <p style="font-size:0.8rem;margin-top:8px;">
          Añade productos para empezar.
        </p>
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

    const el = document.createElement("div");
    el.className = "cart-item";

    el.innerHTML = `
      <div class="cart-item-img">
        <img 
          src="${item.image}" 
          alt="${item.title}"
          onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
        >
      </div>

      <div class="cart-item-details">
        <h4>${item.title}</h4>

        <p class="cart-item-meta">
          ${item.color} | ${item.storage}
        </p>

        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeCartQty('${item.cartItemId}', -1)">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="changeCartQty('${item.cartItemId}', 1)">+</button>
        </div>
      </div>

      <div class="cart-item-price-remove">
        <span class="cart-item-price">${formatCurrency(itemTotal)}</span>
        <button class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">
          Eliminar
        </button>
      </div>
    `;

    cartItemsContainer.appendChild(el);
  });

  cartSubtotalEl.textContent = formatCurrency(subtotal);

  if (checkoutForm) checkoutForm.style.display = "block";
}

/* ==========================================================================
   CHECKOUT POR WHATSAPP
   ========================================================================== */

function checkoutCartWhatsApp() {
  if (cart.length === 0) return;

  const name = document.getElementById("client-name").value.trim();
  const dni = document.getElementById("client-dni").value.trim();
  const location = document.getElementById("client-location").value.trim();

  if (!name || !dni || !location) {
    alert("Completa todos los datos de entrega antes de enviar tu pedido.");
    return;
  }

  let subtotal = 0;

  let message = "*NUEVO PEDIDO — MI PHONE HN*\n\n";
  message += `Cliente: ${name}\n`;
  message += `DNI: ${dni}\n`;
  message += `Ciudad/Envío: ${location}\n\n`;
  message += "*Productos:*\n";

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    message += `- ${item.title} (${item.storage} | ${item.color})\n`;
    message += `  Cantidad: ${item.quantity}\n`;
    message += `  Subtotal: ${formatCurrency(itemTotal)}\n`;
  });

  message += `\n*TOTAL: ${formatCurrency(subtotal)}*\n\n`;
  message += "Despacho: Choluteca, Honduras\n";
  message += "Logística: Rápido Cargo";

  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

/* ==========================================================================
   CALCULADORA DE EXTRAFINANCIAMIENTO
   ========================================================================== */

function calculateFinancing() {
  if (!calcAmount || !calcMonths || !calcValue || !calcWhatsappBtn) return;

  const amount = parseFloat(calcAmount.value) || 0;
  const months = parseInt(calcMonths.value) || 6;

  if (amount <= 0) {
    calcValue.textContent = "L. 0 / mes";
    return;
  }

  const monthly = Math.round(amount / months);

  calcValue.textContent = `${formatCurrency(monthly)} / mes`;

  let message = "Hola Mi Phone HN, me gustaría consultar por Extrafinanciamiento:\n";
  message += `Monto: ${formatCurrency(amount)}\n`;
  message += `Plazo: ${months} meses sin intereses.\n\n`;
  message += "¿Cuáles son los requisitos con BAC o Ficohsa?";

  calcWhatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/* ==========================================================================
   TEMA OSCURO / CLARO
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */

function formatCurrency(value) {
  const number = Number(value) || 0;

  return "L. " + number.toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}
