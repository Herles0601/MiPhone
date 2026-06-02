let productos = [];
let carrito = [];

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("listaCarrito");
const totalSpan = document.getElementById("total");
const buscador = document.getElementById("buscador");
const filtroMarca = document.getElementById("filtroMarca");
const finalizarCompra = document.getElementById("finalizarCompra");

fetch("productos.json")
  .then(response => response.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
    cargarMarcas();
  });

function mostrarProductos(lista) {
  contenedorProductos.innerHTML = "";

  lista.forEach(producto => {
    const card = document.createElement("div");
    card.className = "producto";

    card.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p><strong>Marca:</strong> ${producto.marca}</p>
      <p><strong>Estado:</strong> ${producto.estado}</p>
      <p><strong>Almacenamiento:</strong> ${producto.almacenamiento}</p>
      <p><strong>Color:</strong> ${producto.color}</p>
      <p class="precio">L. ${producto.precio.toLocaleString()}</p>
      <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
    `;

    contenedorProductos.appendChild(card);
  });
}

function cargarMarcas() {
  const marcas = [...new Set(productos.map(p => p.marca))];

  marcas.forEach(marca => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    filtroMarca.appendChild(option);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const item = carrito.find(p => p.id === id);

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  mostrarCarrito();
}

function mostrarCarrito() {
  listaCarrito.innerHTML = "";

  carrito.forEach(producto => {
    const item = document.createElement("div");
    item.className = "item-carrito";

    item.innerHTML = `
      <p><strong>${producto.nombre}</strong></p>
      <p>Cantidad: ${producto.cantidad}</p>
      <p>Subtotal: L. ${(producto.precio * producto.cantidad).toLocaleString()}</p>
      <button onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
    `;

    listaCarrito.appendChild(item);
  });

  calcularTotal();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(producto => producto.id !== id);
  mostrarCarrito();
}

function calcularTotal() {
  const total = carrito.reduce((sum, producto) => {
    return sum + producto.precio * producto.cantidad;
  }, 0);

  totalSpan.textContent = total.toLocaleString();
}

buscador.addEventListener("input", filtrarProductos);
filtroMarca.addEventListener("change", filtrarProductos);

function filtrarProductos() {
  const texto = buscador.value.toLowerCase();
  const marca = filtroMarca.value;

  const filtrados = productos.filter(producto => {
    const coincideTexto =
      producto.nombre.toLowerCase().includes(texto) ||
      producto.marca.toLowerCase().includes(texto);

    const coincideMarca = marca === "todos" || producto.marca === marca;

    return coincideTexto && coincideMarca;
  });

  mostrarProductos(filtrados);
}

finalizarCompra.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const ciudad = document.getElementById("ciudad").value.trim();
  const metodoPago = document.getElementById("metodoPago").value;
  const envio = document.getElementById("envio").value;
  const observaciones = document.getElementById("observaciones").value.trim();

  if (!nombre || !telefono || !ciudad || !metodoPago || !envio) {
    alert("Completa todos los datos del cliente.");
    return;
  }

  const productosTexto = carrito.map(producto => {
    return `- ${producto.nombre} ${producto.almacenamiento} ${producto.color}
Cantidad: ${producto.cantidad}
Precio: L. ${producto.precio.toLocaleString()}
Subtotal: L. ${(producto.precio * producto.cantidad).toLocaleString()}`;
  }).join("\n\n");

  const total = carrito.reduce((sum, producto) => {
    return sum + producto.precio * producto.cantidad;
  }, 0);

  const mensaje = `
Nuevo pedido - MyFon

Datos del cliente:
Nombre: ${nombre}
Teléfono: ${telefono}
Ciudad: ${ciudad}

Productos:
${productosTexto}

Total: L. ${total.toLocaleString()}

Método de pago: ${metodoPago}
Entrega: ${envio}

Observaciones:
${observaciones || "Sin observaciones"}
`;

  const numeroWhatsApp = "50488238432";
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});
