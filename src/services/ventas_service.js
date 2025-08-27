const API_VENTAS = "https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/"
const API_SERVICIOS = "https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/"
const API_MANICURISTAS = "https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/"
const API_CLIENTE = "https://angelsuarez.pythonanywhere.com/api/usuario/clientes/"

function getAuthHeaders(method = "GET") {
  const headers = { "Content-Type": "application/json" }
  if (method !== "GET") {
    const token = localStorage.getItem("access_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }
  return headers
}

export const listar_ventas = async (params = "") => {
  try {
    const response = await fetch(`${API_VENTAS}?${params}`, {
      method: "GET",
      headers: getAuthHeaders("GET")
    })
    if (!response.ok) throw new Error("Error al listar ventas")
    return await response.json()
  } catch (error) {
    console.error("Error en listar_ventas:", error)
    return []
  }
}

export const obtenerServicios = async (citaId) => {
  try {
    const response = await fetch(`${API_SERVICIOS}?cita_id=${citaId}`, {
      method: "GET",
      headers: getAuthHeaders("GET")
    })
    if (!response.ok) throw new Error("Error al obtener servicios de la venta")
    return await response.json()
  } catch (error) {
    console.error("Error en obtenerServicios:", error)
    return []
  }
}

export const obtenerManicurista = async (id) => {
  try {
    const response = await fetch(`${API_MANICURISTAS}${id}/`, {
      method: "GET",
      headers: getAuthHeaders("GET")
    })
    if (!response.ok) throw new Error("Error al obtener manicurista por ID")
    return await response.json()
  } catch (error) {
    console.error("Error en obtenerManicurista:", error)
    return null
  }
}

export const obtenerCliente = async (id) => {
  try {
    const response = await fetch(`${API_CLIENTE}${id}/`, {
      method: "GET",
      headers: getAuthHeaders("GET")
    })
    if (!response.ok) throw new Error("Error al obtener cliente por ID")
    const data = await response.json()
    console.log("Datos cliente recibidos:", data)
    return data
  } catch (error) {
    console.error("Error en obtenerCliente:", error)
    return null
  }
}

export const verificarDisponibilidadCliente = async (clienteId, fecha, hora) => {
  try {
    const response = await fetch(`${API_VENTAS}?cliente_id=${clienteId}&fecha=${fecha}`, {
      method: "GET",
      headers: getAuthHeaders("GET")
    })
    if (!response.ok) throw new Error("Error al verificar citas del cliente")
    const citas = await response.json()

    const horaSeleccionada = new Date(`${fecha}T${hora}`)

    const citasConflicto = []

    for (const cita of citas) {
      if (cita.estado_nombre === "Cancelada" || cita.estado_nombre === "Terminada") {
        continue
      }

      const horaCita = new Date(`${cita.Fecha}T${cita.Hora}`)

      try {
        const serviciosResponse = await fetch(`${API_SERVICIOS}?cita_id=${cita.id}`, {
          method: "GET",
          headers: getAuthHeaders("GET")
        })

        if (serviciosResponse.ok) {
          const servicios = await serviciosResponse.json()

          let duracionTotal = 0
          for (const servicio of servicios) {
            try {
              const servicioDetalleResponse = await fetch(
                `https://angelsuarez.pythonanywhere.com/api/servicio/servicio/${servicio.servicio_id}/`,
                {
                  method: "GET",
                  headers: getAuthHeaders("GET")
                }
              )
              if (servicioDetalleResponse.ok) {
                const servicioDetalle = await servicioDetalleResponse.json()
                duracionTotal += (Number.parseFloat(servicioDetalle.duracion) || 0) * 60
              }
            } catch (error) {
              console.error("Error obteniendo duración del servicio:", error)
              duracionTotal += 60
            }
          }

          if (duracionTotal === 0) {
            duracionTotal = 60
          }

          const horaFinCita = new Date(horaCita.getTime() + duracionTotal * 60000)

          const hayConflicto = horaSeleccionada >= horaCita && horaSeleccionada < horaFinCita

          if (hayConflicto) {
            citasConflicto.push({
              ...cita,
              hora_inicio: horaCita,
              hora_fin: horaFinCita,
              duracion_total: duracionTotal,
            })
          }
        }
      } catch (error) {
        console.error("Error obteniendo servicios de la cita:", error)

        if (Math.abs(horaSeleccionada - horaCita) < 60 * 60 * 1000) {
          citasConflicto.push({
            ...cita,
            hora_inicio: horaCita,
            hora_fin: new Date(horaCita.getTime() + 60 * 60000),
            duracion_total: 60,
          })
        }
      }
    }

    return {
      disponible: citasConflicto.length === 0,
      conflictos: citasConflicto,
    }
  } catch (error) {
    console.error("Error en verificarDisponibilidadCliente:", error)
    return { disponible: false, error: error.message }
  }
}
