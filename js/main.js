const ENVIO_MINIMO = 25000;
const COSTO_ENVIO = 3000;

let productosStock = [];
let carrito = JSON.parse(localStorage.getItem("carritoPAVI")) || [];

document.addEventListener("DOMContentLoaded", async () => {
    const esInicio = window.location.pathname.includes("index.html") || window.location.pathname === "/";
    const rutaJSON = esInicio ? "./js/productos.json" : "../js/productos.json";
    
    productosStock = await pedirProductos(rutaJSON);
    
    if (productosStock.length > 0) {
        renderizarProductosDOM(esInicio);
    }
    actualizarContador();
});

function renderizarProductosDOM(esInicio) {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = ""; 
    const rutaImagenes = esInicio ? "./img/productos/" : "../img/productos/";

    productosStock.forEach(producto => {
        const divProducto = document.createElement("div");
        divProducto.className = "producto-item";
        divProducto.innerHTML = `
            <div class="imagen-contenedor">
                <img src="${rutaImagenes}${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
            </div>
            <p class="producto-descripcion">${producto.nombre}</p>
            <p class="producto-precio">$${producto.precio}</p>
            <button class="btn btn-secondary mt-2 btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>
        `;
        contenedor.appendChild(divProducto);
    });

    document.querySelectorAll(".btn-agregar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            agregarAlCarrito(id);
        });
    });
}

function agregarAlCarrito(idProducto) {
    const productoSeleccionado = productosStock.find(p => p.id === idProducto);
    if (!productoSeleccionado) return;

    const productoEnCarrito = carrito.find(p => p.id === idProducto);
    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
        productoEnCarrito.subtotal = productoEnCarrito.precio * productoEnCarrito.cantidad;
    } else {
        carrito.push({
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            precio: productoSeleccionado.precio,
            cantidad: 1,
            subtotal: productoSeleccionado.precio
        });
    }

    guardarCarritoEnStorage();
    actualizarContador();

    Toastify({
        text: `¡Agregaste ${productoSeleccionado.nombre} al carrito!`,
        duration: 3000,
        gravity: "top", 
        position: "center", 
        style: { background: "#28a745", borderRadius: "10px" }
    }).showToast();
}

function guardarCarritoEnStorage() {
    localStorage.setItem("carritoPAVI", JSON.stringify(carrito));
}

function actualizarContador() {
    let contadorElemento = document.getElementById("contador-carrito");
    if (contadorElemento) {
        let totalUnidades = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
        if (totalUnidades > 0) {
            contadorElemento.innerText = totalUnidades;
            contadorElemento.classList.remove("d-none");
        } else {
            contadorElemento.classList.add("d-none");
        }
    }
}

function renderizarCarrito() {
    let cuerpoModal = document.getElementById("cuerpo-modal-carrito");
    if (!cuerpoModal) return;

    if (carrito.length === 0) {
        cuerpoModal.innerHTML = "<p class='text-center my-4'>Tu carrito está vacío.</p>";
        document.getElementById("btn-pagar").disabled = true;
        document.getElementById("btn-vaciar").disabled = true;
        return;
    }

    document.getElementById("btn-pagar").disabled = false;
    document.getElementById("btn-vaciar").disabled = false;
    let subtotalCompra = carrito.reduce((acc, prod) => acc + prod.subtotal, 0);

    let ticketHTML = "<ul class='list-group mb-3'>";
    carrito.forEach((prod, index) => {
        ticketHTML += `
            <li class='list-group-item d-flex justify-content-between align-items-center'>
                <div>
                    <strong>${prod.nombre}</strong><br>
                    <small>${prod.cantidad} unid. x $${prod.precio}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class='badge bg-secondary rounded-pill fs-6'>$${prod.subtotal}</span>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar" data-index="${index}">X</button>
                </div>
            </li>`;
    });
    ticketHTML += "</ul>";

    ticketHTML += `
        <div class="form-check mb-3 p-3 bg-light rounded border">
            <input class="form-check-input ms-1" type="checkbox" id="check-envio">
            <label class="form-check-label ms-2 fw-bold" for="check-envio">
                ¿Solicitar envío a domicilio?
            </label>
            <div class="form-text ms-2">Envío gratis en compras mayores a $${ENVIO_MINIMO}</div>
        </div>
    `;

    ticketHTML += `<p class='mb-1 fs-5'><strong>Subtotal:</strong> $<span id="monto-subtotal">${subtotalCompra}</span></p>`;
    ticketHTML += `<p class='mb-1 text-danger' id="linea-envio" style="display:none;"><strong>Costo de Envío:</strong> $<span id="costo-envio-txt">0</span></p>`;
    ticketHTML += `<hr><h3 class='text-end mt-3 fw-bold'>TOTAL: $<span id="total-final" class='text-success'>${subtotalCompra}</span></h3>`;

    cuerpoModal.innerHTML = ticketHTML;

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", function() {
            let idx = this.getAttribute("data-index");
            carrito.splice(idx, 1);
            guardarCarritoEnStorage();
            actualizarContador();
            renderizarCarrito(); 
        });
    });

    let checkEnvio = document.getElementById("check-envio");
    let lineaEnvio = document.getElementById("linea-envio");
    let costoEnvioTxt = document.getElementById("costo-envio-txt");
    let totalFinalTxt = document.getElementById("total-final");

    checkEnvio.addEventListener("change", function() {
        let costoEnvio = 0;
        if (this.checked) {
            lineaEnvio.style.display = "block";
            if (subtotalCompra < ENVIO_MINIMO) {
                costoEnvio = COSTO_ENVIO;
            } else {
                Toastify({
                    text: "¡Bonificación aplicada! Envío gratis.",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    style: { background: "#17a2b8", borderRadius: "10px" }
                }).showToast();
            }
        } else {
            lineaEnvio.style.display = "none";
        }
        costoEnvioTxt.innerText = costoEnvio;
        totalFinalTxt.innerText = subtotalCompra + costoEnvio;
    });
}

