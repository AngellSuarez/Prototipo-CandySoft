const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/proveedor/proveedores/';

// 🔐 Función para obtener headers con token si no es GET
function getAuthHeaders(method = 'GET') {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (method !== 'GET') {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

// Listar todos los proveedores
async function listar_proveedores() {
    try {
        const response = await fetch(BASE_URL, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });
        if (!response.ok) throw new Error('Error al listar proveedores');
        return await response.json();
    } catch (error) {
        console.error('Error al listar proveedores:', error);
        return null;
    }
}

// Obtener un proveedor por ID
async function obtener_proveedor(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });
        if (!response.ok) throw new Error('Error al obtener proveedor');
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener proveedor ${id}:`, error);
        return null;
    }
}

// Crear un nuevo proveedor
async function crear_proveedor(data) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders('POST'),
            body: JSON.stringify(data),
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error('Errores de validación:', resultado);
            return { errores: resultado }; 
        }

        return resultado; 
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        return { errores: { general: 'Error de red o servidor.' } };
    }
}

// Actualizar proveedor completo (PUT)
async function actualizar_proveedor(id, data) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders('PUT'),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return { errores: result };
        }

        return result;
    } catch (error) {
        console.error(`Error al actualizar proveedor ${id}:`, error);
        return null;
    }
}

// Actualizar solo el estado del proveedor (PATCH)
async function actualizar_estado_proveedor(id, nuevoEstado) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders('PATCH'),
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (!response.ok) throw new Error('Error al actualizar estado');
        return await response.json();
    } catch (error) {
        console.error(`Error al cambiar estado del proveedor ${id}:`, error);
        return null;
    }
}

// Eliminar proveedor
async function eliminar_proveedor(id) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'DELETE',
            headers: {'Authorization': `Bearer ${token}`},
        });
        if (!response.ok) throw new Error('Error al eliminar proveedor');
        return true;
    } catch (error) {
        console.error(`Error al eliminar proveedor ${id}:`, error);
        return false;
    }
}

export {
    listar_proveedores,
    obtener_proveedor,
    crear_proveedor,
    actualizar_proveedor,
    actualizar_estado_proveedor,
    eliminar_proveedor,
};
