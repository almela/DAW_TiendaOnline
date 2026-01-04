import { showLoginLoading, hideLoginLoading, showToast } from "./funciones.js";

const adminModalOverlay = document.getElementById("adminModalOverlay");
const adminModalTitulo = document.getElementById("adminModalTitle");
const adminModalContenido = document.getElementById("adminModalContent");

const abrirAdminModal = (titulo, contenidoHTML) => {
    adminModalTitulo.textContent = titulo;
    adminModalContenido.innerHTML = contenidoHTML;
    adminModalOverlay.classList.add("active");
};

const cerrarAdminModal = () => {
    adminModalOverlay.classList.remove("active");
    adminModalContenido.innerHTML = "";
};

const esAdmin = async() => {
    try {
        const respuesta = await fetch("../src/api.php?ruta=usuario-logado");
        const data = await respuesta.json();
        if (!data.identificado || data.datos.usu_rol != "ADMINISTRADOR") {
            location.href = "./";
        } else {
            getUsuarios();
            cargarProductos();
        }
    } catch (error) {
        console.error("Error validando sesión", error);
        location.href = "./";
    }
};

const modalEditarUsuario = (usuario) => {
    abrirAdminModal(
        "Editar usuario",
        `
    <form id="formEditarUsuario">

      <div class="field">
        <label>Nombre</label>
        <div class="input">
          <i class="fa-solid fa-user"></i>
          <input type="text" name="nombre" value="${usuario.usu_nombre}" autocomplete="off" required>
        </div>
      </div>

      <div class="field">
        <label>Email</label>
        <div class="input">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" name="email" value="${usuario.usu_email}"  autocomplete="off" required>
        </div>
      </div>

      <div class="field">
        <label>Rol</label>
        <div class="input">
          <i class="fa-solid fa-user-shield"></i>
          <select name="rol">
            <option value="CLIENTE" ${usuario.usu_rol === "CLIENTE" ? "selected" : ""}>Cliente</option>
            <option value="ADMINISTRADOR" ${usuario.usu_rol === "ADMINISTRADOR" ? "selected" : ""}>Administrador</option>
          </select>
        </div>
      </div>
        <input type="hidden" id="usu_id" name="usu_id" value="${usuario.usu_id}" >
      <button class="btn" style="width:100%;">
        <i class="fa-solid fa-user-edit"></i>
        Editar usuario
      </button>

    </form>
  `
    );

    const editarUsuarioForm = document.getElementById("formEditarUsuario");
    editarUsuarioForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = editarUsuarioForm.email.value.trim();
        const nombre = editarUsuarioForm.nombre.value.trim();
        const rol = editarUsuarioForm.rol.value;
        const usu_id = editarUsuarioForm.usu_id.value;

        await editarUsuario(email, nombre, rol, usu_id, editarUsuarioForm);
    });
};

const modalCrearUsuario = () => {
    abrirAdminModal(
        "Nuevo usuario",
        `
    <form id="formUsuario">

      <div class="field">
        <label>Nombre</label>
        <div class="input">
          <i class="fa-solid fa-user"></i>
          <input type="text" name="nombre" placeholder="Nombre completo" autocomplete="off" required>
        </div>
      </div>

      <div class="field">
        <label>Email</label>
        <div class="input">
          <i class="fa-solid fa-envelope"></i>
          <input type="email" name="email" placeholder="tu@email.com" autocomplete="off" required>
        </div>
      </div>

      <div class="field">
        <label>Rol</label>
        <div class="input">
          <i class="fa-solid fa-user-shield"></i>
          <select name="rol">
            <option value="CLIENTE">Cliente</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Contraseña</label>
        <div class="input">
          <i class="fa-solid fa-lock"></i>
          <input type="password" name="password" placeholder="****" autocomplete="off" required>
        </div>
      </div>

      <button class="btn" style="width:100%;">
        <i class="fa-solid fa-user-plus"></i>
        Crear usuario
      </button>

    </form>
  `
    );

    const nuevoUsuarioForm = document.getElementById("formUsuario");
    nuevoUsuarioForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = nuevoUsuarioForm.email.value.trim();
        const nombre = nuevoUsuarioForm.nombre.value.trim();
        const rol = nuevoUsuarioForm.rol.value;
        const password = nuevoUsuarioForm.password.value;

        await nuevoUsuario(email, nombre, rol, password, nuevoUsuarioForm);
    });
};

