/* ==========================================================================
   MI PHONE HN — PANEL ADMIN SAAS CON FIREBASE FIRESTORE & STORAGE
   ========================================================================== */

import { 
  db, 
  storage, 
  auth, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs,
  onSnapshot, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  syncUserToFirestore
} from './firebase-config.js';

let categories = [];

function getCategoryLabel(catId) {
  const cat = categories.find(c => c.id === catId);
  return cat ? cat.label : catId;
}

let unsubscribeCategories = null;

async function seedDefaultCategories() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    if (!snap.empty) return;
    const defaults = [
      { id: "iphones", label: "iPhones" },
      { id: "samsung", label: "Samsung" },
      { id: "ipads", label: "iPads" },
      { id: "accessories", label: "Accesorios" }
    ];
    for (const cat of defaults) {
      await setDoc(doc(db, "categories", cat.id), { label: cat.label });
    }
    console.log("✅ Categorías predeterminadas creadas en Firestore.");
  } catch (err) {
    console.warn("⚠️ Error al crear categorías predeterminadas:", err);
  }
}

function listenToCategories() {
  const catRef = collection(db, "categories");
  if (unsubscribeCategories) {
    try { unsubscribeCategories(); } catch(e) {}
    unsubscribeCategories = null;
  }
  seedDefaultCategories();
  try {
    unsubscribeCategories = onSnapshot(catRef, (snap) => {
      categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderCategoryFilter();
      renderFormCategories();
      updateDashboardMetrics();
    }, async () => {
      await fetchCategoriesFallback();
    });
  } catch {
    fetchCategoriesFallback();
  }
}

async function fetchCategoriesFallback() {
  try {
    const snap = await getDocs(collection(db, "categories"));
    categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCategoryFilter();
    renderFormCategories();
    updateDashboardMetrics();
  } catch (err) {
    console.error("Error al obtener categorías:", err);
  }
}

function renderCategoryFilter() {
  const filter = document.getElementById("admin-category-filter");
  if (!filter) return;
  const currentValue = filter.value;
  filter.innerHTML = '<option value="all">📁 Todas las Categorías</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.label;
    filter.appendChild(opt);
  });
  filter.value = currentValue;
}

function renderFormCategories() {
  const formSelect = document.getElementById("product-category");
  if (!formSelect) return;
  const currentValue = formSelect.value;
  formSelect.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.label;
    formSelect.appendChild(opt);
  });
  if (currentValue) formSelect.value = currentValue;
}

function renderCategoryList() {
  const list = document.getElementById("category-list");
  if (!list) return;
  list.innerHTML = '';
  categories.forEach((cat, index) => {
    const item = document.createElement("div");
    item.className = "category-list-item";
    item.innerHTML = `
      <span class="category-list-label">${cat.label}</span>
      <button type="button" class="btn btn-danger btn-sm" data-cat-index="${index}">Eliminar</button>
    `;
    list.appendChild(item);
  });
  list.querySelectorAll("[data-cat-index]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const index = parseInt(btn.dataset.catIndex);
      const catId = categories[index].id;
      const productsUsing = products.filter(p => p.category === catId);
      if (productsUsing.length > 0) {
        showAlert(`No se puede eliminar "${categories[index].label}": ${productsUsing.length} producto(s) la usan.`, "error");
        return;
      }
      try {
        await deleteDoc(doc(db, "categories", catId));
      } catch (err) {
        showAlert("Error al eliminar categoría: " + err.message, "error");
      }
    });
  });
}

function openCategoryModal() {
  renderCategoryList();
  document.getElementById("category-modal").hidden = false;
}

function closeCategoryModal() {
  document.getElementById("category-modal").hidden = true;
}

let products = [];
let editingProductId = null;
let confirmCallback = null;
let unsubscribeFirestore = null;

