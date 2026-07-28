/* ==========================================================================
   MI PHONE HN — PANEL ADMIN
   ========================================================================== */

const ADMIN_PASSWORD = "miphone2026";
const GITHUB_OWNER = "Herles0601";
const GITHUB_REPO = "MiPhone";
const PRODUCTS_PATH = "products.json";
const PRODUCTS_API = "./products.json";
const SESSION_KEY = "miphone_admin_session";

const CATEGORY_LABELS = {
  iphones: "iPhones",
  samsung: "Samsung",
  ipads: "iPads",
  accessories: "Accesorios"
};

let products = [];
let hasUnsavedChanges = false;
let editingProductId = null;
let confirmCallback = null;

/* DOM */
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
const downloadJsonBtn = document.getElementById("download-json-btn");
const publishBtn = document.getElementById("publish-btn");
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

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (restoreSession()) {
    showAdmin();
    loadProducts();
  }

  loginForm?.addEventListener("submit", handleLogin);
  logoutBtn?.addEventListener("click", handleLogout);
  adminSearch?.addEventListener("input", renderProductsTable);
  categoryFilter?.addEventListener("change", renderProductsTable);
  addProductBtn?.addEventListener("click", () => openProductModal(null));
  reloadBtn?.addEventListener("click", () => loadProducts(true));
  downloadJsonBtn?.addEventListener("click", downloadJson);
  publishBtn?.addEventListener("click", publishChanges);
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

  window.addEventListener("beforeunload", (event) => {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeProductModal();
    closeConfirm();
  });
}

/* Sesión */

function restoreSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session?.authenticated);
  } catch {
    return false;
  }
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function handleLogin(event) {
  event.preventDefault();

  const password = document.getElementById("admin-password")?.value || "";
  const token = document.getElementById("github-token")?.value.trim() || "";

  if (password !== ADMIN_PASSWORD) {
    showLoginError("Contraseña incorrecta.");
    return;
  }

  saveSession({ authenticated: true, githubToken: token });
  hideLoginError();
  showAdmin();
  loadProducts();
}

function handleLogout() {
  if (hasUnsavedChanges) {
    showConfirm(
      "Cambios sin publicar",
      "Tienes cambios locales que no se han publicado. ¿Seguro que quieres cerrar sesión?",
      () => {
        sessionStorage.removeItem(SESSION_KEY);
        location.reload();
      }
    );
    return;
  }

  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function showAdmin() {
  loginScreen.hidden = true;
  adminApp.hidden = false;
}

function showLoginError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.hidden = false;
}

function hideLoginError() {
  if (loginError) loginError.hidden = true;
}

/* Productos */

async function loadProducts(force = false) {
  if (hasUnsavedChanges && !force) {
    showConfirm(
      "Recargar catálogo",
      "Perderás los cambios locales no publicados. ¿Continuar?",
      () => loadProductsFromServer()
    );
    return;
  }

  await loadProductsFromServer();
}

