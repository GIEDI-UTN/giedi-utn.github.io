// Authentication utilities for the Venturi simulator
export function promptForAdminPassword() {
    const password = prompt("Ingrese la clave de administrador:", "");
    return password === "GIEDI610";
}