/* DOM elements */
const loginScreen = document.getElementById("login-screen");
const adminApp = document.getElementById("admin-app");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const adminAlert = document.getElementById("admin-alert");
const productsTableBody = document.getElementById("products-table-body");
const emptyTableMsg = document.getElementById("empty-table-msg");
const adminSearch = document.getElementById("admin-search");
const categoryFilter = document.getElementById("admin-category-filter");
const addProductBtn = document.getElementById("add-product-btn");
const reloadBtn = document.getElementById("reload-btn");
const productModal = document.getElementById("product-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalCloseBtn = document.getElementById("modal-close-btn");
const productForm = document.getElementById("product-form");
const modalTitle = document.getElementById("modal-title");
const deleteProductBtn = document.getElementById("delete-product-btn");
const cancelFormBtn = document.getElementById("cancel-form-btn");
const formError = document.getElementById("form-error");
const specsList = document.getElementById("specs-list");
const colorsList = document.getElementById("colors-list");
const storageList = document.getElementById("storage-list");
const addSpecBtn = document.getElementById("add-spec-btn");
const addColorBtn = document.getElementById("add-color-btn");
const addStorageBtn = document.getElementById("add-storage-btn");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmOverlay = document.getElementById("confirm-overlay");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmCancelBtn = document.getElementById("confirm-cancel-btn");
const confirmOkBtn = document.getElementById("confirm-ok-btn");
const fileDropzone = document.getElementById("file-dropzone");

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  // Autenticación con Firebase Auth
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showAdmin();
      listenToProducts();
      listenToCategories();
    } else {
      showLogin();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }
      if (unsubscribeCategories) {
        unsubscribeCategories();
        unsubscribeCategories = null;
      }
    }
  });

  loginForm?.addEventListener("submit", handleLogin);
  logoutBtn?.addEventListener("click", handleLogout);
  adminSearch?.addEventListener("input", renderProductsTable);
  categoryFilter?.addEventListener("change", renderProductsTable);
  addProductBtn?.addEventListener("click", () => openProductModal(null));
  reloadBtn?.addEventListener("click", () => listenToProducts());
  productForm?.addEventListener("submit", handleProductSubmit);
  modalCloseBtn?.addEventListener("click", closeProductModal);
  modalOverlay?.addEventListener("click", closeProductModal);
  cancelFormBtn?.addEventListener("click", closeProductModal);
  deleteProductBtn?.addEventListener("click", handleDeleteProduct);
  addSpecBtn?.addEventListener("click", () => addSpecRow());
  addColorBtn?.addEventListener("click", () => addColorRow());
  addStorageBtn?.addEventListener("click", () => addStorageRow());
  confirmCancelBtn?.addEventListener("click", closeConfirm);
  confirmOverlay?.addEventListener("click", closeConfirm);
  confirmOkBtn?.addEventListener("click", () => {
    confirmCallback?.();
    closeConfirm();
  });

  // Drag and Drop Visual Feedback
  if (fileDropzone) {
    const fileInput = document.getElementById("product-image-file");
    
    fileDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileDropzone.classList.add("dragover");
    });

    fileDropzone.addEventListener("dragleave", () => {
      fileDropzone.classList.remove("dragover");
    });

    fileDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      fileDropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && fileInput) {
        fileInput.files = e.dataTransfer.files;
        const textLabel = fileDropzone.querySelector(".dropzone-text");
        if (textLabel) textLabel.textContent = `📷 Archivo seleccionado: ${e.dataTransfer.files[0].name}`;
      }
    });

    fileInput?.addEventListener("change", () => {
      if (fileInput.files && fileInput.files[0]) {
        const textLabel = fileDropzone.querySelector(".dropzone-text");
        if (textLabel) textLabel.textContent = `📷 Archivo seleccionado: ${fileInput.files[0].name}`;
      }
    });
  }

  // Fix "Ver Tienda" link for local dev vs production
  const storeLink = document.getElementById("view-store-link");
  if (storeLink) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      storeLink.href = "http://localhost:5173/";
    } else {
      storeLink.href = "/";
    }
  }

  // Category management
  const manageCategoriesBtn = document.getElementById("manage-categories-btn");
  const categoryOverlay = document.getElementById("category-overlay");
  const closeCategoryModalBtn = document.getElementById("close-category-modal-btn");
  const addCategoryBtnModal = document.getElementById("add-category-btn-modal");
  const newCategoryName = document.getElementById("new-category-name");

  manageCategoriesBtn?.addEventListener("click", openCategoryModal);
  categoryOverlay?.addEventListener("click", closeCategoryModal);
  closeCategoryModalBtn?.addEventListener("click", closeCategoryModal);

  addCategoryBtnModal?.addEventListener("click", async () => {
    const name = newCategoryName?.value.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!id) {
      showAlert("Ingresa un nombre válido para la categoría.", "error");
      return;
    }
    if (categories.some(c => c.id === id)) {
      showAlert(`La categoría "${name}" ya existe.`, "error");
      return;
    }
    try {
      await setDoc(doc(db, "categories", id), { label: name });
      if (newCategoryName) newCategoryName.value = "";
      showAlert(`✅ Categoría "${name}" creada.`, "success");
    } catch (err) {
      showAlert("Error al crear categoría: " + err.message, "error");
    }
  });

  newCategoryName?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addCategoryBtnModal?.click();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProductModal();
      closeCategoryModal();
      closeConfirm();
    }
  });
}

