const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/manicurista/novedades/';
const BASE_URL_MANICURISTA = 'https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/';

// 🔐 Headers con token solo si no es GET
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

async function listar_novedades(manicuristaId) {
    try {
        const url = manicuristaId
            ? `${BASE_URL}?manicurista_id=${manicuristaId}`
            : BASE_URL;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) throw new Error('Error al listar novedades');
        return await response.json();
    } catch (error) {
        console.error('Error al listar novedades:', error);
        return null;
    }
}

async function listar_manicuristas_para_novedades() {
    try {
        const response = await fetch(BASE_URL_MANICURISTA, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) throw new Error('Error al listar manicuristas');
        return await response.json();
    } catch (error) {
        console.error('Error al listar manicuristas:', error);
        return null;
    }
}

async function crear_novedad(data) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders('POST'),
            body: JSON.stringify(data),
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error('Errores de validación:', resultado);

            if (resultado.errores) {
                return { errores: resultado.errores };
            } else if (resultado.non_field_errors) {
                return { errores: { non_field_errors: resultado.non_field_errors } };
            } else {
                return { errores: resultado };
            }
        }

        return resultado;
    } catch (error) {
        console.error('Error al crear novedad:', error);
        return { errores: { general: ['Error de red o servidor.'] } };
    }
}

async function actualizar_novedad(id, data) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PUT',
            headers: getAuthHeaders('PUT'),
            body: JSON.stringify(data),
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error('Errores de validación:', resultado);

            if (resultado.errores) {
                return { errores: resultado.errores };
            } else if (resultado.non_field_errors) {
                return { errores: { non_field_errors: resultado.non_field_errors } };
            } else {
                return { errores: resultado };
            }
        }

        return resultado;
    } catch (error) {
        console.error(`Error al actualizar novedad ${id}:`, error);
        return { errores: { general: ['Error de red o servidor.'] } };
    }
}

async function actualizar_estado_novedad(id, nuevoEstado) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PATCH',
            headers: getAuthHeaders('PATCH'),
            body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (!response.ok) throw new Error('Error al actualizar estado');
        return await response.json();
    } catch (error) {
        console.error(`Error al cambiar estado del novedad ${id}:`, error);
        return null;
    }
}

async function eliminar_novedad(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders('DELETE'),
        });
        if (!response.ok) throw new Error('Error al eliminar la novedad')
        return true;
    } catch (error) {
        console.error(`Error al eliminar proveedor ${id}:`, error);
        return false;
    }
}

export {
    listar_novedades,
    crear_novedad,
    actualizar_novedad,
    actualizar_estado_novedad,
    listar_manicuristas_para_novedades,
    eliminar_novedad
};