const modalEditarProducto = (producto) => {
    abrirAdminModal(
        "Editar producto",
        `
    <form id="formEditarProducto" enctype="multipart/form-data">

      <div class="field">
        <label>Nombre</label>
        <div class="input">
          <i class="fa-solid fa-box"></i>
          <input type="text" name="pro_nombre" value="${producto.pro_nombre}" required>
        </div>
      </div>

      <div class="field">
        <label>Marca</label>
        <div class="input">
          <i class="fa-solid fa-tag"></i>
          <input type="text" name="pro_marca" value="${producto.pro_marca}"  required>
        </div>
      </div>

      <div class="field">
        <label>Tipo</label>
        <div class="input">
          <i class="fa-solid fa-shapes"></i>
          <input type="text" name="pro_tipo" value="${producto.pro_tipo}"  required>
        </div>
      </div>

      <div class="field">
        <label>Color</label>
        <div class="input">
          <i class="fa-solid fa-palette"></i>
          <input type="text" name="pro_color" value="${producto.pro_color}"  required>
        </div>
      </div>

      <div class="field">
        <label>Precio (€)</label>
        <div class="input">
          <i class="fa-solid fa-euro-sign"></i>
          <input type="number" step="0.01" name="pro_precio" value="${producto.pro_precio}"  required>
        </div>
      </div>

      <div class="field">
        <label>Imagen principal *Si no se selecciona ninguna nueva, no se modificará</label>
        <input type="file" id="proImagen" name="pro_imagen" accept="image/*">
      </div>

      <div id="previewImagen" class="product-images-preview"></div>
      <input type="hidden" id="pro_id" name="pro_id" value="${producto.pro_id}">
      <input type="hidden" id="pro_imagen_anterior" name="pro_imagen_anterior" value="${producto.pro_imagen}">

      <button class="btn" style="width:100%; margin-top:15px;">
        <i class="fa-solid fa-plus"></i> Modificar producto
      </button>

    </form>
  `
    );

    initImagenProducto();

    document.getElementById("formEditarProducto").addEventListener("submit", async(e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        try {
            showLoginLoading(form);
            const res = await fetch("../src/api.php?ruta=editar-producto", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            hideLoginLoading(form);

            if (data.datos.correcto) {
                showToast("Producto modificado correctamente", "success");
                cerrarAdminModal();
                cargarProductos();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            hideLoginLoading(form);
            showToast("Error de conexión", "error");
        }
    });
};

const modalCrearProducto = () => {
    abrirAdminModal(
        "Nuevo producto",
        `
    <form id="formProducto" enctype="multipart/form-data">

      <div class="field">
        <label>Nombre</label>
        <div class="input">
          <i class="fa-solid fa-box"></i>
          <input type="text" name="pro_nombre" required>
        </div>
      </div>

      <div class="field">
        <label>Marca</label>
        <div class="input">
          <i class="fa-solid fa-tag"></i>
          <input type="text" name="pro_marca" required>
        </div>
      </div>

      <div class="field">
        <label>Tipo</label>
        <div class="input">
          <i class="fa-solid fa-shapes"></i>
          <input type="text" name="pro_tipo" required>
        </div>
      </div>

      <div class="field">
        <label>Color</label>
        <div class="input">
          <i class="fa-solid fa-palette"></i>
          <input type="text" name="pro_color" required>
        </div>
      </div>

      <div class="field">
        <label>Precio (€)</label>
        <div class="input">
          <i class="fa-solid fa-euro-sign"></i>
          <input type="number" step="0.01" name="pro_precio" required>
        </div>
      </div>

      <div class="field">
        <label>Imagen principal</label>
        <input type="file" id="proImagen" name="pro_imagen" accept="image/*" required>
      </div>

      <div id="previewImagen" class="product-images-preview"></div>


      <button class="btn" style="width:100%; margin-top:15px;">
        <i class="fa-solid fa-plus"></i> Crear producto
      </button>

    </form>
  `
    );

    initImagenProducto();

    document.getElementById("formProducto").addEventListener("submit", async(e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        try {
            showLoginLoading(form);
            const res = await fetch("../src/api.php?ruta=nuevo-producto", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            hideLoginLoading(form);

            if (data.datos.correcto) {
                showToast("Producto creado correctamente", "success");
                cerrarAdminModal();
                cargarProductos();
            } else {
                showToast(data.error, "error");
            }
        } catch {
            hideLoginLoading(form);
            showToast("Error de conexión", "error");
        }
    });
};

const tallasProducto = (producto) => {
    abrirAdminModal("Tallas y stock", `
    <div class="admin-tallas">

      <form id="formTalla">
        <h4 id="tituloFormTalla">Añadir talla</h4>
        <div class="form-row">
            <div class="field">
              <label>Talla</label>
              <div class="input">
                <i class="fa-solid fa-shoe-prints"></i>
                <input type="number" name="tall_talla" required>
              </div>
            </div>

            <div class="field">
              <label>Stock</label>
              <div class="input">
                <i class="fa-solid fa-layer-group"></i>
                <input type="number" name="tall_estoc" min="0" required>
              </div>
            </div>
          </div>
          <input type="hidden" id="tall_pro_id" name="tall_pro_id" value="${producto.pro_id}">
          <input type="hidden" id="tall_id" name="tall_id" value=0>
          <button class="btn" style="width:100%;">
            <i class="fa-solid fa-floppy-disk"></i>
            Guardar
          </button>
      </form>

      <hr style="margin-top:20px;">

       <table class="admin-table">
        <thead>
          <tr>
            <th>Talla</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tablaTallas">
          
        </tbody>
      </table>

    </div>
  `);

    const tbody = document.getElementById("tablaTallas");
    tbody.innerHTML = "";

    if (producto.tallas.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; color:var(--muted);">
          No hay tallas añadidas
        </td>
      </tr>
    `;
    }

    producto.tallas.forEach((t) => {
        tbody.innerHTML += `
      <tr id="talla-${t.tall_id}">
        <td>${t.tall_talla}</td>
        <td>${t.tall_estoc}</td>
        <td class="admin-actions">
          <button class="edit" onclick='editarTalla(${JSON.stringify(t)})'>
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="delete" onclick='eliminarTalla(${JSON.stringify(t)})'>
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    });

    const formTalla = document.getElementById("formTalla");
    formTalla.addEventListener("submit", async(e) => {
        e.preventDefault();

        showLoginLoading(formTalla);
        try {
            const tall_talla = formTalla.tall_talla.value;
            const tall_estoc = formTalla.tall_estoc.value;
            const tall_pro_id = formTalla.tall_pro_id.value;
            const tall_id = formTalla.tall_id.value;
            if (tall_id > 0) {
                //Editamos
                const respuesta = await fetch("../src/api.php?ruta=editar-talla", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tall_id,
                        tall_talla,
                        tall_estoc,
                    }),
                });

                const data = await respuesta.json();
                hideLoginLoading(formTalla);

                if (data.datos.correcto) {
                    showToast("Talla actualizada", "success");

                    // Actualizar fila en la tabla
                    const row = document.getElementById(formTalla.dataset.rowId);
                    row.children[0].innerText = tall_talla;
                    row.children[1].innerText = tall_estoc;

                    formTalla.reset();
                    formTalla.tall_id.value = 0;
                    document.getElementById("tituloFormTalla").innerText = "Añadir talla";

                    cargarProductos();
                } else {
                    showToast(data.datos.error, "error");
                }
            } else {
                //añadimos
                const respuesta = await fetch("../src/api.php?ruta=nueva-talla", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tall_talla,
                        tall_pro_id,
                        tall_estoc,
                    }),
                });
                const data = await respuesta.json();
                hideLoginLoading(formTalla);
                if (data.datos.correcto) {
                    showToast("Talla añadida con éxito", "success");
                    formTalla.tall_talla.value = "";
                    formTalla.tall_estoc.value = "";
                    tbody.innerHTML += `
                      <tr>
                        <td>${tall_talla}</td>
                        <td>${tall_estoc}</td>
                        <td class="admin-actions">
                          <button class="edit" onclick='editarTalla(${JSON.stringify(data.datos.datos)})'>
                            <i class="fa-solid fa-pen"></i>
                          </button>
                          <button class="delete" onclick='eliminarTalla(${JSON.stringify(data.datos.datos)})'>
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    `;
                    cargarProductos();
                } else {
                    showToast(data.datos.error, "error");
                }
            }
        } catch (error) {
            console.error(error);
            hideLoginLoading(formTalla);
            showToast(error.message, "error");
        }
    });
}