const btnCarrito = document.getElementById("btn-carrito");
if (btnCarrito) {
    btnCarrito.addEventListener("click", function(evento) {
        evento.preventDefault(); 
        if (carrito.length === 0 && !window.location.pathname.includes("productos.html")) {
            let rutaProductos = window.location.pathname.includes("index.html") || window.location.pathname === "/" 
                ? "./pages/productos.html" : "./productos.html";
            window.location.href = rutaProductos;
            return;
        }
        renderizarCarrito();  
        let modalElement = document.getElementById("modalCarrito");
        let modalObj = new bootstrap.Modal(modalElement);
        modalObj.show();
    });
}

const btnSeguirComprando = document.querySelector("#modalCarrito .btn-secondary");
if (btnSeguirComprando) {
    btnSeguirComprando.addEventListener("click", function() {
        if (!window.location.pathname.includes("productos.html")) {
            let rutaProductos = window.location.pathname.includes("index.html") || window.location.pathname === "/" 
                ? "./pages/productos.html" : "./productos.html";
            window.location.href = rutaProductos;
        } else {
            let modalElement = document.getElementById("modalCarrito");
            bootstrap.Modal.getInstance(modalElement).hide();
        }
    });
}

const btnVaciar = document.getElementById("btn-vaciar");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminarán todos los productos del carrito.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#333',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                carrito = [];
                guardarCarritoEnStorage();
                actualizarContador();
                renderizarCarrito();
                Swal.fire({
                    title: 'Carrito vacío',
                    text: 'Tu carrito ha sido limpiado.',
                    icon: 'success',
                    confirmButtonColor: '#333'
                });
            }
        });
    });
}

const btnPagar = document.getElementById("btn-pagar");
if (btnPagar) {
    btnPagar.addEventListener("click", function() {
        let modalElement = document.getElementById("modalCarrito");
        bootstrap.Modal.getInstance(modalElement).hide();

        Swal.fire({
            title: 'Finalizar Compra',
            html: `
                <p>Confirma tus datos para el envío:</p>
                <input id="swal-input1" class="swal2-input" value="María Pérez">
                <input id="swal-input2" class="swal2-input" value="mariaperez@email.com">
                <input id="swal-input3" class="swal2-input" value="Calle Falsa 123">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Confirmar y Pagar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value,
                    document.getElementById('swal-input3').value
                ]
            }
        }).then((result) => {
            if (result.isConfirmed) {
                carrito = []; 
                guardarCarritoEnStorage(); 
                actualizarContador(); 
                
                Swal.fire({
                    title: '¡Pago Exitoso!',
                    text: 'Gracias por tu compra. Tu pedido está en camino a tu mesa.',
                    icon: 'success',
                    confirmButtonColor: '#333'
                });
            }
        });
    });
}
