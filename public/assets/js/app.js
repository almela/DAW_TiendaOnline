import { showLoginLoading, hideLoginLoading, showToast } from "./funciones.js";

let overlayDiv, userArea, carritoPanel, loginPanel, registroPanel;

const cargarLayout = async() => {
    try {
        const headerRes = await fetch("partials/header.html");
        if (!headerRes.ok) throw new Error("Error cargando header");

        document.getElementById("header").innerHTML = await headerRes.text();

        const panelesRes = await fetch("partials/paneles.html");
        if (!panelesRes.ok) throw new Error("Error cargando paneles");

        document.getElementById("paneles").innerHTML = await panelesRes.text();

        mapearDOM();
        usuarioLogado();
    } catch (error) {
        console.error("Error cargando layout:", error);
    }
}

const cargarCarrito = async() => {
    const res = await fetch("../src/api.php?ruta=carrito");
    const data = await res.json();
    actualizarBadgeCarrito(data.datos.total_articulos);
    renderCarrito(data.datos.contenido_cesta);
};

const actualizarBadgeCarrito = (cantidad) => {
    const badge = document.getElementById("cartCount");

    if (cantidad > 0) {
        badge.textContent = cantidad;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
};

export const anadirAlCarrito = async(prod, talla) => {
    const respuesta = await fetch("../src/api.php?ruta=usuario-logado");
    const data = await respuesta.json();
    if (!data.identificado) {
        showToast("Necesitas identificarte para añadir artículos al carrito", "error");
        return;
    }
    const producto = JSON.parse(prod);
    try {
        const res = await fetch("../src/api.php?ruta=agregar-carrito", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pro_id: producto.pro_id,
                pro_nombre: producto.pro_nombre,
                pro_precio: producto.pro_precio,
                pro_imagen: producto.pro_imagen,
                talla,
                cantidad: 1
            })
        });

        const data = await res.json();

        if (!data.datos.correcto) {
            showToast("Error al añadir al carrito", "error");
            return;
        }
        showToast("Producto añadido al carrito", "success");
        cargarCarrito();

    } catch (error) {
        console.error(error);
        showToast("Error de conexión", "error");
    }
};

const mapearDOM = () => {
    overlayDiv = document.getElementById("overlay");
    userArea = document.getElementById("userArea");
    carritoPanel = document.getElementById("carritoPanel");
    loginPanel = document.getElementById("loginPanel");
    registroPanel = document.getElementById("registroPanel");
};

const usuarioLogado = async() => {
    const respuesta = await fetch("../src/api.php?ruta=usuario-logado");
    const data = await respuesta.json();
    if (data.identificado) {
        renderHeaderIdentificado(data.datos.usu_nombre);
        renderLoginPanelIdentificado(data.datos);
        await cargarCarrito();
    } else {
        renderHeaderNoIdentificado();
        renderLoginPanelNoIdentificado();
    }
};

const abrirPanelLateral = (which) => {
    overlayDiv.classList.add("active");
    if (which === "carrito") {
        carritoPanel.classList.add("active");
        loginPanel.classList.remove("active");
        registroPanel.classList.remove("active");
    } else if (which === "login") {
        loginPanel.classList.add("active");
        carritoPanel.classList.remove("active");
        registroPanel.classList.remove("active");
    } else {
        loginPanel.classList.remove("active");
        carritoPanel.classList.remove("active");
        registroPanel.classList.add("active");
    }
};

const renderHeaderNoIdentificado = () => {
    userArea.innerHTML = `
    <div class="icon-btn" title="Login" id="btnAcceso">
      <i class="fa-solid fa-user"></i>
    </div>
  `;

    document.getElementById("btnAcceso").addEventListener("click", () => abrirPanelLateral("login"));
};

const renderHeaderIdentificado = (usuario) => {
    const iniciales = dameIniciales(usuario);

    userArea.innerHTML = `
    <div class="user-avatar" title="${usuario}">
      ${iniciales}
    </div>
  `;

    userArea.querySelector(".user-avatar").addEventListener("click", () => abrirPanelLateral("login"));
    document.getElementById("btnCarrito").addEventListener("click", () => abrirPanelLateral("carrito"));
    document.getElementById("closeCarrito").addEventListener("click", () => closePanels());
};