/* Sesión y Autenticación */

async function handleLogin(event) {
  event.preventDefault();
  hideLoginError();

  const email = document.getElementById("admin-email")?.value.trim();
  const password = document.getElementById("admin-password")?.value || "";

  if (!email || !password) {
    showLoginError("Ingresa tu correo y contraseña.");
    return;
  }

  const submitBtn = loginForm.querySelector("button[type='submit']");
  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Conectando a Firebase...";
    }

    let userCred;
    try {
      userCred = await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        throw err;
      }
    }

    await syncUserToFirestore(userCred.user);
    showAlert("¡Sesión iniciada con éxito!", "success");
  } catch (error) {
    showLoginError(error.message || "Error al iniciar sesión.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Iniciar Sesión";
    }
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    location.reload();
  } catch (err) {
    showAlert("Error al cerrar sesión: " + err.message, "error");
  }
}

function showAdmin() {
  loginScreen.hidden = true;
  adminApp.hidden = false;
}

function showLogin() {
  loginScreen.hidden = false;
  adminApp.hidden = true;
}

function showLoginError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.hidden = false;
}

function hideLoginError() {
  if (loginError) loginError.hidden = true;
}

/* Firestore: Lectura en Tiempo Real (R) & Auto-Importación Garantizada */

const SEED_PRODUCTS = [
  {
    "id": "1",
    "title": "iPhone 15 Pro Max",
    "brand": "Apple",
    "price": 29500,
    "oldPrice": 32000,
    "category": "iphones",
    "condition": "nuevo",
    "badge": "Nuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg",
    "description": "iPhone premium con titanio, chip A17 Pro y cámara avanzada.",
    "specs": [
      "Pantalla Super Retina XDR de 6.7 pulgadas",
      "Chip A17 Pro",
      "Cámara principal de 48 MP",
      "USB-C",
      "Face ID"
    ],
    "variants": {
      "colors": [
        { "name": "Titanio Natural", "value": "#bebeb6" },
        { "name": "Titanio Azul", "value": "#2f4452" },
        { "name": "Titanio Negro", "value": "#3b3c3e" }
      ],
      "storage": [
        { "name": "256GB", "price": 29500, "oldPrice": 32000 },
        { "name": "512GB", "price": 32000, "oldPrice": 34500 },
        { "name": "1TB", "price": 36000, "oldPrice": 38500 }
      ]
    }
  },
  {
    "id": "2",
    "title": "iPhone 13 Pro",
    "brand": "Apple",
    "price": 15900,
    "oldPrice": 18500,
    "category": "iphones",
    "condition": "seminuevo",
    "badge": "Seminuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-01.jpg",
    "description": "Equipo seminuevo grado A+ con pantalla ProMotion y gran rendimiento.",
    "specs": [
      "Pantalla Super Retina XDR de 6.1 pulgadas",
      "ProMotion 120Hz",
      "Chip A15 Bionic",
      "Triple cámara Pro",
      "Face ID"
    ],
    "variants": {
      "colors": [
        { "name": "Sierra Blue", "value": "#a7c1d6" },
        { "name": "Graphite", "value": "#4e4f50" },
        { "name": "Gold", "value": "#fae0c5" }
      ],
      "storage": [
        { "name": "128GB", "price": 15900, "oldPrice": 18500 },
        { "name": "256GB", "price": 18000, "oldPrice": 20600 }
      ]
    }
  },
  {
    "id": "3",
    "title": "iPhone 14",
    "brand": "Apple",
    "price": 18500,
    "oldPrice": 20500,
    "category": "iphones",
    "condition": "seminuevo",
    "badge": "Seminuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg",
    "description": "iPhone moderno con excelente cámara, batería y rendimiento.",
    "specs": [
      "Pantalla OLED de 6.1 pulgadas",
      "Chip A15 Bionic",
      "Cámara dual de 12 MP",
      "Face ID",
      "Carga MagSafe"
    ],
    "variants": {
      "colors": [
        { "name": "Midnight", "value": "#1c1c1e" },
        { "name": "Blue", "value": "#a7c7e7" },
        { "name": "Purple", "value": "#d8bfd8" }
      ],
      "storage": [
        { "name": "128GB", "price": 18500, "oldPrice": 20500 },
        { "name": "256GB", "price": 20500, "oldPrice": 22500 }
      ]
    }
  },
  {
    "id": "4",
    "title": "iPhone 12",
    "brand": "Apple",
    "price": 10500,
    "oldPrice": 12500,
    "category": "iphones",
    "condition": "seminuevo",
    "badge": "Seminuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-12-1.jpg",
    "description": "Diseño clásico con bordes planos, pantalla OLED y conectividad 5G.",
    "specs": [
      "Pantalla Super Retina XDR",
      "Chip A14 Bionic",
      "Cámara dual",
      "5G",
      "Face ID"
    ],
    "variants": {
      "colors": [
        { "name": "Negro", "value": "#111111" },
        { "name": "Blanco", "value": "#f5f5f7" },
        { "name": "Azul", "value": "#203a43" }
      ],
      "storage": [
        { "name": "64GB", "price": 10500, "oldPrice": 12500 },
        { "name": "128GB", "price": 12000, "oldPrice": 14000 }
      ]
    }
  },
  {
    "id": "5",
    "title": "Samsung Galaxy S24 Ultra",
    "brand": "Samsung",
    "price": 27900,
    "oldPrice": 31000,
    "category": "samsung",
    "condition": "nuevo",
    "badge": "Nuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-0.jpg",
    "description": "Samsung premium con Galaxy AI, cámara de 200 MP y S Pen.",
    "specs": [
      "Pantalla Dynamic AMOLED 2X",
      "Snapdragon 8 Gen 3",
      "Cámara de 200 MP",
      "S Pen integrado",
      "Batería de 5000 mAh"
    ],
    "variants": {
      "colors": [
        { "name": "Titanium Gray", "value": "#8e8e93" },
        { "name": "Titanium Violet", "value": "#4b415a" },
        { "name": "Titanium Black", "value": "#1c1c1e" }
      ],
      "storage": [
        { "name": "256GB", "price": 27900, "oldPrice": 31000 },
        { "name": "512GB", "price": 30900, "oldPrice": 34000 }
      ]
    }
  },
  {
    "id": "6",
    "title": "Samsung Galaxy S23 Ultra",
    "brand": "Samsung",
    "price": 22500,
    "oldPrice": 25000,
    "category": "samsung",
    "condition": "seminuevo",
    "badge": "Seminuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-ultra-5g-1.jpg",
    "description": "Potente gama alta con S Pen, excelente zoom y pantalla AMOLED.",
    "specs": [
      "Pantalla AMOLED de 6.8 pulgadas",
      "Snapdragon 8 Gen 2",
      "Cámara de 200 MP",
      "S Pen",
      "Carga rápida"
    ],
    "variants": {
      "colors": [
        { "name": "Phantom Black", "value": "#111111" },
        { "name": "Green", "value": "#4b6043" }
      ],
      "storage": [
        { "name": "256GB", "price": 22500, "oldPrice": 25000 },
        { "name": "512GB", "price": 25500, "oldPrice": 28000 }
      ]
    }
  },
  {
    "id": "7",
    "title": "Samsung Galaxy A55 5G",
    "brand": "Samsung",
    "price": 9500,
    "oldPrice": 11000,
    "category": "samsung",
    "condition": "nuevo",
    "badge": "Nuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-1.jpg",
    "description": "Excelente opción gama media con pantalla AMOLED y 5G.",
    "specs": [
      "Pantalla Super AMOLED 120Hz",
      "Cámara principal de 50 MP",
      "Batería de 5000 mAh",
      "5G",
      "Resistencia IP67"
    ],
    "variants": {
      "colors": [
        { "name": "Awesome Navy", "value": "#1a237e" },
        { "name": "Awesome Iceblue", "value": "#e3f2fd" }
      ],
      "storage": [
        { "name": "128GB", "price": 9500, "oldPrice": 11000 },
        { "name": "256GB", "price": 11000, "oldPrice": 12500 }
      ]
    }
  },
  {
    "id": "8",
    "title": "iPad Air 5ta Generación",
    "brand": "Apple",
    "price": 12900,
    "oldPrice": 14500,
    "category": "ipads",
    "condition": "seminuevo",
    "badge": "Seminuevo",
    "image": "https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-air-2022-1.jpg",
    "description": "iPad con chip M1, ideal para estudio, diseño y productividad.",
    "specs": [
      "Pantalla Liquid Retina de 10.9 pulgadas",
      "Chip M1",
      "Compatible con Apple Pencil",
      "USB-C",
      "Cámara frontal ultra gran angular"
    ],
    "variants": {
      "colors": [
        { "name": "Gris Espacial", "value": "#4e4f50" },
        { "name": "Azul", "value": "#a7c1d6" },
        { "name": "Púrpura", "value": "#d7c3eb" }
      ],
      "storage": [
        { "name": "64GB", "price": 12900, "oldPrice": 14500 },
        { "name": "256GB", "price": 15500, "oldPrice": 17100 }
      ]
    }
  },
  {
    "id": "9",
    "title": "AirPods Pro 2da Generación",
    "brand": "Apple",
    "price": 5900,
    "oldPrice": 6800,
    "category": "accessories",
    "condition": "nuevo",
    "badge": "Nuevo",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8QiKJZ_WGAAnfJ1jRV5X-jGrpCnHykAZ_yITbM8nAcw&s=10",
    "description": "Audífonos premium con cancelación activa de ruido y audio espacial.",
    "specs": [
      "Chip H2",
      "Cancelación activa de ruido",
      "Audio espacial",
      "Estuche MagSafe",
      "Hasta 6 horas de reproducción"
    ],
    "variants": {
      "colors": [
        { "name": "Blanco", "value": "#ffffff" }
      ],
      "storage": [
        { "name": "Estándar", "price": 5900, "oldPrice": 6800 }
      ]
    }
  },
  {
    "id": "10",
    "title": "Cargador Apple USB-C 20W",
    "brand": "Apple",
    "price": 750,
    "oldPrice": 950,
    "category": "accessories",
    "condition": "nuevo",
    "badge": "Nuevo",
    "image": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MHJA3?wid=572&hei=572&fmt=jpeg&qlt=95&.v=1603730167000",
    "description": "Adaptador de carga rápida USB-C compatible con iPhone y iPad.",
    "specs": [
      "Carga rápida de 20W",
      "Puerto USB-C",
      "Compatible con iPhone",
      "Compatible con iPad",
      "Diseño compacto"
    ],
    "variants": {
      "colors": [
        { "name": "Blanco", "value": "#ffffff" }
      ],
      "storage": [
        { "name": "Estándar", "price": 750, "oldPrice": 950 }
      ]
    }
  }
];

