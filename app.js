// --- CONFIGURACIÓN ---
const WHATSAPP_NUMBER = "504XXXXXXXX"; // Reemplaza las X con el número real de tu negocio
let products = [];
let cart = JSON.parse(localStorage.getItem('miphone_cart')) || [];

// --- ELEMENTOS DEL DOM ---
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const conditionFilter = document.getElementById('condition-filter');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cart-btn');
const closeBtn = document.querySelector('.close-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const themeToggle = document.getElementById('theme-toggle');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    updateCartCount();
    checkTheme();
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        productGrid.innerHTML = '<p>Error al cargar los productos. Intenta más tarde.</p>';
    }
});

// --- RENDERIZADO SEGURO ---
function renderProducts(items) {
    productGrid.innerHTML = '';
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="condition-badge">${product.condition}</span>
            <h3>${product.name}</h3>
            <p>${product.storage || ''}</p>
            <div class="price">L ${product.price.toLocaleString('es-HN')}</div>
            <button class="btn-primary" onclick="addToCart(${product.id})">Añadir al carrito</button>
        `;
        productGrid.appendChild(card);
    });
}

// --- FILTROS ---
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const condition = conditionFilter.value;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm);
        const matchesCondition = condition === 'all' || p.condition === condition;
        return matchesSearch && matchesCondition;
    });
    renderProducts(filtered);
}

searchInput.addEventListener('input', filterProducts);
conditionFilter.addEventListener('change', filterProducts);

// --- CARRITO ---
window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        saveCart();
        updateCartCount();
        alert(`${product.name} añadido al carrito.`);
    }
};

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
}

function saveCart() {
    localStorage.setItem('miphone_cart', JSON.stringify(cart));
}

function updateCartCount() {
    cartCount.textContent = cart.length;
}

// --- MODAL Y CHECKOUT ---
cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name} - L ${item.price.toLocaleString('es-HN')}</span>
                <button onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(div);
        });
    }
    cartTotalPrice.textContent = `L ${total.toLocaleString('es-HN')}`;
}

// Enviar por WhatsApp
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert("El carrito está vacío");

    const name = document.getElementById('client-name').value.trim();
    const dni = document.getElementById('client-dni').value.trim() || 'No proporcionado';
    const address = document.getElementById('client-address').value.trim();

    if(!name || !address) return alert("Por favor, llena tu nombre y dirección.");

    let message = `*NUEVO PEDIDO - Mi Phone HN*%0A%0A`;
    message += `*Cliente:* ${name}%0A*DNI:* ${dni}%0A*Dirección:* ${address}%0A%0A*Productos:*%0A`;
    
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.name} (L ${item.price})%0A`;
        total += item.price;
    });

    message += `%0A*TOTAL: L ${total.toLocaleString('es-HN')}*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
});

// --- MODO OSCURO ---
function checkTheme() {
    const isDark = localStorage.getItem('miphone_theme') === 'dark';
    if(isDark) document.documentElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if(currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('miphone_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('miphone_theme', 'dark');
    }
});
