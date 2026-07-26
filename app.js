/* ========================================================================== 
   MI PHONE HN — LÓGICA DE APLICACIÓN
   Los productos se cargan desde products.json
   ========================================================================== */

const PRODUCTS_API = "./products.json";
const WHATSAPP_PHONE = "50488238432";
const FALLBACK_IMAGE = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg";

let products = [];
let cart = getStoredCart();
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

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("products.json debe contener un arreglo de productos.");
    }

    products = data;
    renderProducts();
  } catch (error) {
    console.error("No se pudo cargar products.json:", error);
    showCatalogError();
  }
}

function showCatalogLoading() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div class="catalog-status" role="status">
      <p>Cargando productos...</p>
    </div>
  `;
}

function showCatalogError() {
  if (!productsGrid) return;

  productsGrid.innerHTML = `
    <div class="catalog-status catalog-status-error" role="alert">
      <h3>No se pudo cargar el catálogo</h3>
      <p>Verifica que <strong>products.json</strong> exista y que ejecutes el sitio desde un servidor local.</p>
      <button type="button" class="btn btn-secondary" id="retry-catalog-btn">Reintentar</button>
    </div>
  `;

  document.getElementById("retry-catalog-btn")?.addEventListener("click", loadProducts);
}

/* ========================================================================== 
   EVENTOS
   ========================================================================== */

function setupEventListeners() {
  searchInput?.addEventListener("input", (event) => {
    searchQuery = event.target.value.toLowerCase().trim();
    renderProducts();
  });

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.category || "all";
      renderProducts();
    });
  });

  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      filterTags.forEach((item) => item.classList.remove("active"));
      tag.classList.add("active");
      activeCondition = tag.dataset.condition || "all";
      renderProducts();
    });
  });

  cartToggleBtn?.addEventListener("click", openCart);
  cartCloseBtn?.addEventListener("click", closeCart);
  cartDrawerOverlay?.addEventListener("click", closeCart);
  checkoutBtn?.addEventListener("click", checkoutCartWhatsApp);

  productModalClose?.addEventListener("click", closeProductModal);
  productModalOverlay?.addEventListener("click", closeProductModal);

  calcAmount?.addEventListener("input", calculateFinancing);
  calcMonths?.addEventListener("change", calculateFinancing);
  themeToggle?.addEventListener("click", toggleTheme);

  mobileMenuToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("active");
    mobileMenuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("active");
      mobileMenuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      if (!item) return;

      const willOpen = !item.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach((faqItem) => {
        faqItem.classList.remove("active");
        faqItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("active");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeProductModal();
    closeCart();
  });
}

/* ========================================================================== 
   CATÁLOGO
   ========================================================================== */

function renderProducts() {
  if (!productsGrid) return;

  const filteredProducts = products.filter((product) => {
    const title = String(product.title || "").toLowerCase();
    const brand = String(product.brand || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();
    const condition = String(product.condition || "").toLowerCase();

    const matchesSearch = title.includes(searchQuery) || brand.includes(searchQuery);
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const matchesCondition = activeCondition === "all" || condition === activeCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  productsGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    if (noResults) noResults.style.display = "block";
    return;
  }

  if (noResults) noResults.style.display = "none";

  filteredProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const condition = String(product.condition || "").toLowerCase();
    const badgeClass = condition === "nuevo" ? "tag-nuevo" : "tag-seminuevo";
    const storageOptions = getStorageOptions(product);
    const baseStorageOption = storageOptions[0];
    const hasStoragePrices = storageOptions.length > 1;
    const oldPriceHTML = baseStorageOption.oldPrice
      ? `<span class="price-old">${formatCurrency(baseStorageOption.oldPrice)}</span>`
      : "";
    const priceLabel = `${hasStoragePrices ? "Desde " : ""}${formatCurrency(baseStorageOption.price)}`;

    card.innerHTML = `
      <span class="product-tag-badge ${badgeClass}">${escapeHTML(product.badge || product.condition || "Disponible")}</span>
      <button type="button" class="product-image-container" data-open-product="${Number(product.id)}" aria-label="Ver detalles de ${escapeHTML(product.title)}">
        <img src="${escapeHTML(product.image || FALLBACK_IMAGE)}" alt="${escapeHTML(product.title)}">
      </button>
      <div class="product-info">
        <span class="product-brand">${escapeHTML(product.brand || "")}</span>
        <button type="button" class="product-title product-title-btn" data-open-product="${Number(product.id)}">
          ${escapeHTML(product.title || "Producto")}
        </button>
        <p class="product-condition">${condition === "nuevo" ? "Equipo nuevo de fábrica" : "Seminuevo Grado A+"}</p>
        <div class="product-price-row">
          <span class="price-current">${priceLabel}</span>
          ${oldPriceHTML}
        </div>
        <button type="button" class="btn btn-primary" data-add-product="${Number(product.id)}">Agregar al carrito</button>
      </div>
    `;

    card.querySelector("img")?.addEventListener("error", setFallbackImage);
    card.querySelectorAll("[data-open-product]").forEach((button) => {
      button.addEventListener("click", () => openProductModal(Number(button.dataset.openProduct)));
    });
    card.querySelector("[data-add-product]")?.addEventListener("click", () => {
      quickAddToCart(Number(product.id));
    });

    productsGrid.appendChild(card);
  });
}

/* ========================================================================== 
   MODAL DE PRODUCTO
   ========================================================================== */

function openProductModal(productId) {
  const product = products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;

  currentSelectedProduct = product;
  modalSelectedColor = product.variants?.colors?.[0]?.name || "Color estándar";
  modalSelectedStorage = getStorageOptions(product)[0].name;

  renderModalContent();
  productModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  productModalClose?.focus();
}

function closeProductModal() {
  if (!productModal?.classList.contains("active")) return;

  productModal.classList.remove("active");
  document.body.style.overflow = "";
}

function renderModalContent() {
  if (!productModalBody || !currentSelectedProduct) return;

  const product = currentSelectedProduct;
  const colors = product.variants?.colors?.length
    ? product.variants.colors
    : [{ name: "Color estándar", value: "#cccccc" }];
  const storage = getStorageOptions(product);
  const selectedStorageOption = getStorageOption(product, modalSelectedStorage);

  const colorsHTML = colors
    .map((color) => {
      const active = color.name === modalSelectedColor ? "active" : "";
      return `
        <button type="button" class="color-dot-btn ${active}" data-color="${escapeHTML(color.name)}" style="background-color:${escapeHTML(color.value)};" title="${escapeHTML(color.name)}" aria-label="Color ${escapeHTML(color.name)}"></button>
      `;
    })
    .join("");

  const storageHTML = storage
    .map((item) => {
      const active = item.name === modalSelectedStorage ? "active" : "";
      return `
        <button type="button" class="variant-btn ${active}" data-storage="${escapeHTML(item.name)}">
          ${escapeHTML(item.name)} <span>${formatCurrency(item.price)}</span>
        </button>
      `;
    })
    .join("");

  const specsHTML = Array.isArray(product.specs)
    ? product.specs.map((spec) => `<li>${escapeHTML(spec)}</li>`).join("")
    : "";

  const oldPriceHTML = selectedStorageOption.oldPrice
    ? `<span class="modal-price-old">${formatCurrency(selectedStorageOption.oldPrice)}</span>`
    : "";
  const monthlyPayment = formatCurrency(Math.round(selectedStorageOption.price / 6));

  productModalBody.innerHTML = `
    <div class="modal-grid">
      <div class="modal-gallery">
        <img src="${escapeHTML(product.image || FALLBACK_IMAGE)}" alt="${escapeHTML(product.title)}">
      </div>
      <div class="modal-details">
        <span class="product-brand">${escapeHTML(product.brand || "")}</span>
        <h1 class="modal-title">${escapeHTML(product.title || "Producto")}</h1>
        <div class="modal-price-row">
          <span class="modal-price">${formatCurrency(selectedStorageOption.price)}</span>
          ${oldPriceHTML}
        </div>
        <div class="option-group">
          <span class="option-label">Color: <strong id="modal-color-name">${escapeHTML(modalSelectedColor)}</strong></span>
          <div class="option-selectors" id="modal-colors-container">${colorsHTML}</div>
        </div>
        <div class="option-group">
          <span class="option-label">Capacidad:</span>
          <div class="option-selectors" id="modal-storage-container">${storageHTML}</div>
        </div>
        <div class="option-group payment-option">
          <span class="option-label">Facilidades de pago:</span>
          <div class="trust-summary-item payment-summary">Lléveselo en 6 cuotas de ${monthlyPayment}/mes sin intereses.</div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-primary btn-block" id="modal-add-cart-btn">Agregar al carrito</button>
        </div>
        <div class="modal-trust-summary">
          <div class="trust-summary-item"><span>✅ Garantía de 90 días por escrito</span></div>
          <div class="trust-summary-item"><span>🚚 Envío por Rápido Cargo desde Choluteca</span></div>
        </div>
      </div>
    </div>
    <div class="modal-tabs">
      <div class="modal-tab-content">
        <h3>Descripción del producto</h3>
        <p>${escapeHTML(product.description || "Producto disponible en Mi Phone HN.")}</p>
        ${specsHTML ? `<h3>Especificaciones técnicas</h3><ul>${specsHTML}</ul>` : ""}
        <h3>¿Qué incluye tu paquete?</h3>
        <p>Dispositivo inspeccionado, cable compatible, empaque seguro y garantía por escrito.</p>
      </div>
    </div>
  `;

  productModalBody.querySelector(".modal-gallery img")?.addEventListener("error", setFallbackImage);

  productModalBody.querySelectorAll(".color-dot-btn").forEach((button) => {
    button.addEventListener("click", () => {
      productModalBody.querySelectorAll(".color-dot-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      modalSelectedColor = button.dataset.color || "Color estándar";
      const colorName = document.getElementById("modal-color-name");
      if (colorName) colorName.textContent = modalSelectedColor;
    });
  });

  productModalBody.querySelectorAll(".variant-btn").forEach((button) => {
    button.addEventListener("click", () => {
      modalSelectedStorage = button.dataset.storage || "Estándar";
      renderModalContent();
    });
  });

  document.getElementById("modal-add-cart-btn")?.addEventListener("click", addModalProductToCart);
}

/* ========================================================================== 
   CARRITO
   ========================================================================== */

function openCart() {
  cartDrawer?.classList.add("active");
}

function closeCart() {
  cartDrawer?.classList.remove("active");
}

function quickAddToCart(productId) {
  const product = products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;

  const color = product.variants?.colors?.[0]?.name || "Color estándar";
  const storage = getStorageOptions(product)[0].name;
  addToCart(product, color, storage);
}

function addModalProductToCart() {
  if (!currentSelectedProduct) return;

  addToCart(currentSelectedProduct, modalSelectedColor, modalSelectedStorage);
  closeProductModal();
}

function addToCart(product, color, storage) {
  const selectedStorageOption = getStorageOption(product, storage);
  const cartItemId = `${product.id}-${color}-${selectedStorageOption.name}`;
  const existingItem = cart.find((item) => item.cartItemId === cartItemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      cartItemId,
      id: Number(product.id),
      title: product.title,
      brand: product.brand,
      price: selectedStorageOption.price,
      oldPrice: selectedStorageOption.oldPrice,
      image: product.image || FALLBACK_IMAGE,
      color,
      storage: selectedStorageOption.name,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  openCart();
}

function changeCartQty(cartItemId, delta) {
  const item = cart.find((product) => product.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((product) => product.cartItemId !== cartItemId);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(cartItemId) {
  cart = cart.filter((product) => product.cartItemId !== cartItemId);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  if (!cartItemsContainer || !cartSubtotalEl || !cartBadge) return;

  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const checkoutForm = document.getElementById("cart-checkout-form");

  cartBadge.textContent = String(totalItems);
  cartBadge.classList.toggle("is-empty", totalItems === 0);
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Tu carrito está vacío.</p>
        <p class="cart-empty-hint">Añade productos para empezar.</p>
      </div>
    `;
    cartSubtotalEl.textContent = formatCurrency(0);
    if (checkoutForm) checkoutForm.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
    subtotal += itemTotal;

    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <div class="cart-item-img">
        <img src="${escapeHTML(item.image || FALLBACK_IMAGE)}" alt="${escapeHTML(item.title)}">
      </div>
      <div class="cart-item-details">
        <h4>${escapeHTML(item.title)}</h4>
        <p class="cart-item-meta">${escapeHTML(item.color)} | ${escapeHTML(item.storage)}</p>
        <div class="cart-item-qty" aria-label="Cantidad de ${escapeHTML(item.title)}">
          <button type="button" class="qty-btn" data-action="decrease" aria-label="Reducir cantidad">−</button>
          <span class="qty-val">${Number(item.quantity)}</span>
          <button type="button" class="qty-btn" data-action="increase" aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <div class="cart-item-price-remove">
        <span class="cart-item-price">${formatCurrency(itemTotal)}</span>
        <button type="button" class="cart-item-remove">Eliminar</button>
      </div>
    `;

    itemElement.querySelector("img")?.addEventListener("error", setFallbackImage);
    itemElement.querySelector('[data-action="decrease"]')?.addEventListener("click", () => changeCartQty(item.cartItemId, -1));
    itemElement.querySelector('[data-action="increase"]')?.addEventListener("click", () => changeCartQty(item.cartItemId, 1));
    itemElement.querySelector(".cart-item-remove")?.addEventListener("click", () => removeFromCart(item.cartItemId));

    cartItemsContainer.appendChild(itemElement);
  });

  cartSubtotalEl.textContent = formatCurrency(subtotal);
  if (checkoutForm) checkoutForm.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "flex";
}

/* ========================================================================== 
   CHECKOUT POR WHATSAPP
   ========================================================================== */

function checkoutCartWhatsApp() {
  if (cart.length === 0) return;

  const nameInput = document.getElementById("client-name");
  const dniInput = document.getElementById("client-dni");
  const locationInput = document.getElementById("client-location");

  const name = nameInput?.value.trim() || "";
  const dni = dniInput?.value.trim() || "";
  const location = locationInput?.value.trim() || "";

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

  cart.forEach((item) => {
    const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
    subtotal += itemTotal;
    message += `- ${item.title} (${item.storage} | ${item.color})\n`;
    message += `  Cantidad: ${item.quantity}\n`;
    message += `  Subtotal: ${formatCurrency(itemTotal)}\n`;
  });

  message += `\n*TOTAL: ${formatCurrency(subtotal)}*\n\n`;
  message += "Despacho: Choluteca, Honduras\n";
  message += "Logística: Rápido Cargo";

  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

/* ========================================================================== 
   CALCULADORA DE EXTRAFINANCIAMIENTO
   ========================================================================== */

function calculateFinancing() {
  if (!calcAmount || !calcMonths || !calcValue || !calcWhatsappBtn) return;

  const amount = Math.max(0, Number.parseFloat(calcAmount.value) || 0);
  const months = Number.parseInt(calcMonths.value, 10) || 6;

  if (amount <= 0) {
    calcValue.textContent = "L. 0 / mes";
    calcWhatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}`;
    return;
  }

  const monthlyPayment = Math.round(amount / months);
  calcValue.textContent = `${formatCurrency(monthlyPayment)} / mes`;

  const message = [
    "Hola Mi Phone HN, me gustaría consultar por Extrafinanciamiento:",
    `Monto: ${formatCurrency(amount)}`,
    `Plazo: ${months} meses sin intereses.`,
    "",
    "¿Cuáles son los requisitos con BAC o Ficohsa?"
  ].join("\n");

  calcWhatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/* ========================================================================== 
   TEMA OSCURO / CLARO
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const theme = savedTheme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
}

/* ========================================================================== 
   UTILIDADES
   ========================================================================== */

/*
  Cada opción de almacenamiento puede definir su propio precio:
  { name: "256GB", price: 29500, oldPrice: 32000 }
  También se aceptan strings para mantener compatibilidad con catálogos anteriores.
*/
function getStorageOptions(product) {
  const defaultOption = {
    name: "Estándar",
    price: Number(product?.price) || 0,
    oldPrice: Number(product?.oldPrice) || 0
  };
  const storage = product?.variants?.storage;

  if (!Array.isArray(storage) || storage.length === 0) {
    return [defaultOption];
  }

  return storage.map((item, index) => {
    if (typeof item === "string") {
      return {
        name: item,
        price: defaultOption.price,
        oldPrice: defaultOption.oldPrice
      };
    }

    return {
      name: String(item.name || `Opción ${index + 1}`),
      price: Number(item.price) || defaultOption.price,
      oldPrice: Number(item.oldPrice) || 0
    };
  });
}

function getStorageOption(product, storageName) {
  const options = getStorageOptions(product);
  return options.find((option) => option.name === storageName) || options[0];
}

function getStoredCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function setFallbackImage(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = FALLBACK_IMAGE;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;"
  })[character]);
}

function formatCurrency(value) {
  const number = Number(value) || 0;

  return `L. ${number.toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}
