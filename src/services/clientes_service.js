const BASE_URL = "https://angelsuarez.pythonanywhere.com/api/usuario/clientes/";

function getAuthHeaders(method = "GET") {
    const headers = { "Content-Type": "application/json" };
    if (method !== "GET") {
        const token = localStorage.getItem("access_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return headers;
}

async function listar_clientes() {
    try {
        const response = await fetch(BASE_URL, {
            method: "GET",
            headers: getAuthHeaders("GET"),
        });
        if (!response.ok) throw new Error("Error al listar clientes");
        return await response.json();
    } catch (error) {
        console.error("Error al listar clientes:", error);
        throw error;
    }
}

async function crear_cliente(username, nombre, apellido, correo, celular, tipo_documento, numero_documento) {
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: getAuthHeaders("POST"),
            body: JSON.stringify({
                username,
                nombre,
                apellido,
                correo,
                celular,
                tipo_documento,
                numero_documento
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return { errores: data };
        }

        return data;

    } catch (error) {
        console.error("Error al crear cliente:", error);
        throw error;
    }
}

async function editar_cliente(id, clienteData) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "PUT",
            headers: getAuthHeaders("PUT"),
            body: JSON.stringify(clienteData),
        });

        const data = await response.json();

        if (!response.ok) {
            return { errores: data };
        }

        return data;
    } catch (error) {
        console.error("Error al editar cliente:", error);
        throw error;
    }
}

async function eliminar_cliente(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "DELETE",
            headers: getAuthHeaders("DELETE"),
        });

        const contentType = response.headers.get("content-type");
        const hasJson = contentType && contentType.includes("application/json");

        let data = null;
        if (hasJson) {
            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn("Respuesta sin JSON válido:", jsonError);
                data = null;
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || `Error ${response.status}: al eliminar el cliente`);
        }

        return data;
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        throw error;
    }
}

async function cambiar_estado_cliente(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/cambiar_estado/`, {
            method: "PATCH",
            headers: getAuthHeaders("PATCH"),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al cambiar el estado del cliente");
        }
        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al cambiar estado del cliente:", error);
        throw error;
    }
}

async function obtener_cliente(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "GET",
            headers: getAuthHeaders("GET"),
        });
        if (!response.ok) throw new Error("Error al obtener cliente");
        return await response.json();
    } catch (error) {
        console.error("Error al obtener cliente:", error);
        throw error;
    }
}

export {
    listar_clientes,
    crear_cliente,
    editar_cliente,
    eliminar_cliente,
    cambiar_estado_cliente,
    obtener_cliente,
};
