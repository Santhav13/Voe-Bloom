// Inicializar EmailJS 
emailjs.init("UeldQkoTcTz1EtFOo");

// Productos disponibles 
const productos = [
  {
    id: 1,
    nombre: "Labial Rojo Pasión",
    precio: 25000,
    imagen: "Img/Labial.png"
  },
  {
    id: 2,
    nombre: "Shampoo Vitael",
    precio: 22000,
    imagen: "Img/Shampo.jpg"
  },
  {
    id: 3,
    nombre: "Combo Belleza Total",
    precio: 47000,
    imagen: "Img/Combo.png"
  }
];

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Productos en HTML
const listaProductos = document.getElementById("lista-productos");

productos.forEach(prod => {
  const div = document.createElement("div");
  div.classList.add("col-md-4", "mb-4");
  div.innerHTML = `
  <div class="card h-100">
    <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
    <div class="card-body text-center">
      <h5 class="card-title">${prod.nombre}</h5>
      <p class="card-text">$${prod.precio.toLocaleString()}</p>
      <button class="btn btn-outline-primary" onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    </div>
  </div>
`;
  listaProductos.appendChild(div);
});

function mostrarAlertaProducto(nombreProducto) {
  const alerta = document.getElementById("alerta-producto");
  const mensaje = document.getElementById("mensaje-alerta");

  mensaje.textContent = `✅ "${nombreProducto}" agregado al carrito`;

  alerta.classList.add("mostrar");

  setTimeout(() => {
    alerta.classList.remove("mostrar");
  }, 3000);
}

// Agregar al carrito
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  if (!carrito.some(item => item.id === id)) {
    carrito = [...carrito, prod];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarAlertaProducto(prod.nombre);
  } else {
    alert("Este producto ya está en el carrito.");
  }
  actualizarCarritoModal();
}

// Mostrar el carrito en el modal Bootstrap
document.getElementById("ver-carrito").addEventListener("click", () => {
  actualizarCarritoModal();
});

// Actualizar contenido del modal del carrito
function actualizarCarritoModal() {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  listaCarrito.innerHTML = "";
  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<li class="list-group-item text-center">El carrito está vacío.</li>`;
    totalCarrito.textContent = "0";
    return;
  }

  const total = carrito.reduce((acc, prod) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    li.setAttribute("data-id", prod.id);
    li.innerHTML = `
      ${prod.nombre} <span>$${prod.precio.toLocaleString()}</span>
      <button class="btn btn-danger btn-sm eliminar-producto">Eliminar</button>
    `;
    listaCarrito.appendChild(li);
    return acc + prod.precio;
  }, 0);

  totalCarrito.textContent = total.toLocaleString();
  agregarEventosEliminar();
}

// Eliminar productos del carrito
function eliminarProducto(id) {
  carrito = carrito.filter(producto => producto.id !== id);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarritoModal();
}

function agregarEventosEliminar() {
  const botonesEliminar = document.querySelectorAll('.eliminar-producto');
  botonesEliminar.forEach(boton => {
    boton.addEventListener('click', function(event) {
      const productoId = parseInt(event.target.closest('[data-id]').getAttribute('data-id'));
      eliminarProducto(productoId);
    });
  });
}

// Finalizar compra y enviar correo
function finalizarCompra() {
  // Obtener los datos del formulario
  const nombre = document.getElementById("compra-nombre").value;
  const email = document.getElementById("compra-email").value;
  const mensaje = document.getElementById("compra-detalle").value;
  const asunto = document.getElementById("asunto")?.value || "Compra desde Voé Bloom";
  const telefono = document.getElementById("telefono")?.value || "No proporcionado";

  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  // Limpiar formulario
document.getElementById("compra-nombre").value = "";
document.getElementById("compra-email").value = "";
document.getElementById("compra-detalle").value = "";
document.getElementById("asunto").value = "";
document.getElementById("telefono").value = "";

  // ID de pedido aleatorio
  const orderId = Math.floor(Math.random() * 1000000);

  // Lista de productos en formato requerido por la plantilla
  const pedidos = carrito.map(prod => ({
    nombre: prod.nombre,
    unidades: 1, // Si se maneja la cantidad real, se puede agregar un campo `cantidad` mas adelante
    precio: prod.precio.toLocaleString()
  }));

  // Cálculos de costos
  const subtotal = carrito.reduce((acc, p) => acc + p.precio, 0);
  const costoEnvio = 5000;  
  const costoImpuesto = Math.round(subtotal * 0.19);
  const costoTotal = subtotal + costoEnvio + costoImpuesto;

  const pedidosTexto = carrito.map(p => `• ${p.nombre} x1 - $${p.precio.toLocaleString()}`).join("\n");

  // Datos que se envían a EmailJS
  const data = {
    user_name: nombre,
    user_email: email,
    telefono: telefono,
    mensaje: mensaje,
    asunto: asunto,
    order_id: orderId,
    pedidos: pedidosTexto,
    costo_envio: costoEnvio.toLocaleString(),
    costo_impuesto: costoImpuesto.toLocaleString(),
    costo_total: costoTotal.toLocaleString()
  };

  console.log(data);  // Depuración: revisa qué datos estan enviando

  // Enviar con EmailJS
  emailjs.send("service_bb8ga9y","template_05f373i",data)
    .then(function(response) {
      console.log("Correo enviado:", response.status, response.text);
      alert("¡Gracias por tu compra! Te hemos enviado un correo.");
      const modalElement = document.getElementById("modalCarrito");
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement);
    }
    modal.hide();
    }, function(error) {
      console.error("Error al enviar correo:", error);
      alert("Hubo un error al enviar el correo.");
    });

  // Limpiar carrito
  carrito = [];
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarritoModal();
}

document.getElementById("buscador").addEventListener("input", function () {
  const termino = this.value.toLowerCase();
  const resultados = productos.filter(p => p.nombre.toLowerCase().includes(termino));

  listaProductos.innerHTML = ""; // Limpiar vista
  resultados.map(prod => {
    const div = document.createElement("div");
    div.classList.add("col-md-4", "mb-4");
    div.innerHTML = `
      <div class="card h-100">
        <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        <div class="card-body text-center">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio.toLocaleString()}</p>
          <button class="btn btn-outline-primary" onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
        </div>
      </div>
    `;
    listaProductos.appendChild(div);
  });
});


// Accesibilidad modal
const modalCarrito = document.getElementById('modalCarrito');
modalCarrito.addEventListener('shown.bs.modal', function () {
  modalCarrito.removeAttribute('inert');
  modalCarrito.setAttribute('aria-hidden', 'false');
});
modalCarrito.addEventListener('hidden.bs.modal', function () {
  modalCarrito.setAttribute('inert', 'true');
  modalCarrito.setAttribute('aria-hidden', 'true');
});

// Desplazamiento suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});