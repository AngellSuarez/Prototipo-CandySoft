const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/';

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

// Listar todas las manicuristas
async function listar_manicuristas() {
    try {
        const response = await fetch(BASE_URL, { method: 'GET', headers: getAuthHeaders('GET') });
        if (!response.ok) throw new Error('Error al listar manicurista');
        return await response.json();
    } catch (error) {
        console.error('Error al listar manicurista:', error);
        return null;
    }
}

// Obtener una manicurista por ID
async function obtener_manicurista(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, { method: 'GET', headers: getAuthHeaders('GET') });
        if (!response.ok) throw new Error('Error al obtener manicurista');
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener manicurista ${id}:`, error);
        return null;
    }
}

// Crear una nueva manicurista
async function crear_manicurista(username, nombre, apellido, correo, celular, tipo_documento, numero_documento, fecha_nacimiento, fecha_contratacion) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders('POST'),
            body: JSON.stringify({
                username,
                nombre,
                apellido,
                correo,
                celular,
                tipo_documento,
                numero_documento,
                fecha_nacimiento,
                fecha_contratacion
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error("Error al crear la manicurista");
            error.data = data;
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error al crear manicurista:", error);
        throw error;
    }
}

// Actualizar manicurista completo (PUT)
async function actualizar_manicurista(usuario_id, data) {
    try {
        const formData = new FormData();
        formData.append('username_out', data.username_out);
        formData.append('nombre', data.nombre);
        formData.append('apellido', data.apellido);
        formData.append('tipo_documento', data.tipo_documento);
        formData.append('numero_documento', data.numero_documento);
        formData.append('correo', data.correo);
        formData.append('celular', data.celular);
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
        formData.append('fecha_contratacion', data.fecha_contratacion);
        formData.append('estado', data.estado);

        if (data.password) formData.append('password', data.password);
        if (data.passwordConfirm) formData.append('passwordConfirm', data.passwordConfirm);

        const token = localStorage.getItem('access_token');

        const response = await fetch(`${BASE_URL}${usuario_id}/`, {
            method: 'PUT',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });

        const contentType = response.headers.get("content-type");
        const responseData = contentType && contentType.includes("application/json")
            ? await response.json()
            : {};

        if (!response.ok) {
            const error = new Error("Error al actualizar manicurista");
            error.name = "ValidationError";
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error(`Error al actualizar manicurista ${usuario_id}:`, error);
        throw error;
    }
}

// Actualizar solo el estado de la manicurista (PATCH)
async function actualizar_estado_manicurista(usuario_id) {
    try {
        const response = await fetch(`${BASE_URL}${usuario_id}/cambiar_estado/`, {
            method: 'PATCH',
            headers: getAuthHeaders('PATCH'),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al cambiar el estado del usuario");
        }
    } catch (error) {
        console.error(`Error al cambiar estado de la manicurista ${usuario_id}:`, error);
        return null;
    }
}

// Eliminar manicurista
async function eliminar_manicurista(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "DELETE",
            headers: getAuthHeaders('DELETE'),
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
            throw new Error(data?.message || `Error ${response.status}: al eliminar el manicurista`);
        }

        return data;
    } catch (error) {
        console.error("Error al eliminar manicurista:", error);
        throw error;
    }
}

async function listar_manicursitas_activas() {
    try {
        const response = await fetch(`${BASE_URL}activos/`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir las manicuristas activas");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al traer las manicuristas: ", error);
    }
}

export {
    listar_manicuristas,
    obtener_manicurista,
    crear_manicurista,
    actualizar_manicurista,
    actualizar_estado_manicurista,
    eliminar_manicurista,
    listar_manicursitas_activas
};
