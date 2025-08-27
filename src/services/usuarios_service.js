// servicio para usuarios

const BASE_URL = "https://angelsuarez.pythonanywhere.com/api/usuario/";

// Función para obtener headers con token si no es GET
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

async function listar_usuarios() {
    try {
        const response = await fetch(`${BASE_URL}usuarios/`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir los usuarios");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error('Error al conseguir los usuarios: ', error);
    }
}

async function listar_usuarios_administrativos() {
    try {
        const response = await fetch(`${BASE_URL}usuarios/admin_recepcionista/`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir los usuarios administrativos");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al conseguir los usuarios administrativos: ", error);
        throw error;
    }
}

async function cambiar_estado_usuario(id) {
    try {
        const response = await fetch(`${BASE_URL}usuarios/${id}/cambiar_estado/`, {
            method: 'PATCH',
            headers: getAuthHeaders('PATCH'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al cambiar el estado del usuario");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al cambiar el estado del usuario: ", error);
        throw error;
    }
}

async function eliminar_usuario(id) {
    try {
        const response = await fetch(`${BASE_URL}usuarios/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders('DELETE'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al eliminar el usuario");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al eliminar el usuario: ", error);
        throw error;
    }
}

async function crear_usuario(username, nombre, apellido, correo, rol_id, tipo_documento, numero_documento) {
    try {
        const response = await fetch(`${BASE_URL}usuarios/`, {
            method: 'POST',
            headers: getAuthHeaders('POST'),
            body: JSON.stringify({
                username,
                nombre,
                apellido,
                correo,
                rol_id,
                tipo_documento,
                numero_documento
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { ok: false, errores: data };
        }

        return { ok: true, data };
    } catch (error) {
        console.error("Error al crear el usuario: ", error);
        return { ok: false, errores: { global: "Error de red o del servidor." } };
    }
}

async function editar_usuario(id, username, password, nombre, apellido, correo, rol_id, tipo_documento, numero_documento) {
    try {
        const userData = {
            username: username,
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            rol_id: rol_id,
            password: password,
            tipo_documento: tipo_documento,
            numero_documento: numero_documento
        };

        const response = await fetch(`${BASE_URL}usuarios/${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders('PUT'),
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                ok: false,
                errores: data
            };
        }

        return {
            ok: true,
            data: data
        };
    } catch (error) {
        console.error("Error al editar el usuario:", error);
        return {
            ok: false,
            error: error.message || "Error inesperado al editar el usuario"
        };
    }
}

export {
    listar_usuarios,
    cambiar_estado_usuario,
    eliminar_usuario,
    crear_usuario,
    editar_usuario,
    listar_usuarios_administrativos
};
