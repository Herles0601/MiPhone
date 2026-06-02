const WHATSAPP_NUMBER = "50488238432";

let products = [];
let cart = [];

let activeCategory = "all";
let activeCondition = "all";

const productsGrid = document.getElementById("products-grid");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("search-input");

const cartToggle = document.getElementById("cart-toggle");
const cartClose = document.getElementById("cart-close");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-drawer-overlay");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartBadge = document.getElementById("cart-badge");
const cartSubtotal = document.getElementById("cart-subtotal");
const checkoutBtn = document.getElementById("checkout-whatsapp-btn");
const checkoutForm = document.getElementById("cart-checkout-form");

const productModal = document.getElementById("product-modal");
const productModalOverlay = document.getElementById("product-modal-overlay");
const productModalClose = document.getElementById("product-modal-close");
const productModalBody = document.getElementById("product-modal-body");

const themeToggle = document.getElementById("theme-toggle");
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navMenu = document.getElementById("nav-menu");

const calcAmount = document.getElementById("calc-amount");
const calcMonths = document.getElementById("calc-months");
const calcValue = document.getElementById("calc-value");
const calcWhatsappBtn = document.getElementById("calc-whatsapp-btn");

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupEvents();
  updateCalculator();
});

async function loadProducts() {
  try {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error(error);
    productsGrid.innerHTML = "<p>No se pudieron cargar los productos.</p>";
  }
}

function setupEvents() {
  searchInput.addEventListener("input", renderProducts);

  document.querySelectorAll(".filter-tab").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      activeCategory = button.dataset.category;
      renderProducts();
    });
  });

  document.querySelectorAll(".filter-tag").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-tag").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      activeCondition = button.dataset.condition;
      renderProducts();
    });
  });

  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  productModalClose.addEventListener("click", closeProductModal);
  productModalOverlay.addEventListener("click", closeProductModal);

  checkoutBtn.addEventListener("click", handleCheckout);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });

  mobileMenuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("active");
    });
  });

  calcAmount.addEventListener("input", updateCalculator);
  calcMonths.addEventListener("change", updateCalculator);
}

function renderProducts() {
  const search = searchInput.value.toLowerCase();

  const filtered = products.filter(product => {
    const name = product.nombre.toLowerCase();
    const brand = product.marca.toLowerCase();
    const category = product.categoria || "";
    const condition = product.condicion || product.estado || "";

    const matchesSearch = name.includes(search) || brand.includes(search);
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const matchesCondition = activeCondition === "all" || condition.toLowerCase() === activeCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  productsGrid.innerHTML = "";

  if (filtered.length === 0) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image-wrap" onclick="openProductModal(${product.id})">
        <img 
          src="${product.imagen}" 
          alt="${product.nombre}" 
          onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
        >
      </div>

      <div class="product-info">
        <span class="product-condition">${product.estado || product.condicion}</span>
        <h3>${product.nombre}</h3>
        <p>${product.marca} · ${product.almacenamiento || "Consultar"} · ${product.color || "Consultar"}</p>
        <strong class="product-price">L. ${Number(product.precio).toLocaleString("es-HN")}</strong>

        <div class="product-actions">
          <button class="btn btn-secondary" onclick="openProductModal(${product.id})">Ver detalles</button>
          <button class="btn btn-primary" onclick="addToCart(${product.id})">Agregar</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  openCart();
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p class='empty-cart'>Tu carrito está vacío.</p>";
    checkoutForm.style.display = "none";
  } else {
    checkoutForm.style.display = "block";
  }

  cart.forEach(item => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img 
        src="${item.imagen}" 
        alt="${item.nombre}"
        onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
      >

      <div class="cart-item-info">
        <h4>${item.nombre}</h4>
        <p>L. ${Number(item.precio).toLocaleString("es-HN")}</p>

        <div class="cart-qty">
          <button onclick="changeQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>

      <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  updateCartTotals();
}

function changeQuantity(id, amount) {
  const item = cart.find(product => product.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(product => product.id !== id);
  renderCart();
}

function updateCartTotals() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  cartBadge.textContent = totalItems;
  cartSubtotal.textContent = `L. ${subtotal.toLocaleString("es-HN")}`;
}

function openCart() {
  cartDrawer.classList.add("active");
}

function closeCart() {
  cartDrawer.classList.remove("active");
}

function openProductModal(id) {
  const product = products.find(item => item.id === id);

  if (!product) return;

  productModalBody.innerHTML = `
    <div class="modal-product-grid">
      <div class="modal-product-image">
        <img 
          src="${product.imagen}" 
          alt="${product.nombre}"
          onerror="this.src='https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg'"
        >
      </div>

      <div class="modal-product-info">
        <span class="product-condition">${product.estado || product.condicion}</span>
        <h2>${product.nombre}</h2>
        <p><strong>Marca:</strong> ${product.marca}</p>
        <p><strong>Almacenamiento:</strong> ${product.almacenamiento || "Consultar"}</p>
        <p><strong>Color:</strong> ${product.color || "Consultar"}</p>
        <p><strong>Estado:</strong> ${product.estado || product.condicion}</p>
        <p><strong>Garantía:</strong> ${product.garantia || "90 días"}</p>
        <h3>L. ${Number(product.precio).toLocaleString("es-HN")}</h3>
        <button class="btn btn-primary btn-block" onclick="addToCart(${product.id}); closeProductModal();">
          Agregar al carrito
        </button>
      </div>
    </div>
  `;

  productModal.classList.add("active");
}

function closeProductModal() {
  productModal.classList.remove("active");
}

function handleCheckout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const name = document.getElementById("client-name").value.trim();
  const dni = document.getElementById("client-dni").value.trim();
  const location = document.getElementById("client-location").value.trim();

  if (!name || !dni || !location) {
    alert("Completa los datos para la entrega.");
    return;
  }

  const productsText = cart.map(item => {
    return `• ${item.nombre}
Cantidad: ${item.quantity}
Precio: L. ${Number(item.precio).toLocaleString("es-HN")}
Subtotal: L. ${(item.precio * item.quantity).toLocaleString("es-HN")}`;
  }).join("\n\n");

  const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  const message = `
Nuevo pedido - Mi Phone HN

Datos del cliente:
Nombre: ${name}
DNI: ${dni}
Localidad: ${location}

Productos:
${productsText}

Total: L. ${total.toLocaleString("es-HN")}

Envío:
Rápido Cargo / Coordinado por WhatsApp
`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function updateCalculator() {
  const amount = Number(calcAmount.value);
  const months = Number(calcMonths.value);
  const monthly = amount / months;

  calcValue.textContent = `L. ${monthly.toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} / mes`;

  const message = `Hola Mi Phone HN, quiero consultar extrafinanciamiento para un producto de L. ${amount.toLocaleString("es-HN")} a ${months} meses.`;

  calcWhatsappBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
