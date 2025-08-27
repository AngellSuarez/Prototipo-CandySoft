const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/servicio/servicio/';

const headers = {
    'Content-Type': 'application/json',
};

// Listar todos los servicios
async function listar_servicios() {
    try {
        const response = await fetch(BASE_URL, { method: 'GET', headers });
        if (!response.ok) throw new Error('Error al listar servicios');
        return await response.json();
    } catch (error) {
        console.error('Error al listar servicios:', error);
        return null;
    }
}

// Obtener un servicio por ID
async function obtener_servicio(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, { method: 'GET', headers });
        if (!response.ok) throw new Error('Error al obtener servicio');
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener servicio ${id}:`, error);
        return null;
    }
}

// Crear un nuevo servicio
async function crear_servicio(data) {
    try {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('descripcion', data.descripcion);
        formData.append('precio', data.precio);
        formData.append('estado', data.estado);
        formData.append('tipo', data.tipo);
        formData.append('duracion', data.duracion);
        if (data.imagen) {
            formData.append('imagen', data.imagen);
        }

        const token = localStorage.getItem('access_token');
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error('Errores de validación:', resultado);
            return { errores: resultado };
        }

        return resultado;
    } catch (error) {
        console.error('Error al crear servicio:', error);
        return { errores: { general: 'Error de red o servidor.' } };
    }
}

// Actualizar servicio completo (PUT)
async function actualizar_servicio(id, data) {
    try {
        const formData = new FormData();

        formData.append('nombre', data.nombre);
        formData.append('descripcion', data.descripcion);
        formData.append('precio', data.precio);
        formData.append('estado', data.estado);
        formData.append('tipo', data.tipo);
        formData.append('duracion', data.duracion);
        if (data.imagen) {
            formData.append('imagen', data.imagen);
        }

        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PUT',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        if (!response.ok) throw new Error('Error al actualizar servicio');

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return { id, ...data };
        }

    } catch (error) {
        console.error(`Error al actualizar servicio ${id}:`, error);
        return null;
    }
}

// Actualizar solo el estado del servicio (PATCH)
async function actualizar_estado_servicio(id, nuevoEstado) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({ estado: nuevoEstado }),
        });
        if (!response.ok) throw new Error('Error al actualizar estado');
        return await response.json();
    } catch (error) {
        console.error(`Error al cambiar estado del servicio ${id}:`, error);
        return null;
    }
}

// Eliminar servicio
async function eliminar_servicio(id) {
    try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let data = null;
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            data = await response.json().catch(() => null);
        }

        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error(`Error al eliminar servicio ${id}:`, error);
        return { ok: false, status: 0, data: null };
    }
}


export {
    listar_servicios,
    obtener_servicio,
    crear_servicio,
    actualizar_servicio,
    actualizar_estado_servicio,
    eliminar_servicio,
};