let isImportingProducts = false;

async function autoImportProductsJson() {
  if (isImportingProducts) return;
  isImportingProducts = true;

  try {
    let importedCount = 0;
    for (const item of SEED_PRODUCTS) {
      if (!item || item.id === undefined) continue;
      const docId = String(item.id);
      const docRef = doc(db, "products", docId);

      try {
        const docSnap = await getDoc(docRef);
        // Crear en Firestore únicamente si el documento no existe para evitar duplicados y no borrar productos modificados
        if (!docSnap.exists()) {
          const productPayload = {
            id: docId,
            title: item.title || "",
            brand: item.brand || "Apple",
            price: Number(item.price) || 0,
            oldPrice: Number(item.oldPrice) || 0,
            category: item.category || "iphones",
            condition: item.condition || "seminuevo",
            badge: item.badge || "Seminuevo",
            image: item.image || "",
            description: item.description || "",
            specs: Array.isArray(item.specs) ? item.specs : [],
            variants: item.variants || { colors: [], storage: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(docRef, productPayload);
          importedCount++;
        }
      } catch (docErr) {
        console.warn(`⚠️ No se pudo verificar o importar el producto ID ${docId}:`, docErr.message);
      }
    }

    if (importedCount > 0) {
      console.log(`✅ ${importedCount} productos sincronizados automáticamente hacia Cloud Firestore.`);
      showAlert(`📦 Se importaron ${importedCount} productos a Firestore.`, "success");
    }
  } catch (err) {
    console.warn("⚠️ Error durante la sincronización inicial de productos con Firestore:", err.message);
  } finally {
    isImportingProducts = false;
  }
}

function listenToProducts() {
  setLoading(true);
  const productsRef = collection(db, "products");

  if (unsubscribeFirestore) {
    try { unsubscribeFirestore(); } catch(e) {}
    unsubscribeFirestore = null;
  }

  // Sincronizar automáticamente productos.json si la colección no contiene los productos iniciales
  autoImportProductsJson();

  try {
    unsubscribeFirestore = onSnapshot(productsRef, (snapshot) => {
      products = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      renderProductsTable();
      updateDashboardMetrics();
      setLoading(false);
    }, async (error) => {
      console.warn("⚠️ Streaming en tiempo real bloqueado, ejecutando fallback HTTP getDocs:", error);
      await fetchProductsFallback();
    });
  } catch (err) {
    fetchProductsFallback();
  }
}

async function fetchProductsFallback() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    products = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    renderProductsTable();
    updateDashboardMetrics();
  } catch (err) {
    console.error("Error al obtener productos vía fallback:", err);
    showAlert("⚠️ Conexión bloqueada por el navegador.", "error");
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  if (reloadBtn) reloadBtn.disabled = loading;
  if (addProductBtn) addProductBtn.disabled = loading;
}

function updateDashboardMetrics() {
  const totalElem = document.getElementById("metric-total-products");
  const iphonesElem = document.getElementById("metric-iphones-count");
  const samsungElem = document.getElementById("metric-samsung-count");
  const othersElem = document.getElementById("metric-others-count");

  if (!totalElem) return;

  const total = products.length;
  const iphones = products.filter(p => p.category === "iphones").length;
  const samsung = products.filter(p => p.category === "samsung").length;
  const others = total - iphones - samsung;

  totalElem.textContent = total;
  iphonesElem.textContent = iphones;
  samsungElem.textContent = samsung;
  othersElem.textContent = others;
}

function getFilteredProducts() {
  const query = (adminSearch?.value || "").toLowerCase().trim();
  const category = categoryFilter?.value || "all";

  return products.filter((product) => {
    const title = String(product.title || "").toLowerCase();
    const brand = String(product.brand || "").toLowerCase();
    const matchesSearch = !query || title.includes(query) || brand.includes(query);
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });
}

function renderProductsTable() {
  const filtered = getFilteredProducts();

  productsTableBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyTableMsg.hidden = false;
    return;
  }

  emptyTableMsg.hidden = true;

  filtered.forEach((product) => {
    const row = document.createElement("tr");
    const basePrice = getBasePrice(product);
    const conditionClass = product.condition === "nuevo" ? "nuevo" : "seminuevo";

    row.innerHTML = `
      <td>
        <div class="product-cell">
          <img class="product-thumb" src="${escapeHTML(product.image || '')}" alt="" loading="lazy">
          <div class="product-cell-info">
            <strong>${escapeHTML(product.title || '')}</strong>
            <span>${escapeHTML(product.brand || '')}</span>
          </div>
        </div>
      </td>
      <td><span class="category-pill">${escapeHTML(getCategoryLabel(product.category) || product.category || '')}</span></td>
      <td><span class="condition-pill ${conditionClass}">${escapeHTML(product.badge || product.condition || '')}</span></td>
      <td><strong>${formatCurrency(basePrice)}</strong></td>
      <td style="text-align: right;">
        <div class="table-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${product.id}">Editar</button>
        </div>
      </td>
    `;

    row.querySelector("img")?.addEventListener("error", (event) => {
      event.currentTarget.style.visibility = "hidden";
    });

    row.querySelector("[data-edit]")?.addEventListener("click", () => {
      openProductModal(product.id);
    });

    productsTableBody.appendChild(row);
  });
}