const renderLoginPanelNoIdentificado = () => {
    loginPanel.querySelector("header").innerHTML = `
    <h3><i class="fa-solid fa-user"></i> Iniciar sesión</h3>
    <div class="close" id="closeLogin" aria-label="Cerrar login">
      <i class="fa-solid fa-xmark"></i>
    </div>
  `;
    loginPanel.querySelector(".content").innerHTML = `
        <form id="loginForm">
            <div class="field">
                <label>Correo</label>
                 <div class="input">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="email" placeholder="tu@email.com" required>
                </div>
            </div>

            <div class="field">
                <label>Contraseña</label>
                <div class="input">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" placeholder="*****" required>
                </div>
            </div>

            <div class="small-links">
                <span>¿No tienes cuenta?</span>
                <a href="#" id="crearCuenta">Crear cuenta</a>
            </div>

            <button class="btn" style="width:100%;">
                <i class="fa-solid fa-right-to-bracket"></i> Entrar
            </button>
        </form>
   
  `;

    const formulario = loginPanel.querySelector("#loginForm");
    const btnCrearCuenta = loginPanel.querySelector("#crearCuenta");
    const closeLogin = loginPanel.querySelector("#closeLogin");

    closeLogin.addEventListener("click", closePanels);

    btnCrearCuenta.addEventListener("click", (e) => {
        e.preventDefault();
        closePanels();
        abrirPanelLateral("registro");
        renderRegistroPanel();
    });

    formulario.addEventListener("submit", async(e) => {
        e.preventDefault();

        const email = formulario.querySelector('input[type="email"]').value;
        const password = formulario.querySelector('input[type="password"]').value;

        await hazLogin(email, password, formulario);
    });
};

const renderLoginPanelIdentificado = (data) => {

    loginPanel.querySelector("header").innerHTML = `
        <h3>Menú</h3>
        <div class="close" id="closeLogin" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
        </div>
    `;


    let contenido = `
        <div style="text-align:center; margin-bottom:20px;">
            <i class="fa-solid fa-circle-user"
               style="font-size:52px; color:var(--blue-main);"></i>

            <h4 style="margin-top:10px;">${data.usu_nombre}</h4>
            <p style="font-size:13px; color:var(--muted);">
                ${data.usu_email}
            </p>
        </div>

        <button class="btn secondary" style="width:100%; margin-bottom:12px;" id="btnPerfil">
            <i class="fa-solid fa-user"></i>
            Panel usuario
        </button>
    `;

    if (data.usu_rol === "ADMINISTRADOR") {
        contenido += `
            <button class="btn admin" style="width:100%; margin-bottom:20px;" id="btnAdministrador">
                Panel de administración
            </button>
        `;
    }

    contenido += `
        <button class="btn" style="width:100%;" id="btnLogout">
            <i class="fa-solid fa-right-from-bracket"></i>
            Cerrar sesión
        </button>
    `;

    loginPanel.querySelector(".content").innerHTML = contenido;

    const btnLogout = loginPanel.querySelector("#btnLogout");
    const closeLogin = loginPanel.querySelector("#closeLogin");
    const btnPerfil = loginPanel.querySelector("#btnPerfil");

    btnLogout.addEventListener("click", cerrarSesion);
    closeLogin.addEventListener("click", closePanels);

    btnPerfil.addEventListener("click", () => {
        location.href = "./perfil.html";
    });

    if (data.usu_rol === "ADMINISTRADOR") {
        const btnAdministrador = loginPanel.querySelector("#btnAdministrador");
        btnAdministrador.addEventListener("click", () => {
            location.href = "./administrador.html";
        });
    }

};

const renderRegistroPanel = () => {
    registroPanel.querySelector("header").innerHTML = `
    <h3><i class="fa-solid fa-user"></i> Registrarse</h3>
    <div class="close" id="closeRegistro" aria-label="Cerrar login">
      <i class="fa-solid fa-arrow-left"></i>
    </div>
  `;
    registroPanel.querySelector(".content").innerHTML = `
        <form id="registroForm">
            <div class="field">
                <label>Correo</label>
                 <div class="input">
                    <i class="fa-solid fa-envelope"></i>
                    <input type="email" name="email" placeholder="tu@email.com" required>
                </div>
            </div>

             <div class="field">
                <label>Nombre</label>
                 <div class="input">
                    <i class="fa-solid fa-user"></i>
                    <input type="text" name="nombre" placeholder="Nombre completo" required>
                </div>
            </div>

            <div class="field">
                <label>Contraseña</label>
                <div class="input">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" name="password_1" placeholder="*****" required>
                </div>
            </div>

            <div class="field">
                <label>Repite contraseña</label>
                <div class="input">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" name="password_2" placeholder="*****" required>
                </div>
            </div>

            <button class="btn" style="width:100%;">
                <i class="fa-solid fa-user-plus"></i> Registrar
            </button>
        </form>
  `;

    document.getElementById("closeRegistro").addEventListener("click", () => {
        vuelveIdentificar();
    });
    const registroForm = document.getElementById("registroForm");
    registroForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = registroForm.email.value.trim();
        const nombre = registroForm.nombre.value.trim();
        const password1 = registroForm.password_1.value;
        const password2 = registroForm.password_2.value;

        if (password1 != password2) {
            showToast("Las contraseñas no coinciden", "error");
            return;
        }

        await registro(email, nombre, password1, registroForm);
    });
};

