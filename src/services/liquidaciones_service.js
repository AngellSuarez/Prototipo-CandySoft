const BASE_URL = "https://angelsuarez.pythonanywhere.com/api/manicurista/liquidaciones/";

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

async function listar_liquidaciones() {
    try {
        const response = await fetch(`${BASE_URL}`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir las liquidaciones");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error('Error al conseguir las liquidaciones: ', error);
    }
}

async function listar_citas_completadas(manicurista_id, fecha_final, fecha_inicio) {
    try {
        const response = await fetch(
            `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/citas-manicurista-terminada/?manicurista_id=${manicurista_id}&fechaInicio=${fecha_inicio}&fechaFinal=${fecha_final}`,
            {
                method: 'GET',
                headers: getAuthHeaders('GET'),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al conseguir las citas en el rango seleccionado');
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error(`Error al conseguir las citas del manicurista en el rango ${error}`);
    }
}

async function fechas_ultimas_liquidaciones() {
    try {
        const response = await fetch(`${BASE_URL}ultimas-liquidaciones/`, {
            method: 'GET',
            headers: getAuthHeaders('GET'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir las últimas fechas de liquidación");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error(`Error al traer las últimas liquidaciones: ${error}`);
    }
}

async function crear_liquidacion(manicurista_id, FechaInicial, FechaFinal) {
    try {
        const response = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers: getAuthHeaders('POST'),
            body: JSON.stringify({
                manicurista_id,
                FechaInicial,
                FechaFinal
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al crear la liquidación");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al crear la liquidación: ", error);
    }
}

async function eliminar_liquidacion(id) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders('DELETE'),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al eliminar la liquidación");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error('Error al eliminar la liquidación: ', error);
    }
}

export {
    listar_liquidaciones,
    listar_citas_completadas,
    fechas_ultimas_liquidaciones,
    crear_liquidacion,
    eliminar_liquidacion
};
