const pedirProductos = async (ruta) => {
    try {
        const respuesta = await fetch(ruta);
        if (!respuesta.ok) {
            throw new Error("No se pudo acceder a la base de datos");
        }
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Tuvimos un problema cargando los productos. Por favor, intenta de nuevo más tarde.',
            confirmButtonColor: '#333'
        });
        return []; 
    } finally {
        const loader = document.getElementById("loader-productos");
        if (loader) {
            loader.style.display = "none";
        }
    }
};

