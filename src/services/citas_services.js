const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/';
const BASE_URL_MANICURISTA = 'https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/';
const BASE_URL_CLIENTE = 'https://angelsuarez.pythonanywhere.com/api/usuario/clientes/';
const BASE_URL_SERVICIO = 'https://angelsuarez.pythonanywhere.com/api/servicio/servicio/';
const BASE_URL_SERVICIOCITA = 'https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/';
const BASE_URL_ESTADOS = 'https://angelsuarez.pythonanywhere.com/api/cita-venta/estados-cita/';

function getAuthHeaders(method = 'GET') {
    const headers = { 'Content-Type': 'application/json' };
    if (method !== 'GET') {
        const token = localStorage.getItem("access_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return headers;
}

async function listar_citas() {
    try {
        const response = await fetch(BASE_URL, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar citas');
        return await response.json();
    } catch (error) {
        console.error('Error al listar citas:', error);
        return null;
    }
}

async function crear_cita(data) {
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: getAuthHeaders("POST"),
            body: JSON.stringify(data),
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error("Errores de validación:", resultado);
            return {
                errores: resultado.detail || resultado.non_field_errors || resultado,
            };
        }

        return resultado;
    } catch (error) {
        console.error("Error al crear cita:", error);
        return { errores: { general: "Error de red o servidor." } };
    }
}

async function actualizar_cita(id, data) {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: "PUT",
            headers: getAuthHeaders("PUT"),
            body: JSON.stringify(data),
        });

        const resultado = await response.json();

        if (!response.ok) {
            console.error("Errores de validación:", resultado);
            return {
                errores: resultado.detail || resultado.non_field_errors || resultado,
            };
        }

        return resultado;
    } catch (error) {
        console.error("Error al actualizar cita:", error);
        return { errores: { general: "Error de red o servidor." } };
    }
}

async function listar_manicuristas_para_citas() {
    try {
        const response = await fetch(BASE_URL_MANICURISTA, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar citas');
        return await response.json();
    } catch (error) {
        console.error('Error al listar citas:', error);
        return null;
    }
}

async function listar_clientes_para_citas() {
    try {
        const response = await fetch(BASE_URL_CLIENTE, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar citas');
        return await response.json();
    } catch (error) {
        console.error('Error al listar citas:', error);
        return null;
    }
}

async function listar_servicios_para_citas() {
    try {
        const response = await fetch(BASE_URL_SERVICIO, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar servicios');
        return await response.json();
    } catch (error) {
        console.error('Error al listar servicios:', error);
        return null;
    }
}

async function listar_servicios_para_citas_creadas() {
    try {
        const response = await fetch(BASE_URL_SERVICIOCITA, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar servicios');
        return await response.json();
    } catch (error) {
        console.error('Error al listar servicios:', error);
        return null;
    }
}

async function listar_estado_cita() {
    try {
        const response = await fetch(BASE_URL_ESTADOS, { method: 'GET', headers: getAuthHeaders("GET") });
        if (!response.ok) throw new Error('Error al listar estado');
        return await response.json();
    } catch (error) {
        console.error('Error al listar estado:', error);
        return null;
    }
}

export const verificarDisponibilidadCliente = async (clienteId, fecha, hora) => {
    try {
        const response = await fetch(`${BASE_URL}?cliente_id=${clienteId}&fecha=${fecha}`, {
            method: "GET",
            headers: getAuthHeaders("GET")
        });
        if (!response.ok) throw new Error("Error al verificar citas del cliente");
        const citas = await response.json();

        const horaSeleccionada = new Date(`${fecha}T${hora}`);
        const citasConflicto = [];

        for (const cita of citas) {
            if (cita.estado_nombre === "Cancelada" || cita.estado_nombre === "Terminada") continue;

            const horaCita = new Date(`${cita.Fecha}T${cita.Hora}`);

            try {
                const serviciosResponse = await fetch(`${BASE_URL_SERVICIOCITA}?cita_id=${cita.id}`, {
                    method: "GET",
                    headers: getAuthHeaders("GET")
                });
                if (serviciosResponse.ok) {
                    const servicios = await serviciosResponse.json();

                    let duracionTotal = 0;
                    for (const servicio of servicios) {
                        try {
                            const detalleResponse = await fetch(`${BASE_URL_SERVICIO}${servicio.servicio_id}/`, {
                                method: "GET",
                                headers: getAuthHeaders("GET")
                            });
                            if (detalleResponse.ok) {
                                const detalle = await detalleResponse.json();
                                duracionTotal += (parseFloat(detalle.duracion) || 0) * 60;
                            }
                        } catch (error) {
                            console.error("Error en duración servicio:", error);
                            duracionTotal += 60;
                        }
                    }

                    if (duracionTotal === 0) duracionTotal = 60;

                    const horaFinCita = new Date(horaCita.getTime() + duracionTotal * 60000);
                    const hayConflicto = horaSeleccionada >= horaCita && horaSeleccionada < horaFinCita;

                    if (hayConflicto) {
                        citasConflicto.push({
                            ...cita,
                            hora_inicio: horaCita,
                            hora_fin: horaFinCita,
                            duracion_total: duracionTotal,
                        });
                    }
                }
            } catch (error) {
                console.error("Error al obtener servicios:", error);
                if (Math.abs(horaSeleccionada - horaCita) < 60 * 60 * 1000) {
                    citasConflicto.push({
                        ...cita,
                        hora_inicio: horaCita,
                        hora_fin: new Date(horaCita.getTime() + 60 * 60000),
                        duracion_total: 60,
                    });
                }
            }
        }

        return {
            disponible: citasConflicto.length === 0,
            conflictos: citasConflicto,
        };
    } catch (error) {
        console.error("Error en verificarDisponibilidadCliente:", error);
        return { disponible: false, error: error.message };
    }
}

export {
    listar_citas,
    listar_clientes_para_citas,
    crear_cita,
    actualizar_cita,
    listar_estado_cita,
    listar_manicuristas_para_citas,
    listar_servicios_para_citas,
    listar_servicios_para_citas_creadas
};