function getBasePrice(product) {
  const storageVars = product?.variants?.storage;
  if (Array.isArray(storageVars) && storageVars.length > 0) {
    const first = storageVars[0];
    return typeof first === "object" ? Number(first.price) || 0 : Number(product.price) || 0;
  }
  return Number(product.price) || 0;
}

/* Modal / Slide-Over Drawer de producto */

function openProductModal(productId) {
  editingProductId = productId;
  formError.hidden = true;

  const dropzoneText = fileDropzone?.querySelector(".dropzone-text");
  if (dropzoneText) dropzoneText.textContent = "Arrastra una imagen aquí o haz clic para explorar";

  if (productId === null) {
    modalTitle.textContent = "Nuevo producto";
    deleteProductBtn.hidden = true;
    fillProductForm(createEmptyProduct());
  } else {
    const product = products.find((item) => String(item.id) === String(productId));
    if (!product) return;

    modalTitle.textContent = "Editar producto";
    deleteProductBtn.hidden = false;
    fillProductForm(product);
  }

  productModal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.style.overflow = "";
  editingProductId = null;
}

function createEmptyProduct() {
  return {
    id: null,
    title: "",
    brand: "",
    price: 0,
    oldPrice: 0,
    category: "iphones",
    condition: "nuevo",
    badge: "Nuevo",
    image: "",
    description: "",
    specs: [""],
    variants: {
      colors: [{ name: "", value: "#cccccc" }],
      storage: [{ name: "128GB", price: 0, oldPrice: 0 }]
    }
  };
}

