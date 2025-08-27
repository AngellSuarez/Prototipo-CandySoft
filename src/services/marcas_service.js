const BASE_URL = "https://angelsuarez.pythonanywhere.com/api/insumo/marcas/";

async function listar_marcas() {
    try {
        const response = await fetch(BASE_URL, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Error al listar marcas");
        return await response.json();
    } catch (error) {
        console.error("Error al listar marcas:", error);
        throw error;
    }
}

async function crear_marca(nombre) {
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nombre
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al crear la marca")
        };
        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al crear marca:", error);
        throw error;
    }
}

async function editar_marca(id, marcaData) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(marcaData),
        });
        if (!response.ok) throw new Error("Error al editar marca");
        return await response.json();
    } catch (error) {
        console.error("Error al editar marca:", error);
        throw error;
    }
}

async function eliminar_marca(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        const result = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(result?.message || "Error al eliminar la marca");
        }

        return result;
    } catch (error) {
        console.error("Error al eliminar marca:", error);
        return { eliminado: false, message: error.message };
    }
}

async function obtener_marca(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Error al obtener marca");
        return await response.json();
    } catch (error) {
        console.error("Error al obtener marca:", error);
        throw error;
    }
}

export {
    listar_marcas,
    crear_marca,
    editar_marca,
    eliminar_marca,
    obtener_marca,
};
