import { showLoginLoading, hideLoginLoading, showToast } from "./funciones.js";
import { anadirAlCarrito } from "./app.js";

let productosOriginales = [];

const cargarNovedades = async() => {
    const grid = document.getElementById("novedadesGrid");
    grid.innerHTML = "";
    showLoginLoading(grid);
    try {
        const res = await fetch("../src/api.php?ruta=novedades");
        const data = await res.json();

        if (!data.datos.correcto) {
            showToast("Error cargando productos", "error");
            hideLoginLoading(grid);
            return;
        }

        data.datos.productos.forEach((p) => {
            grid.insertAdjacentHTML("beforeend", crearCardProducto(p));
        });
        hideLoginLoading(grid);

    } catch (error) {
        console.error(error);
        showToast("Error de conexión", "error");
        hideLoginLoading(grid);
    }
};

const cargarArticulos = async() => {
    const grid = document.getElementById("productosGrid");
    grid.innerHTML = "";
    showLoginLoading(grid);
    try {
        const res = await fetch("../src/api.php?ruta=productos");
        const data = await res.json();

        if (!data.datos.correcto) {
            showToast("Error cargando productos", "error");
            hideLoginLoading(grid);
            return;
        }

        productosOriginales = data.datos.productos;

        pintarProductos(productosOriginales);

        hideLoginLoading(grid);

    } catch (error) {
        console.error(error);
        showToast("Error cargando productos", "error");
        hideLoginLoading(grid);
    }
};

const pintarProductos = (productos) => {
    const grid = document.getElementById("productosGrid");
    grid.innerHTML = "";

    const total = productosOriginales.length;
    const mostrados = productos.length;

    if (mostrados === 0) {
        grid.innerHTML = `
      <p style="color:var(--muted); text-align:center;">
        No hay productos con esos filtros
      </p>
    `;
    } else {
        productos.forEach(p => {
            grid.insertAdjacentHTML("beforeend", crearCardProducto(p));
        });
    }

    actualizarResultsHint(mostrados, total);
};

const aplicarFiltros = () => {
    const marca = document.getElementById("filtroMarca").value;
    const color = document.getElementById("filtroColor").value;
    const talla = document.getElementById("filtroTalla").value;

    let filtrados = [...productosOriginales];

    if (marca) {
        filtrados = filtrados.filter(p => p.pro_marca === marca);
    }

    if (color) {
        filtrados = filtrados.filter(p => p.pro_color === color);
    }

    if (talla) {
        filtrados = filtrados.filter(p =>
            p.tallas.some(t => t.tall_talla === talla)
        );
    }

    pintarProductos(filtrados);
};

const cargarFiltros = async() => {

    try {
        const res = await fetch("../src/api.php?ruta=filtros");
        const data = await res.json();
        if (!data.datos.correcto) return;

        const { marcas, colores, tallas } = data.datos.datos;

        const filtroMarca = document.getElementById("filtroMarca");
        const filtroColor = document.getElementById("filtroColor");
        const filtroTalla = document.getElementById("filtroTalla");

        marcas.forEach(m => {
            filtroMarca.innerHTML += `<option value="${m.pro_marca}">${m.pro_marca}</option>`;
        });

        colores.forEach(c => {
            filtroColor.innerHTML += `<option value="${c.pro_color}">${c.pro_color}</option>`;
        });

        tallas.forEach(t => {
            filtroTalla.innerHTML += `<option value="${t.tall_talla}">${t.tall_talla}</option>`;
        });

    } catch (error) {
        console.error(error);
        showToast("Error cargando filtros", "error");
    }
};

const actualizarResultsHint = (mostrados, total) => {
    const hint = document.getElementById("resultsHint");

    hint.textContent = `Mostrando ${mostrados} de ${total}`;
};

const crearCardProducto = (p) => {
    const imagen = `../src/uploads/${p.pro_imagen}`;

    let opcionesTallas = `<option value="">Selecciona talla</option>`;

    p.tallas.forEach(t => {
        opcionesTallas += `
      <option value="${t.tall_talla}" ${t.tall_estoc == 0 ? "disabled" : ""}>
        ${t.tall_talla} (${t.tall_estoc > 0 ? t.tall_estoc + " uds" : "Sin stock"})
      </option>
    `;
    });

    return `
    <article class="card" data-id='${JSON.stringify(p)}'>
      <div class="img-wrap" onclick="abrirLightbox('${imagen}')">
        <img src="${imagen}" alt="${p.pro_nombre}" >
      </div>

      <div class="info">
        <h4>${p.pro_nombre}</h4>

        <div class="meta">
          <span class="tag">
            <i class="fa-solid fa-tag"></i> ${p.pro_marca}
          </span>
          <span class="tag">
            <i class="fa-solid fa-droplet"></i> ${p.pro_color}
          </span>
        </div>

        <div class="price">€${p.pro_precio}</div>

        <div class="card-actions">
          <select class="size-select">
            ${opcionesTallas}
          </select>

          <button class="btn-cart" type="button" disabled>
            <i class="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `;

}

const abrirLightbox = (src) => {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<img src="${src}">`;
    lb.onclick = () => lb.remove();
    document.body.appendChild(lb);
};

document.addEventListener("change", (e) => {
    if (!e.target.classList.contains("size-select")) return;

    const select = e.target;
    const card = select.closest(".card");
    const btnCart = card.querySelector(".btn-cart");

    if (select.value === "") {
        btnCart.disabled = true;
        btnCart.classList.remove("active");
        return;
    }

    btnCart.disabled = false;
    btnCart.classList.add("active");
});

document.addEventListener("click", async(e) => {
    const btn = e.target.closest(".btn-cart");
    if (!btn) return;

    const card = btn.closest(".card");
    const productoId = card.dataset.id;
    const talla = card.querySelector(".size-select").value;

    if (!talla) return;

    await anadirAlCarrito(productoId, talla);
});

document.getElementById("filtroMarca").addEventListener("change", aplicarFiltros);

document.getElementById("filtroColor").addEventListener("change", aplicarFiltros);

document.getElementById("filtroTalla").addEventListener("change", aplicarFiltros);

document.getElementById("limpiarFiltros").addEventListener("click", () => {
    document.getElementById("filtroMarca").value = "";
    document.getElementById("filtroColor").value = "";
    document.getElementById("filtroTalla").value = "";

    pintarProductos(productosOriginales);
});

document.addEventListener("DOMContentLoaded", () => {
    cargarNovedades();
    cargarArticulos();
    cargarFiltros();
});


window.abrirLightbox = abrirLightbox;