function fillProductForm(product) {
  document.getElementById("product-id").value = product.id || "";
  document.getElementById("product-title").value = product.title || "";
  document.getElementById("product-brand").value = product.brand || "";
  document.getElementById("product-category").value = product.category || "iphones";
  document.getElementById("product-condition").value = product.condition || "nuevo";
  document.getElementById("product-badge").value = product.badge || "";
  document.getElementById("product-image").value = product.image || "";
  document.getElementById("product-description").value = product.description || "";
  
  const fileInput = document.getElementById("product-image-file");
  if (fileInput) fileInput.value = "";

  specsList.innerHTML = "";
  (product.specs?.length ? product.specs : [""]).forEach((spec) => addSpecRow(spec));

  colorsList.innerHTML = "";
  const colors = product.variants?.colors?.length
    ? product.variants.colors
    : [{ name: "", value: "#cccccc" }];
  colors.forEach((color) => addColorRow(color.name, color.value));

  storageList.innerHTML = "";
  const storageVars = product.variants?.storage?.length
    ? product.variants.storage
    : [{ name: "128GB", price: product.price || 0, oldPrice: product.oldPrice || 0 }];
  storageVars.forEach((item) => {
    if (typeof item === "string") {
      addStorageRow(item, product.price || 0, product.oldPrice || 0);
    } else {
      addStorageRow(item.name, item.price, item.oldPrice);
    }
  });
}

