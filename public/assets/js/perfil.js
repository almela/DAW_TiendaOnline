import { showLoginLoading, hideLoginLoading, showToast } from "./funciones.js";

document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

document.getElementById("perfilForm").addEventListener("submit", async(e) => {
    e.preventDefault();

    const form = e.target;

    const datos = {
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        telefono: form.telefono.value.trim(),
        direccion: form.direccion.value.trim(),
        cp: form.cp.value.trim(),
        poblacion: form.poblacion.value.trim(),
        provincia: form.provincia.value.trim()
    };

    try {
        showLoginLoading(form);

        const res = await fetch("../src/api.php?ruta=actualizar-usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        const data = await res.json();
        hideLoginLoading(form);

        if (!data.datos.correcto) {
            showToast(data.datos.error, "error");
            return;
        }

        showToast("Datos actualizados correctamente", "success");


    } catch (error) {
        hideLoginLoading(form);
        console.error(error);
        showToast("Error actualizando datos", "error");
    }
});

document.getElementById("passwordForm").addEventListener("submit", async(e) => {
    e.preventDefault();

    const form = e.target;

    const actual = form.password_actual.value;
    const nueva = form.password_nueva.value;
    const repetir = form.password_repetir.value;

    if (nueva.length < 8) {
        showToast("La nueva contraseña debe tener al menos 8 caracteres", "error");
        return;
    }

    if (nueva !== repetir) {
        showToast("Las contraseñas no coinciden", "error");
        return;
    }

    try {
        showLoginLoading(form);

        const res = await fetch("../src/api.php?ruta=cambiar-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password_actual: actual,
                password_nueva: nueva
            })
        });

        const data = await res.json();
        hideLoginLoading(form);

        if (!data.datos.correcto) {
            showToast(`No se pudo cambiar la contraseña: ${data.datos.error}`, "error");
            return;
        }

        showToast("Contraseña actualizada correctamente, a continuación se cerrará la sesión...", "success");
        await fetch("../src/api.php?ruta=cerrar-sesion");
        setTimeout(() => {
            location.reload();
        }, 1200);

    } catch (error) {
        hideLoginLoading(form);
        console.error(error);
        showToast("Error de conexión", "error");
    }
});

document.getElementById("buscarPedidos").addEventListener("click", () => {
    const desde = document.getElementById("fechaDesde").value;
    const hasta = document.getElementById("fechaHasta").value;

    if (!desde || !hasta) {
        showToast("Selecciona ambas fechas", "error");
        return;
    }

    cargarPedidos(desde, hasta);
});


const cargarDatosUsuario = async() => {
    const form = document.getElementById("perfilForm");
    showLoginLoading(form);
    try {
        const res = await fetch("../src/api.php?ruta=datos-usuario");
        const data = await res.json();
        //console.log(data);

        if (!data.datos.correcto) {
            showToast("Error cargando los datos del usuario", "error");
            hideLoginLoading(form);
            return;
        }

        const u = data.datos.usuario;

        form.nombre.value = u.usu_nombre || "";
        form.email.value = u.usu_email || "";
        form.telefono.value = u.usu_telefono || "";
        form.direccion.value = u.usu_direccion || "";
        form.cp.value = u.usu_codpostal || "";
        form.poblacion.value = u.usu_poblacion || "";
        form.provincia.value = u.usu_provincia || "";


        hideLoginLoading(form);

    } catch (error) {
        console.error(error);
        showToast("Error cargando datos del usuario", "error");
        hideLoginLoading(form);
    }
}

const usuarioLogado = async() => {
    const respuesta = await fetch("../src/api.php?ruta=usuario-logado");
    const data = await respuesta.json();
    if (data.identificado) {
        cargarDatosUsuario();
        inicializarFechasPedidos();

    } else {
        location.href = './index.html';
    }
};

const formatearFecha = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
};

const inicializarFechasPedidos = () => {
    const hoy = new Date();
    const hace10Dias = new Date();
    hace10Dias.setDate(hoy.getDate() - 10);

    const desdeInput = document.getElementById("fechaDesde");
    const hastaInput = document.getElementById("fechaHasta");

    desdeInput.value = formatearFecha(hace10Dias);
    hastaInput.value = formatearFecha(hoy);

    cargarPedidos(desdeInput.value, hastaInput.value);
};

const cargarPedidos = async(desde, hasta) => {
    try {
        const res = await fetch("../src/api.php?ruta=consulta-pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                desde,
                hasta
            }),
        });

        const data = await res.json();

        if (!data.datos.correcto) {
            showToast("Error cargando pedidos", "error");
            return;
        }

        pintarPedidos(data.datos.pedidos);

    } catch (error) {
        console.error(error);
        showToast("Error cargando pedidos", "error");
    }
};

const pintarPedidos = (pedidos) => {
        const tbody = document.getElementById("tablaPedidos");
        tbody.innerHTML = "";

        if (pedidos.length === 0) {
            tbody.innerHTML = `
                            <tr>
                                <td colspan="4" style="text-align:center;color:var(--muted);">
                                No hay pedidos en ese rango
                                </td>
                            </tr>
                            `;
            return;
        }

        pedidos.forEach(p => {
                    let totalPedido = 0;
                    p.lineas_pedido.forEach(pr => {
                        totalPedido += pr.pel_precio * pr.pel_unidades;
                    });
                    tbody.innerHTML += `
                                <tr>
                                    <td>#${p.ped_id}</td>
                                    <td>${new Date(p.ped_fecha).toLocaleDateString("es-ES")}</td>
                                    <td>
                                    ${p.lineas_pedido.map(pr => `
                                         <div class="pedido-producto">
                                        <img src="../src/uploads/${pr.pro_imagen}" alt="${pr.pro_nombre}">
                                        <div class="pedido-producto-info">
                                            <div class="pedido-producto-nombre">${pr.pro_marca} - ${pr.pro_nombre}</div>
                                            <div class="pedido-producto-meta">
                                            <span>${pr.pro_tipo} ${pr.pro_color} - Talla ${pr.pel_talla}</span>
                                            <span>${pr.pel_unidades}uds.</span>
                                            </div>
                                        </div>
                                        </div>
                                    `).join("")}
                                    </td>
                                    <td> ${totalPedido.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} €</td>
                                </tr>
    `;
  });
};

document.querySelectorAll(".pill").forEach(pill => {
  const input = pill.querySelector('input[type="date"]');
  if (!input) return;

  pill.addEventListener("click", () => input.showPicker?.());
});

document.addEventListener("DOMContentLoaded", () => {
    usuarioLogado();
});