async function loadProductsFromServer() {
  try {
    setLoading(true);
    const response = await fetch(`${PRODUCTS_API}?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("products.json no contiene un arreglo válido.");
    }

    products = data;
    hasUnsavedChanges = false;
    updateStats();
    renderProductsTable();
    showAlert("Catálogo cargado correctamente.", "success");
  } catch (error) {
    showAlert(`No se pudo cargar el catálogo: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  reloadBtn.disabled = loading;
  publishBtn.disabled = loading;
  addProductBtn.disabled = loading;
}

function updateStats() {
  document.getElementById("stat-total").textContent = String(products.length);
  document.getElementById("stat-iphones").textContent = String(countByCategory("iphones"));
  document.getElementById("stat-samsung").textContent = String(countByCategory("samsung"));
  document.getElementById("stat-other").textContent = String(
    countByCategory("ipads") + countByCategory("accessories")
  );
}

function countByCategory(category) {
  return products.filter((product) => product.category === category).length;
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
          <img class="product-thumb" src="${escapeHTML(product.image || "")}" alt="" loading="lazy">
          <div class="product-cell-info">
            <strong>${escapeHTML(product.title)}</strong>
            <span>${escapeHTML(product.brand || "")}</span>
          </div>
        </div>
      </td>
      <td><span class="category-pill">${escapeHTML(CATEGORY_LABELS[product.category] || product.category)}</span></td>
      <td><span class="condition-pill ${conditionClass}">${escapeHTML(product.badge || product.condition)}</span></td>
      <td><strong>${formatCurrency(basePrice)}</strong></td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${product.id}">Editar</button>
        </div>
      </td>
    `;

    row.querySelector("img")?.addEventListener("error", (event) => {
      event.currentTarget.style.visibility = "hidden";
    });

    row.querySelector("[data-edit]")?.addEventListener("click", () => {
      openProductModal(Number(product.id));
    });

    productsTableBody.appendChild(row);
  });
}

function getBasePrice(product) {
  const storage = product?.variants?.storage;
  if (Array.isArray(storage) && storage.length > 0) {
    const first = storage[0];
    return typeof first === "object" ? Number(first.price) || 0 : Number(product.price) || 0;
  }
  return Number(product.price) || 0;
}

function getNextProductId() {
  if (products.length === 0) return 1;
  return Math.max(...products.map((product) => Number(product.id) || 0)) + 1;
}

/* Modal de producto */

function openProductModal(productId) {
  editingProductId = productId;
  formError.hidden = true;

  if (productId === null) {
    modalTitle.textContent = "Nuevo producto";
    deleteProductBtn.hidden = true;
    fillProductForm(createEmptyProduct());
  } else {
    const product = products.find((item) => Number(item.id) === Number(productId));
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
    id: getNextProductId(),
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
  document.getElementById("product-id").value = product.id;
  document.getElementById("product-title").value = product.title || "";
  document.getElementById("product-brand").value = product.brand || "";
  document.getElementById("product-category").value = product.category || "iphones";
  document.getElementById("product-condition").value = product.condition || "nuevo";
  document.getElementById("product-badge").value = product.badge || "";
  document.getElementById("product-image").value = product.image || "";
  document.getElementById("product-description").value = product.description || "";

  specsList.innerHTML = "";
  (product.specs?.length ? product.specs : [""]).forEach((spec) => addSpecRow(spec));

  colorsList.innerHTML = "";
  const colors = product.variants?.colors?.length
    ? product.variants.colors
    : [{ name: "", value: "#cccccc" }];
  colors.forEach((color) => addColorRow(color.name, color.value));

  storageList.innerHTML = "";
  const storage = product.variants?.storage?.length
    ? product.variants.storage
    : [{ name: "128GB", price: product.price || 0, oldPrice: product.oldPrice || 0 }];
  storage.forEach((item) => {
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

function collectProductFromForm() {
  const id = Number(document.getElementById("product-id").value) || getNextProductId();
  const title = document.getElementById("product-title").value.trim();
  const brand = document.getElementById("product-brand").value.trim();
  const category = document.getElementById("product-category").value;
  const condition = document.getElementById("product-condition").value;
  const badge = document.getElementById("product-badge").value.trim() || (condition === "nuevo" ? "Nuevo" : "Seminuevo");
  const image = document.getElementById("product-image").value.trim();
  const description = document.getElementById("product-description").value.trim();

  const specs = [...specsList.querySelectorAll(".spec-input")]
    .map((input) => input.value.trim())
    .filter(Boolean);

  const colors = [...colorsList.querySelectorAll(".dynamic-row")]
    .map((row) => ({
      name: row.querySelector(".color-name")?.value.trim() || "",
      value: row.querySelector(".color-value")?.value || "#cccccc"
    }))
    .filter((color) => color.name);

  const storage = [...storageList.querySelectorAll(".dynamic-row")]
    .map((row) => ({
      name: row.querySelector(".storage-name")?.value.trim() || "",
      price: Number(row.querySelector(".storage-price")?.value) || 0,
      oldPrice: Number(row.querySelector(".storage-old-price")?.value) || 0
    }))
    .filter((item) => item.name);

  if (!title || !brand || !image) {
    throw new Error("Completa nombre, marca e imagen del producto.");
  }

  if (storage.length === 0) {
    throw new Error("Agrega al menos una capacidad con precio.");
  }

  const baseStorage = storage[0];

  return {
    id,
    title,
    brand,
    price: baseStorage.price,
    oldPrice: baseStorage.oldPrice,
    category,
    condition,
    badge,
    image,
    description,
    specs,
    variants: {
      colors: colors.length ? colors : [{ name: "Estándar", value: "#cccccc" }],
      storage
    }
  };
}

function handleProductSubmit(event) {
  event.preventDefault();
  formError.hidden = true;

  try {
    const product = collectProductFromForm();
    const index = products.findIndex((item) => Number(item.id) === Number(product.id));

    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }

    hasUnsavedChanges = true;
    updateStats();
    renderProductsTable();
    closeProductModal();
    showAlert("Producto guardado localmente. Recuerda publicar los cambios.", "warning");
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
  }
}

function handleDeleteProduct() {
  if (editingProductId === null) return;

  showConfirm(
    "Eliminar producto",
    "Esta acción quitará el producto del catálogo. Debes publicar para que se refleje en la tienda.",
    () => {
      products = products.filter((product) => Number(product.id) !== Number(editingProductId));
      hasUnsavedChanges = true;
      updateStats();
      renderProductsTable();
      closeProductModal();
      showAlert("Producto eliminado localmente. Publica los cambios para aplicarlos.", "warning");
    }
  );
}

/* Publicar y descargar */

function downloadJson() {
  const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.json";
  link.click();
  URL.revokeObjectURL(url);
  showAlert("Archivo products.json descargado.", "success");
}

async function publishChanges() {
  const token = getSession().githubToken;

  if (!token) {
    showAlert(
      "Necesitas un token de GitHub para publicar. Cierra sesión y vuelve a entrar con tu token.",
      "error"
    );
    return;
  }

  showConfirm(
    "Publicar cambios",
    "Se actualizará products.json en GitHub y la tienda se refrescará en unos minutos. ¿Continuar?",
    async () => {
      try {
        publishBtn.disabled = true;
        publishBtn.textContent = "Publicando...";

        await saveToGitHub(token);
        hasUnsavedChanges = false;
        showAlert("¡Catálogo publicado! La tienda se actualizará en 1-2 minutos.", "success");
      } catch (error) {
        showAlert(`Error al publicar: ${error.message}`, "error");
      } finally {
        publishBtn.disabled = false;
        publishBtn.textContent = "Publicar cambios";
      }
    }
  );
}

async function saveToGitHub(token) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PRODUCTS_PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  const getResponse = await fetch(apiUrl, { headers });

  if (!getResponse.ok) {
    throw new Error("No se pudo leer products.json en GitHub. Verifica tu token.");
  }

  const fileData = await getResponse.json();
  const content = encodeBase64(JSON.stringify(products, null, 2) + "\n");

  const putResponse = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Actualizar catálogo desde panel admin",
      content,
      sha: fileData.sha
    })
  });

  if (!putResponse.ok) {
    const errorData = await putResponse.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub respondió con error ${putResponse.status}`);
  }
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/* Utilidades UI */

function showAlert(message, type = "success") {
  adminAlert.textContent = message;
  adminAlert.className = `admin-alert ${type}`;
  adminAlert.hidden = false;

  clearTimeout(showAlert.timer);
  showAlert.timer = setTimeout(() => {
    adminAlert.hidden = true;
  }, 5000);
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

function formatCurrency(value) {
  return `L. ${(Number(value) || 0).toLocaleString("es-HN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
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
