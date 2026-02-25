// ==========================================
// PAVI - SIMULADOR DE CARRITO DE COMPRAS
// ==========================================

const ENVIO_MINIMO = 25000;
const COSTO_ENVIO = 3000;

const productos = [
    { id: 1, nombre: "Pasta Fina", precio: 1500 },
    { id: 2, nombre: "Pasta de Huevo", precio: 2000 },
    { id: 3, nombre: "Salsa Marinara", precio: 1000 },
    { id: 4, nombre: "Queso Parmesano", precio: 2500 }
];
let carrito = JSON.parse(localStorage.getItem("carritoPAVI")) || [];

function guardarCarritoEnStorage() {
    localStorage.setItem("carritoPAVI", JSON.stringify(carrito));
}

function actualizarContador() {
    let contadorElemento = document.getElementById("contador-carrito");
    if (contadorElemento) {
        let totalUnidades = 0;
        for (let i = 0; i < carrito.length; i++) {
            totalUnidades += carrito[i].cantidad;
        }

        if (totalUnidades > 0) {
            contadorElemento.innerText = totalUnidades;
            contadorElemento.classList.remove("d-none"); 
        } else {
            contadorElemento.classList.add("d-none"); 
        }
    }
}

function mostrarAvisoFlotante(mensaje) {
    let cartel = document.getElementById("aviso-producto");
    if (cartel) {
        cartel.innerText = mensaje;
        cartel.classList.remove("d-none"); 
        
        setTimeout(() => {
            cartel.classList.add("d-none");
        }, 3000);
    }
}

function agregarProductoSeleccionado(idProducto) {
    let productoSeleccionado = productos.find(producto => producto.id === idProducto);
    
    if (productoSeleccionado) {
        let cantidadIngresada = prompt(`Elegiste ${productoSeleccionado.nombre}.\n¿Cuántas unidades deseas llevar?`);
        let cantidad = parseInt(cantidadIngresada);
        
        if (cantidad > 0) {
            carrito.push({
                nombre: productoSeleccionado.nombre,
                precio: productoSeleccionado.precio,
                cantidad: cantidad,
                subtotal: productoSeleccionado.precio * cantidad
            });
            
            //  Guarda Local Storage
            guardarCarritoEnStorage();
            
            actualizarContador();
            mostrarAvisoFlotante(`¡Excelente! Agregaste ${cantidad}x ${productoSeleccionado.nombre} al carrito.`);
            console.log("Aviso: Producto agregado correctamente.");
        } else {
            alert("Error: Debes ingresar un número válido mayor a 0."); 
        }
    }
}

function procesarPedido() {
    if (carrito.length === 0) {
        if (window.location.pathname.includes("productos.html")) {
            alert("Tu carrito está vacío.\n¡Agrega productos haciendo clic en el botón 'Agregar al Carrito' debajo de cada foto!");
        } else {
            let rutaProductos = window.location.pathname.includes("index.html") || window.location.pathname === "/" 
                ? "./pages/productos.html" 
                : "./productos.html";
            
            alert("Tu carrito está vacío. ¡Te llevaremos a la sección de productos para que empieces a comprar!");
            window.location.href = rutaProductos;
        }
        return null; 
    }

    let subtotalCompra = 0;
    let textoLista = "=== TU CARRITO ACTUAL ===\n\n";
    
    for (let i = 0; i < carrito.length; i++) {
        subtotalCompra += carrito[i].subtotal;
        textoLista += `${carrito[i].cantidad}x ${carrito[i].nombre} - $${carrito[i].subtotal}\n`;
    }

    textoLista += `\nSubtotal de productos: $${subtotalCompra}\n`;

    let costoEnvioFinal = 0;
    
    let pideEnvio = confirm(`${textoLista}\n¿Necesitas envío a domicilio?\n\n(Envío gratis en compras mayores a $${ENVIO_MINIMO})`);
        
    if (pideEnvio) {
        if (subtotalCompra >= ENVIO_MINIMO) {
            mostrarAvisoFlotante(`¡Felicidades! Tienes ENVÍO GRATIS a Bahía Blanca.`);
        } else {
            costoEnvioFinal = COSTO_ENVIO;
            mostrarAvisoFlotante(`Se sumarán $${COSTO_ENVIO} de envío al total.`);
        }
    }

    return { 
        subtotal: subtotalCompra, 
        costoEnvio: costoEnvioFinal, 
        totalPagar: subtotalCompra + costoEnvioFinal,
        envioSolicitado: pideEnvio
    };
}

function mostrarTicket(datosProcesados) {
    let ticketHTML = "<ul class='list-group mb-3'>";
    for (let i = 0; i < carrito.length; i++) {
        ticketHTML += `<li class='list-group-item d-flex justify-content-between align-items-center'>
            ${carrito[i].cantidad}x ${carrito[i].nombre}
            <span class='badge bg-secondary rounded-pill'>$${carrito[i].subtotal}</span>
        </li>`;
    }
    ticketHTML += "</ul>";
    
    ticketHTML += `<p class='mb-1'><strong>Subtotal:</strong> $${datosProcesados.subtotal}</p>`;
    if (datosProcesados.envioSolicitado) {
        ticketHTML += `<p class='mb-1'><strong>Costo de Envío:</strong> $${datosProcesados.costoEnvio}</p>`;
    }
    ticketHTML += `<hr><h4 class='text-end mt-3'>TOTAL: <span class='text-success'>$${datosProcesados.totalPagar}</span></h4>`;

    document.getElementById("cuerpo-modal-carrito").innerHTML = ticketHTML;
    let modalElement = document.getElementById("modalCarrito");
    let modalObj = new bootstrap.Modal(modalElement);
    modalObj.show();

    console.log("=== RESUMEN DE TU PEDIDO EN PAVI ===");
    console.table(carrito);
    console.log("TOTAL A PAGAR: $" + datosProcesados.totalPagar);
}

const botonesAgregar = document.querySelectorAll(".btn-agregar");

for (let i = 0; i < botonesAgregar.length; i++) {
    botonesAgregar[i].addEventListener("click", function() {
        let id = parseInt(this.getAttribute("data-id"));
        agregarProductoSeleccionado(id);
    });
}

const btnCarrito = document.getElementById("btn-carrito");

if (btnCarrito) {
    btnCarrito.addEventListener("click", function(evento) {
        evento.preventDefault(); 
        let resultados = procesarPedido();  
        if (resultados) {
            mostrarTicket(resultados);          
        }
    });
}

const btnSeguirComprando = document.querySelector("#modalCarrito .btn-secondary");

if (btnSeguirComprando) {
    btnSeguirComprando.addEventListener("click", function() {
        let rutaProductos = window.location.pathname.includes("index.html") || window.location.pathname === "/" 
            ? "./pages/productos.html" 
            : "./productos.html";
        window.location.href = rutaProductos;
    });
}

const btnPagar = document.querySelector("#modalCarrito .btn-success");

if (btnPagar) {
    btnPagar.addEventListener("click", function() {
        alert("¡Muchas gracias por tu compra en PAVI!\n\nTu pedido está siendo procesado.");
        
        // Vaciamos 
        carrito = []; 
        guardarCarritoEnStorage(); 
        
        actualizarContador(); 
        
        let modalElement = document.getElementById("modalCarrito");
        let modalObj = bootstrap.Modal.getInstance(modalElement);
        if (modalObj) {
            modalObj.hide();
        }

        console.clear();
        console.log("El carrito ha sido vaciado para un nuevo pedido.");
    });
}
actualizarContador();