const renderCarrito = (carrito) => {
    const btnFinalizaCompra = document.getElementById("btnFinalizaCompra");
    const contenedor = document.getElementById("articulosCarrito");
    const totalItems = document.getElementById("totalItems");
    const totalPrice = document.getElementById("totalPrice");

    contenedor.innerHTML = "";

    const items = Object.entries(carrito);

    if (items.length === 0) {
        contenedor.innerHTML = `
      <p style="text-align:center;color:var(--muted);">
        Tu cesta está vacía
      </p>
    `;
        totalItems.textContent = "0";
        totalPrice.textContent = "0.00€";
        btnFinalizaCompra.disabled = true;
        return;
    }

    let totalArticulos = 0;
    let totalPrecio = 0;

    items.forEach(([key, item]) => {
        totalArticulos += item.cantidad;
        totalPrecio += item.cantidad * item.pro_precio;
        contenedor.innerHTML += `
      <div class="cart-item" data-key="${key}">
        <div class="cart-item-info">
          <h4>${item.pro_nombre}</h4>
          <p>Talla ${item.talla}</p>
        </div>

        <div class="cart-item-actions">
          <span class="cart-qty">x${item.cantidad}</span>
          <button class="cart-remove" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    });

    totalItems.textContent = totalArticulos;
    totalPrice.textContent = `${totalPrecio.toFixed(2).replace(".", ",")}€`;

    btnFinalizaCompra.addEventListener("click", finalizarCompra);

};

const closePanels = () => {
    overlayDiv.classList.remove("active");
    loginPanel.classList.remove("active");
    carritoPanel.classList.remove("active");
    registroPanel.classList.remove("active");
};

const vuelveIdentificar = () => {
    registroPanel.classList.remove("active");
    loginPanel.classList.add("active");
};

const cerrarSesion = async() => {
    showLoginLoading(loginPanel);
    try {
        await fetch("../src/api.php?ruta=cerrar-sesion");
        showToast(`Sesión cerrada, saliendo...`, "success");
        setTimeout(() => {
            location.reload();
        }, 1200);
    } catch (error) {
        hideLoginLoading(loginPanel);
        showToast(error.message, "error");
    }
};

const hazLogin = async(email, password, formulario) => {
    showLoginLoading(formulario);
    try {
        const respuesta = await fetch("../src/api.php?ruta=login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });
        const data = await respuesta.json();
        if (data.correcto) {
            showToast(`Acceso correcto. Bienvenid@ ${data.datos.usu_nombre}, estás siendo redireccionado...`, "success");
            setTimeout(() => {
                location.reload();
            }, 1200);
        } else {
            hideLoginLoading(formulario);
            showToast(`Error al identificarse: ${data.error}`, "error");
        }

    } catch (error) {
        hideLoginLoading(formulario);
        showToast(error.message, "error");
    }
};

const registro = async(email, nombre, password, formulario) => {
    showLoginLoading(formulario);
    try {
        const respuesta = await fetch("../src/api.php?ruta=registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                nombre,
                password,
            }),
        });
        const data = await respuesta.json();
        hideLoginLoading(formulario);
        if (data.datos.correcto) {
            showToast("Usuario creado con éxito", "success");
            vuelveIdentificar();
        } else {
            showToast(data.datos.error, "error");
        }
    } catch (error) {
        console.error(error);
        hideLoginLoading(formulario);
        showToast(error.message, "error");
    }
};

const dameIniciales = (nombre) => {
    if (!nombre) return "SN";
    const partes = nombre.trim().split(" ");
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
};

const eliminarArticuloCarrito = async(key) => {
    try {
        const res = await fetch("../src/api.php?ruta=eliminar-carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key })
        });

        await res.json();

        cargarCarrito();
        showToast("Producto eliminado", "success");

    } catch (error) {
        console.error(error);
        showToast("Error de conexión", "error");
    }
};

const finalizarCompra = async() => {
    swal.fire({
        text: `¿Quieres generar un nuevo pedido?`,
        icon: "warning",
        buttonsStyling: false,
        confirmButtonText: "Aceptar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        customClass: {
            confirmButton: "btn font-weight-bold btn-light-primary",
            cancelButton: "btn font-weight-bold btn-light-danger",
        },
    }).then(async function(result) {
        if (result.value) {
            try {
                showLoginLoading(document.getElementById("carritoPanel"));

                const res = await fetch("../src/api.php?ruta=pedido", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                const data = await res.json();
                hideLoginLoading(document.getElementById("carritoPanel"));

                if (!data.datos.correcto) {
                    showToast(data.datos.error, "error");
                    return;
                }

                showToast("¡Pedido realizado con éxito!", "success");


                renderCarrito({});
                actualizarBadgeCarrito(0);

                setTimeout(() => closePanels(), 1200);

            } catch (error) {
                console.error(error);
                hideLoginLoading(document.getElementById("carritoPanel"));
                showToast("Error finalizando la compra", "error");
            }
        }
    });
};


document.addEventListener("DOMContentLoaded", cargarLayout);

document.addEventListener("click", async(e) => {
    const btn = e.target.closest(".cart-remove");
    if (!btn) return;

    const item = btn.closest(".cart-item");
    const key = item.dataset.key;

    await eliminarArticuloCarrito(key);
});