const editarTalla = (t) => {
    const formTalla = document.getElementById("formTalla");

    document.getElementById("tituloFormTalla").innerText = "Editar talla";

    formTalla.tall_talla.value = t.tall_talla;
    formTalla.tall_estoc.value = t.tall_estoc;
    formTalla.tall_id.value = t.tall_id;

    // Guardamos el id de la fila para actualizarla luego
    formTalla.dataset.rowId = `talla-${t.tall_id}`;
};

const eliminarTalla = async(t) => {

    swal.fire({
        text: `¿Estas seguro de eliminar esta talla?`,
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
                const respuesta = await fetch("../src/api.php?ruta=borrar-talla", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        tall_id: t.tall_id,
                    }),
                });

                const data = await respuesta.json();

                if (data.datos.correcto) {
                    showToast("Talla eliminada", "success");

                    // Eliminar fila de la tabla
                    const row = document.getElementById(`talla-${t.tall_id}`);
                    if (row) row.remove();

                    cargarProductos();
                } else {
                    showToast(data.datos.error, "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Error al eliminar la talla", "error");
            }
        }
    });

};

const abrirLightbox = (src) => {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<img src="${src}">`;
    lb.onclick = () => lb.remove();
    document.body.appendChild(lb);
};

const initImagenProducto = () => {
    const input = document.getElementById("proImagen");
    const preview = document.getElementById("previewImagen");

    input.addEventListener("change", () => {
        preview.innerHTML = "";
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.onclick = () => abrirLightbox(img.src);
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
};

const borrarProducto = (pro_id) => {
    swal.fire({
        text: `¿Estas seguro de borrar el producto?`,
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
            await fetch("../src/api.php?ruta=borrar-producto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pro_id,
                }),
            });
            cargarProductos();
        }
    });
};

const borrarUsuario = (usu_id) => {
    swal.fire({
        text: `¿Estas seguro de borrar al usuario?`,
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
            await fetch("../src/api.php?ruta=borrar-usuario", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usu_id,
                }),
            });
            getUsuarios();
        }
    });
};

const cargarProductos = async() => {
    try {
        const respuesta = await fetch("../src/api.php?ruta=productos");
        const data = await respuesta.json();
        const tbody = document.getElementById("productosTabla");
        tbody.innerHTML = "";

        if (data.datos.correcto) {
            const { productos } = data.datos;
            productos.forEach((p) => {
                tbody.innerHTML += `
          <tr>
            <td>${p.pro_id}</td>
            <td>
                <div class="admin-product">
                    <img src="../src/uploads/${p.pro_imagen}"  alt="${p.pro_nombre}"  onclick="abrirLightbox('../src/uploads/${p.pro_imagen}')">
                    <span>${p.pro_marca} - ${p.pro_nombre}</span>
                </div>
                </td>
            <td>${p.pro_tipo}</td>
            <td>${p.pro_color}</td>
            <td>${p.pro_precio}€</td>
            <td class="admin-actions">
              <button class="action-btn edit" onclick='modalEditarProducto(${JSON.stringify(p)})'><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn delete" onclick='borrarProducto(${p.pro_id})'><i class="fa-solid fa-trash"></i></button>
              <button class="action-btn sizes" onclick='tallasProducto(${JSON.stringify(p)})'>TALLAS</button>
            </td>
          </tr>
        `;
                console.log(p.tallas);
            });
        } else {
            showToast(`Error obteniendo los productos: ${data.datos.error}`, "error");
        }
    } catch (error) {
        console.error("Error obteniendo productos", error);
    }
};

const getUsuarios = async() => {
    try {
        const respuesta = await fetch("../src/api.php?ruta=usuarios");
        const data = await respuesta.json();
        const tbody = document.getElementById("usuariosTabla");
        tbody.innerHTML = "";

        if (data.datos.correcto) {
            const { usuarios } = data.datos;
            usuarios.forEach((u) => {
                tbody.innerHTML += `
          <tr>
            <td>${u.usu_id}</td>
            <td>${u.usu_nombre}</td>
            <td>${u.usu_email}</td>
            <td>${u.usu_rol}</td>
            <td class="admin-actions">
              <button class="edit" onclick='modalEditarUsuario(${JSON.stringify(u)})'><i class="fa-solid fa-pen"></i></button>
              <button class="delete" onclick='borrarUsuario(${u.usu_id})'><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        `;
            });
        } else {
            showToast(`Error obteniendo los usuarios: ${data.datos.error}`, "error");
        }
    } catch (error) {
        console.error("Error obteniendo usuarios", error);
    }
};

const editarUsuario = async(email, nombre, rol, usu_id, formulario) => {
    showLoginLoading(formulario);
    try {
        const respuesta = await fetch("../src/api.php?ruta=editar-usuario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                nombre,
                usu_id,
                rol,
            }),
        });
        const data = await respuesta.json();
        hideLoginLoading(formulario);
        if (data.datos.correcto) {
            showToast("Usuario modificado con éxito", "success");
            formulario.email.value = "";
            formulario.nombre.value = "";
            formulario.rol.value = "CLIENTE";
            formulario.usu_id.value = "";
            cerrarAdminModal();
            getUsuarios();
        } else {
            showToast(data.datos.error, "error");
        }
        console.log(data);
    } catch (error) {
        console.error(error);
        hideLoginLoading(formulario);
        showToast(error.message, "error");
    }
};

const nuevoUsuario = async(email, nombre, rol, password, formulario) => {
    showLoginLoading(formulario);
    try {
        const respuesta = await fetch("../src/api.php?ruta=nuevo-usuario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                nombre,
                password,
                rol,
            }),
        });
        const data = await respuesta.json();
        hideLoginLoading(formulario);
        if (data.datos.correcto) {
            showToast("Usuario creado con éxito", "success");
            formulario.email.value = "";
            formulario.nombre.value = "";
            formulario.rol.value = "CLIENTE";
            formulario.password.value = "";
            cerrarAdminModal();
            getUsuarios();
        } else {
            showToast(data.datos.error, "error");
        }
        console.log(data);
    } catch (error) {
        console.error(error);
        hideLoginLoading(formulario);
        showToast(error.message, "error");
    }
};

document.getElementById("btnNuevoUsuario").addEventListener("click", modalCrearUsuario);

document.getElementById("btnNuevoProducto").addEventListener("click", modalCrearProducto);

document.getElementById("btnCerrarModal").addEventListener("click", cerrarAdminModal);

document.querySelectorAll(".admin-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

esAdmin();

window.modalEditarUsuario = modalEditarUsuario;
window.modalEditarProducto = modalEditarProducto;
window.tallasProducto = tallasProducto;
window.borrarUsuario = borrarUsuario;
window.borrarProducto = borrarProducto;
window.abrirLightbox = abrirLightbox;
window.editarTalla = editarTalla;
window.eliminarTalla = eliminarTalla;