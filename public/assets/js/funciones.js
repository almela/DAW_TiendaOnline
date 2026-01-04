//Estas funciones las definimos a parte para poder usarlas a lo largo de la web

export const showLoginLoading = (container) => {
    const overlay = document.createElement("div");
    overlay.className = "login-loading";
    overlay.innerHTML = `<div class="spinner"></div>`;
    container.appendChild(overlay);
};

export const hideLoginLoading = (container) => {
    const overlay = container.querySelector(".login-loading");
    if (overlay) overlay.remove();
};

export const showToast = async (mensaje, tipo = "success") => {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
    <i class="fa-solid ${tipo === "success" ? "fa-check-circle" : "fa-circle-xmark"}"></i>
    <span>${mensaje}</span>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};