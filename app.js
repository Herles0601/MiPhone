// 1. Base de datos de productos
// Los productos ahora se cargan desde productos.json.
// El archivo productos.json debe estar en la misma carpeta que index.html, app.js y styles.css.
let products = [];

async function cargarProductosDesdeJSON() {
    try {
        const respuesta = await fetch('productos.json', { cache: 'no-store' });

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar productos.json. Estado: ${respuesta.status}`);
        }

        products = await respuesta.json();

        if (!Array.isArray(products)) {
            throw new Error('productos.json debe contener un arreglo de productos.');
        }
    } catch (error) {
        console.error('Error cargando productos.json:', error);
        products = [];
    }
}

// 2. Estado de la aplicación
let cart = [];
let currentTheme = 'light';

// 3. Inicialización y DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    calculateFinancing();
    updateCartUI();

    await cargarProductosDesdeJSON();
    renderProducts();
});

// 4. Funciones principales (renderProducts, updateCartUI, setupEventListeners, calculateFinancing)
// ... Aquí va todo el código que ya tenías en tu app.js para manejar filtros, carrito, modales, WhatsApp, etc.
