const API_COMPRAS = "https://angelsuarez.pythonanywhere.com/api/compras/compras/";
const API_INSUMOS = "https://angelsuarez.pythonanywhere.com/api/insumo/insumos/";
const API_PROVEEDORES = "https://angelsuarez.pythonanywhere.com/api/proveedor/proveedores/";

function getAuthHeaders(method = 'GET') {
    const headers = { 'Content-Type': 'application/json' };
    if (method !== 'GET') {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return headers;
}

export const listar_compras = async (params = "") => {
    try {
        const response = await fetch(`${API_COMPRAS}?${params}`, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al listar compras");
        return await response.json();
    } catch (error) {
        console.error("Error en listar_compras:", error);
        return [];
    }
};

export const crear_compra = async (compra) => {
    try {
        const response = await fetch(API_COMPRAS, {
            method: "POST",
            headers: getAuthHeaders('POST'),
            body: JSON.stringify(compra),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        return await response.json();
    } catch (error) {
        console.error("Error en crear_compra:", error);
        return { error: true, message: error.message };
    }
};

export const cambiar_estado_compra = async (idCompra, estado_id, observacion = null) => {
    try {
        const body = { estadoCompra_id: estado_id };
        if (observacion) body.observacion = observacion;

        const response = await fetch(`${API_COMPRAS}${idCompra}/cambiar_estado/`, {
            method: "POST",
            headers: getAuthHeaders('POST'),
            body: JSON.stringify(body),
        });

        return await response.json();
    } catch (error) {
        console.error("Error en cambiar_estado_compra:", error);
        return { error: true };
    }
};

export const obtener_compras_por_proveedor = async (proveedor_id) => {
    try {
        const response = await fetch(`${API_COMPRAS}by_proveedor/?proveedor_id=${proveedor_id}`, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al obtener compras del proveedor");
        return await response.json();
    } catch (error) {
        console.error("Error en obtener_compras_por_proveedor:", error);
        return [];
    }
};

export const obtener_compras_por_estado = async (estadoCompra_id) => {
    try {
        const response = await fetch(`${API_COMPRAS}by_estado/?estadoCompra_id=${estadoCompra_id}`, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al obtener compras por estado");
        return await response.json();
    } catch (error) {
        console.error("Error en obtener_compras_por_estado:", error);
        return [];
    }
};

export const obtener_compras_por_fecha = async (fecha_inicio, fecha_fin) => {
    try {
        const response = await fetch(`${API_COMPRAS}?fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al filtrar compras por fecha");
        return await response.json();
    } catch (error) {
        console.error("Error en obtener_compras_por_fecha:", error);
        return [];
    }
};

export const obtenerInsumos = async () => {
    try {
        const response = await fetch(API_INSUMOS, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al obtener insumos");
        return await response.json();
    } catch (error) {
        console.error("Error al obtenerInsumos:", error);
        return [];
    }
};

export const obtenerProveedores = async () => {
    try {
        const response = await fetch(API_PROVEEDORES, {
            method: 'GET',
            headers: getAuthHeaders('GET')
        });
        if (!response.ok) throw new Error("Error al obtener proveedores");
        return await response.json();
    } catch (error) {
        console.error("Error al obtenerProveedores:", error);
        return [];
    }
};