function addSpecRow(value = "") {
  const row = document.createElement("div");
  row.className = "dynamic-row";
  row.innerHTML = `
    <input type="text" class="spec-input" value="${escapeHTML(value)}" placeholder="Ej. Chip A17 Pro">
    <button type="button" class="remove-row-btn">Quitar</button>
  `;
  row.querySelector(".remove-row-btn")?.addEventListener("click", () => row.remove());
  specsList.appendChild(row);
}

function addColorRow(name = "", value = "#cccccc") {
  const row = document.createElement("div");
  row.className = "dynamic-row";
  row.innerHTML = `
    <input type="text" class="color-name" value="${escapeHTML(name)}" placeholder="Nombre del color">
    <input type="color" class="color-value" value="${escapeHTML(value)}">
    <button type="button" class="remove-row-btn">Quitar</button>
  `;
  row.querySelector(".remove-row-btn")?.addEventListener("click", () => row.remove());
  colorsList.appendChild(row);
}

function addStorageRow(name = "128GB", price = 0, oldPrice = 0) {
  const row = document.createElement("div");
  row.className = "dynamic-row";
  row.innerHTML = `
    <input type="text" class="storage-name" value="${escapeHTML(name)}" placeholder="Ej. 256GB">
    <input type="number" class="storage-price" value="${Number(price) || 0}" min="0" step="100" placeholder="Precio">
    <input type="number" class="storage-old-price" value="${Number(oldPrice) || 0}" min="0" step="100" placeholder="Precio anterior">
    <button type="button" class="remove-row-btn">Quitar</button>
  `;
  row.querySelector(".remove-row-btn")?.addEventListener("click", () => row.remove());
  storageList.appendChild(row);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/* Firestore & Firebase Storage: Crear, Editar, Eliminar */

async function handleProductSubmit(event) {
  event.preventDefault();
  formError.hidden = true;

  const submitBtn = productForm.querySelector("button[type='submit']");

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Procesando...";
    }

    const title = document.getElementById("product-title").value.trim();
    const brand = document.getElementById("product-brand").value.trim();
    const category = document.getElementById("product-category").value;
    const condition = document.getElementById("product-condition").value;
    const badge = document.getElementById("product-badge").value.trim() || (condition === "nuevo" ? "Nuevo" : "Seminuevo");
    let imageUrl = document.getElementById("product-image").value.trim();
    const description = document.getElementById("product-description").value.trim();
    const fileInput = document.getElementById("product-image-file");

    if (!title || !brand) {
      throw new Error("Completa el nombre y marca del producto.");
    }

    // Manejo de Multimedia (Firebase Storage con Fallback Seguro y Compresión para CORS/Firestore)
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (submitBtn) submitBtn.textContent = "Procesando imagen...";

      try {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          // Procesar y comprimir imagen localmente
          imageUrl = await compressAndReadImage(file);
          console.log("✅ (Local) Imagen optimizada y comprimida exitosamente.");
        } else {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
          console.log("✅ Imagen subida a Firebase Storage:", imageUrl);
        }
      } catch (storageErr) {
        console.warn("⚠️ Firebase Storage no disponible. Aplicando fallback de imagen comprimida:", storageErr);
        try {
          imageUrl = await compressAndReadImage(file);
          console.log("✅ Imagen procesada exitosamente con compresión fallback.");
        } catch (readErr) {
          if (!imageUrl) {
            throw new Error("Error al procesar el archivo de imagen: " + readErr.message);
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("Proporciona una URL de imagen o selecciona un archivo para subir.");
    }

    const specs = [...specsList.querySelectorAll(".spec-input")]
      .map((input) => input.value.trim())
      .filter(Boolean);

    const colors = [...colorsList.querySelectorAll(".dynamic-row")]
      .map((row) => ({
        name: row.querySelector(".color-name")?.value.trim() || "",
        value: row.querySelector(".color-value")?.value || "#cccccc"
      }))
      .filter((color) => color.name);

    const storageVars = [...storageList.querySelectorAll(".dynamic-row")]
      .map((row) => ({
        name: row.querySelector(".storage-name")?.value.trim() || "",
        price: Number(row.querySelector(".storage-price")?.value) || 0,
        oldPrice: Number(row.querySelector(".storage-old-price")?.value) || 0
      }))
      .filter((item) => item.name);

    if (storageVars.length === 0) {
      throw new Error("Agrega al menos una capacidad con precio.");
    }

    const baseStorage = storageVars[0];

    const productData = {
      title,
      brand,
      price: baseStorage.price,
      oldPrice: baseStorage.oldPrice,
      category,
      condition,
      badge,
      image: imageUrl,
      description,
      specs,
      variants: {
        colors: colors.length ? colors : [{ name: "Estándar", value: "#cccccc" }],
        storage: storageVars
      },
      updatedAt: new Date().toISOString()
    };

    if (submitBtn) submitBtn.textContent = "Guardando en Firestore...";

    if (editingProductId) {
      // Actualizar documento existente
      const productRef = doc(db, "products", String(editingProductId));
      await setDoc(productRef, productData, { merge: true });
      showAlert("🎉 Producto actualizado con éxito en Firestore.", "success");
    } else {
      // Crear nuevo documento
      productData.createdAt = new Date().toISOString();
      const colRef = collection(db, "products");
      await addDoc(colRef, productData);
      showAlert("🎉 Nuevo producto agregado con éxito a Firestore.", "success");
    }

    closeProductModal();
  } catch (error) {
    console.error("Error al guardar producto:", error);
    let msg = error.message;
    if (error.code === "permission-denied" || error.message.includes("permissions")) {
      msg = "Permisos insuficientes en Firebase: Revisa las Reglas de Seguridad en tu Consola de Firebase para la colección 'products'.";
    }
    formError.textContent = msg;
    formError.hidden = false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar cambios";
    }
  }
}

async function handleDeleteProduct() {
  if (!editingProductId) return;

  showConfirm(
    "Eliminar producto",
    "¿Estás seguro de eliminar este producto directamente de Firestore?",
    async () => {
      try {
        const productRef = doc(db, "products", String(editingProductId));
        await deleteDoc(productRef);
        closeProductModal();
        showAlert("🗑️ Producto eliminado de Firestore.", "success");
      } catch (error) {
        showAlert("Error al eliminar producto: " + error.message, "error");
      }
    }
  );
}

/* Helpers UI */

function showAlert(message, type = "success") {
  if (!adminAlert) return;
  adminAlert.textContent = message;
  adminAlert.className = `admin-toast admin-alert-${type}`;
  adminAlert.hidden = false;

  setTimeout(() => {
    adminAlert.hidden = true;
  }, 4000);
}

function showConfirm(title, message, callback) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmCallback = callback;
  confirmDialog.hidden = false;
}

function closeConfirm() {
  confirmDialog.hidden = true;
  confirmCallback = null;
}

function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
  const number = Number(amount) || 0;
  return `L. ${number.toLocaleString("es-HN")}`;
}

function compressAndReadImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("No se pudo decodificar el formato de imagen."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}

