const API_URL = "https://angelsuarez.pythonanywhere.com/api/insumo/insumos/";
const API_MARCAS = "https://angelsuarez.pythonanywhere.com/api/insumo/marcas/";

const token = localStorage.getItem('access_token');

export const listar_insumos = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error al listar insumos");
        return await response.json();
    } catch (error) {
        console.error("Error en listar_insumos:", error);
        return [];
    }
};

export const listar_marcas = async () => {
    try {
        const response = await fetch(API_MARCAS);
        if (!response.ok) throw new Error("Error al listar marcas");
        return await response.json();
    } catch (error) {
        console.error("Error en listar_marcas:", error);
        return [];
    }
};

export const obtener_insumo = async (id) => {
    try {
        const response = await fetch(`${API_URL}${id}/`);
        if (!response.ok) throw new Error("Error al obtener insumo");
        return await response.json();
    } catch (error) {
        console.error("Error en obtener_insumo:", error);
        return null;
    }
};

export const crear_insumo = async (insumo) => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ['Authorization']: `Bearer ${token}`
            },
            body: JSON.stringify(insumo),
        });
        return await response.json();
    } catch (error) {
        console.error("Error en crear_insumo:", error);
        return { errores: true };
    }
};

export const actualizar_insumo = async (id, insumo) => {
    try {
        const response = await fetch(`${API_URL}${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ['Authorization']: `Bearer ${token}`
            },
            body: JSON.stringify(insumo),
        });
        return await response.json();
    } catch (error) {
        console.error("Error en actualizar_insumo:", error);
        return { errores: true };
    }
};

export const eliminar_insumo = async (id) => {
    try {
        const response = await fetch(`${API_URL}${id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ['Authorization']: `Bearer ${token}`
            }
        });

        if (response.ok) {
            try {
                const data = await response.json();
                return { eliminado: data.eliminado === true };
            } catch {
                return { eliminado: true };
            }
        } else {
            const data = await response.json();
            return { eliminado: false, message: data.message || "No se pudo eliminar" };
        }
    } catch (error) {
        console.error("Error en eliminar_insumo:", error);
        return { eliminado: false, message: "Error al eliminar insumo" };
    }
};