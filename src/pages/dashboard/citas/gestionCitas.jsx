import { useState, useEffect } from "react"
import "../../../css/gestionar.css"
import "../../../css/citas.css"
import { AiOutlineEye } from "react-icons/ai"
import { FiEdit } from "react-icons/fi"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useTheme } from "../../tema/ThemeContext"
import {
    listar_manicuristas_para_citas,
    listar_clientes_para_citas,
    listar_servicios_para_citas,
    listar_citas,
    listar_servicios_para_citas_creadas,
    actualizar_cita,
    listar_estado_cita,
    crear_cita,
    verificarDisponibilidadCliente,
} from "../../../services/citas_services"
import { Link } from "react-router-dom"
import { Bell, User, Calendar, Table, ChevronLeft, ChevronRight, Star, X } from "lucide-react"
import { listar_calificaciones } from "../../../services/calificaciones_service"

const GestionCitas = () => {
    const MySwal = withReactContent(Swal)

    const [isLoading, setIsLoading] = useState(false)
    const [sugerenciasServicio, setSugerenciasServicio] = useState([])
    const [clienteSeleccionado, setClienteSeleccionado] = useState("")
    const [formCita, setFormCita] = useState({
        manicurista: "",
        fecha: "",
        hora: "",
        descripcion: "",
        cliente: "",
        estado: 1,
    })
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
    const [erroresCita, setErroresCita] = useState({})
    const [sugerenciasCliente, setSugerenciasCliente] = useState([])
    const [showIngresoDateInput, setShowIngresoDateInput] = useState(false)
    const [horaingresoDate, setHoraingresoDate] = useState(false)
    const [showHoraIngresoDateInput, setShowHoraIngresoDateInput] = useState(false)
    const [pasoActual, setPasoActual] = useState(1)
    const [pasoEdicion, setPasoEdicion] = useState(1)
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
    const [precioUnitario, setPrecioUnitario] = useState(0)
    const [modalErrores, setModalErrores] = useState({})
    const [indiceEditando, setIndiceEditando] = useState(null)
    const [ingresoDate, setIngresoDate] = useState(false)

    const [citaSeleccionada, setCitaSeleccionada] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [loading, setLoading] = useState(true)
    const [paginaActual, setPaginaActual] = useState(1)
    const citasPorPagina = 4
    const [manicuristas, setManicuristas] = useState([])
    const [estados, setEstados] = useState([])
    const [servicioslista, setServiciosLista] = useState([])
    const [citas, setCitas] = useState([])
    const [clientes, setClientes] = useState([])
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
    const [serviciosDisponibles, setServiciosDisponibles] = useState([])
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
    const [totalCita, setTotalCita] = useState(0)
    const [modoVisualizacion, setModoVisualizacion] = useState(false)

    // Calendar state
    const [vistaActual, setVistaActual] = useState("tabla") // "tabla" o "calendario"
    const [fechaActual, setFechaActual] = useState(new Date())

    const [formEdicion, setFormEdicion] = useState({
        cliente: "",
        manicurista: "",
        fecha: "",
        hora: "",
        descripcion: "",
        estado: "",
    })
    const [serviciosEdicion, setServiciosEdicion] = useState([])
    const [erroresEdicion, setErroresEdicion] = useState({})
    const [clienteEdicionSeleccionado, setClienteEdicionSeleccionado] = useState("")
    const [horaInputEdicion, setHoraInputEdicion] = useState("")
    const [sugerenciasHoraEdicion, setSugerenciasHoraEdicion] = useState([])
    const [horasDisponiblesEdicion, setHorasDisponiblesEdicion] = useState([])
    const [noRecomendablesEdicion, setNoRecomendablesEdicion] = useState([])
    const [mensajeHorasVaciasEdicion, setMensajeHorasVaciasEdicion] = useState("")

    const today = new Date().toISOString().split("T")[0]

    // Agregar después de las otras declaraciones de estado
    const [valoresOriginalesCita, setValoresOriginalesCita] = useState({
        fecha: "",
        hora: "",
        manicurista: "",
    })

    const fetchCitas = async () => {
        const data = await listar_citas()
        setCitas(data)
    }

    useEffect(() => {
        fetchCitas()
    }, [])

    useEffect(() => {
        const total = serviciosSeleccionados.reduce((sum, s) => sum + Number(s.precioUnitario || 0), 0)
        setTotalCita(total)
    }, [serviciosSeleccionados])

    useEffect(() => {
        const total = serviciosEdicion.reduce((sum, s) => sum + Number(s.precioUnitario || s.precio || 0), 0)
        setTotalCita(total)
    }, [serviciosEdicion])

    useEffect(() => {
        const fetchEstado = async () => {
            try {
                const data = await listar_estado_cita()
                setEstados(data || [])
            } catch (err) {
                console.error("Error al cargar estados:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchEstado()
    }, [])

    useEffect(() => {
        const fetchManicuristas = async () => {
            try {
                const data = await listar_manicuristas_para_citas()
                setManicuristas(data || [])
            } catch (err) {
                console.error("Error al cargar manicuristas:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchManicuristas()
    }, [])

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const data = await listar_clientes_para_citas()
                setClientes(data || [])
            } catch (err) {
                console.error("Error al cargar clientes para citas:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchClientes()
    }, [])

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const data = await listar_servicios_para_citas()
                setServiciosLista(data || [])
                setServiciosDisponibles(data || [])
            } catch (err) {
                console.error("Error al cargar servicios para citas:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchServicios()
    }, [])

    useEffect(() => {
        const fetchCitas = async () => {
            try {
                const data = await listar_citas()
                const data2 = await listar_servicios_para_citas_creadas()
                const data3 = await listar_servicios_para_citas()

                data2.forEach((servicioAsignado) => {
                    const servicio = data3.find((s) => s.id === servicioAsignado.servicio_id)
                    if (servicio) {
                        servicioAsignado.nombre = servicio.nombre
                    } else {
                        servicioAsignado.nombre = "Servicio no encontrado"
                    }
                })

                const serviciosPorCita = {}
                const serviciosprecioCita = {}

                data2.forEach((item) => {
                    if (!serviciosPorCita[item.cita_id]) {
                        serviciosPorCita[item.cita_id] = []
                        serviciosprecioCita[item.cita_id] = []
                    }
                    serviciosprecioCita[item.cita_id].push(item)
                    serviciosPorCita[item.cita_id].push(item.nombre)
                })

                data.forEach((cita) => {
                    const nombres = serviciosPorCita[cita.id] || []
                    const precio = serviciosprecioCita[cita.id] || []
                    cita.serviciosNombres = nombres.join(", ")
                    cita.servicios = precio
                })

                setCitas(data || [])
            } catch (err) {
                console.error("Error al cargar citas:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchCitas()
    }, [])

    const handleCrearCita = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        let errores = false

        if (!clienteSeleccionado) {
            setErroresCita((prev) => ({ ...prev, cliente: "Debes seleccionar el cliente" }))
            errores = true
        }

        if (!formCita.manicurista) {
            setErroresCita((prev) => ({ ...prev, manicurista: "Debes seleccionar la manicurista" }))
            errores = true
        }

        if (!formCita.fecha) {
            setErroresCita((prev) => ({ ...prev, fecha: "Debes seleccionar la fecha" }))
            errores = true
        }

        if (!formCita.hora) {
            setErroresCita((prev) => ({ ...prev, hora: "Debes seleccionar la hora" }))
            errores = true
        }

        if (!formCita.descripcion) {
            setErroresCita((prev) => ({ ...prev, descripcion: "Debes ingresar una descripción" }))
            errores = true
        }

        if (serviciosSeleccionados.length === 0) {
            setErroresCita((prev) => ({ ...prev, servicios: "Debes agregar al menos un servicio" }))
            errores = true
        }

        if (errores) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
            })
            setIsLoading(false)
            return
        }

        const totalCita = serviciosSeleccionados.reduce((acc, ser) => acc + Number(ser.precioUnitario), 0)

        try {
            const citaPayload = {
                Fecha: formCita.fecha,
                Hora: formCita.hora,
                Descripcion: formCita.descripcion,
                cliente_id: formCita.cliente,
                manicurista_id: formCita.manicurista,
                estado_id: formCita.estado,
                Total: totalCita,
            }

            const resultado = await crear_cita(citaPayload)

            if (resultado.errores) {
                console.log("Errores recibidos:", resultado.errores)

                if (resultado.errores.non_field_errors) {
                    const mensajeError = Array.isArray(resultado.errores.non_field_errors)
                        ? resultado.errores.non_field_errors[0]
                        : resultado.errores.non_field_errors

                    Swal.fire({
                        icon: "error",
                        title: "Conflicto de horario",
                        text: mensajeError,
                    })
                    setIsLoading(false)
                    return
                }

                if (resultado.errores.detail) {
                    Swal.fire({
                        icon: "error",
                        title: "Error de validación",
                        text: resultado.errores.detail,
                    })
                    setIsLoading(false)
                    return
                }

                let mensajeError = "Error al crear la cita"

                if (typeof resultado.errores === "string") {
                    mensajeError = resultado.errores
                } else if (resultado.errores.message) {
                    mensajeError = resultado.errores.message
                } else {
                    const mensajes = []
                    Object.keys(resultado.errores).forEach((key) => {
                        const error = resultado.errores[key]
                        if (Array.isArray(error)) {
                            mensajes.push(...error)
                        } else if (typeof error === "string") {
                            mensajes.push(error)
                        }
                    })

                    if (mensajes.length > 0) {
                        mensajeError = mensajes[0]
                    }
                }

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: mensajeError,
                })
                setIsLoading(false)
                return
            }

            const citaId = resultado.data.id

            for (const s of serviciosSeleccionados) {
                const servicioPayload = {
                    servicio_id: s.id,
                    cita_id: citaId,
                    subtotal: Number(s.precioUnitario),
                }

                const resServicio = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(servicioPayload),
                })

                if (!resServicio.ok) {
                    const errorData = await resServicio.json()
                    throw new Error(errorData.message || errorData.detail || "Error al guardar un servicio")
                }
            }

            Swal.fire({
                icon: "success",
                title: "Cita creada",
                text: "Cita creada exitosamente.",
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: "swal-rosado" },
            })

            await fetchCitas()
            closeCrearModal()
        } catch (err) {
            console.error("Error:", err)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Ocurrió un error al crear la cita.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditarCita = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        let errores = false

        if (!clienteEdicionSeleccionado) {
            setErroresEdicion((prev) => ({ ...prev, cliente: "Debes seleccionar el cliente" }))
            errores = true
        }

        if (!formEdicion.manicurista) {
            setErroresEdicion((prev) => ({ ...prev, manicurista: "Debes seleccionar la manicurista" }))
            errores = true
        }

        if (!formEdicion.fecha) {
            setErroresEdicion((prev) => ({ ...prev, fecha: "Debes seleccionar la fecha" }))
            errores = true
        }

        if (!formEdicion.hora) {
            setErroresEdicion((prev) => ({ ...prev, hora: "Debes seleccionar la hora" }))
            errores = true
        }

        if (!formEdicion.descripcion) {
            setErroresEdicion((prev) => ({ ...prev, descripcion: "Debes ingresar una descripción" }))
            errores = true
        }

        if (!formEdicion.estado) {
            setErroresEdicion((prev) => ({ ...prev, estado: "Debes seleccionar un estado" }))
            errores = true
        }

        if (serviciosEdicion.length === 0) {
            setErroresEdicion((prev) => ({ ...prev, servicios: "Debes agregar al menos un servicio" }))
            errores = true
        }

        if (errores) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
            })
            setIsLoading(false)
            return
        }

        const totalCita = serviciosEdicion.reduce((acc, ser) => acc + Number(ser.precioUnitario || ser.precio), 0)

        try {
            const clienteInfo = clientes.find((cli) => `${cli.nombre} ${cli.apellido}` === clienteEdicionSeleccionado)

            if (!clienteInfo) {
                throw new Error("No se encontró información del cliente")
            }

            const citaPayload = {
                Fecha: formEdicion.fecha,
                Hora: formEdicion.hora,
                Descripcion: formEdicion.descripcion,
                cliente_id: clienteInfo.usuario_id,
                manicurista_id: formEdicion.manicurista,
                estado_id: formEdicion.estado,
                Total: totalCita,
            }

            const resultado = await actualizar_cita(citaSeleccionada.id, citaPayload)

            if (resultado.errores) {
                console.log("Errores recibidos:", resultado.errores)

                if (resultado.errores.non_field_errors) {
                    const mensajeError = Array.isArray(resultado.errores.non_field_errors)
                        ? resultado.errores.non_field_errors[0]
                        : resultado.errores.non_field_errors

                    Swal.fire({
                        icon: "error",
                        title: "Conflicto de horario",
                        text: mensajeError,
                    })
                    setIsLoading(false)
                    return
                }

                if (resultado.errores.detail) {
                    Swal.fire({
                        icon: "error",
                        title: "Error de validación",
                        text: resultado.errores.detail,
                    })
                    setIsLoading(false)
                    return
                }

                let mensajeError = "Error al actualizar la cita"

                if (typeof resultado.errores === "string") {
                    mensajeError = resultado.errores
                } else if (resultado.errores.message) {
                    mensajeError = resultado.errores.message
                } else {
                    const mensajes = []
                    Object.keys(resultado.errores).forEach((key) => {
                        const error = resultado.errores[key]
                        if (Array.isArray(error)) {
                            mensajes.push(...error)
                        } else if (typeof error === "string") {
                            mensajes.push(error)
                        }
                    })

                    if (mensajes.length > 0) {
                        mensajeError = mensajes[0]
                    }
                }

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: mensajeError,
                })
                setIsLoading(false)
                return
            }

            const serviciosExistentesRes = await fetch(
                `https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/?cita_id=${citaSeleccionada.id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                },
            )

            if (!serviciosExistentesRes.ok) {
                throw new Error("Error al obtener los servicios existentes")
            }

            const serviciosExistentes = await serviciosExistentesRes.json()

            for (const servicio of serviciosExistentes) {
                const deleteRes = await fetch(`https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/${servicio.id}/`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                })

                if (!deleteRes.ok) {
                    throw new Error(`Error al eliminar el servicio ${servicio.id}`)
                }
            }

            for (const s of serviciosEdicion) {
                const servicioPayload = {
                    servicio_id: s.id,
                    cita_id: citaSeleccionada.id,
                    subtotal: Number(s.precioUnitario || s.precio),
                }

                const resServicio = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(servicioPayload),
                })

                if (!resServicio.ok) {
                    const errorData = await resServicio.json()
                    throw new Error(errorData.message || errorData.detail || "Error al guardar un servicio")
                }
            }

            Swal.fire({
                icon: "success",
                title: "Cita actualizada",
                text: "Cita actualizada exitosamente.",
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: "swal-rosado" },
            })

            await fetchCitas()
            closeEditarModal()
        } catch (err) {
            console.error("Error:", err)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Ocurrió un error al actualizar la cita.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const openCrearModal = () => setIsCrearModalOpen(true)

    const closeCrearModal = () => {
        setIsCrearModalOpen(false)
        setPasoActual(1)
        setFormCita({
            manicurista: "",
            fecha: "",
            hora: "",
            descripcion: "",
            cliente: "",
            estado: 1,
        })
        setClienteSeleccionado("")
        setServiciosSeleccionados([])
        setErroresCita({})
        setShowIngresoDateInput(false)
        setShowHoraIngresoDateInput(false)
    }

    const closeEditarModal = () => {
        setCitaSeleccionada(null)
        setIsEditarModalOpen(false)
        setPasoEdicion(1)
        setFormEdicion({
            cliente: "",
            manicurista: "",
            fecha: "",
            hora: "",
            descripcion: "",
            estado: "",
        })
        setClienteEdicionSeleccionado("")
        setServiciosEdicion([])
        setErroresEdicion({})
        setHoraInputEdicion("")
        setSugerenciasHoraEdicion([])
        setHorasDisponiblesEdicion([])
        setNoRecomendablesEdicion([])
        setMensajeHorasVaciasEdicion("")
        setValoresOriginalesCita({
            fecha: "",
            hora: "",
            manicurista: "",
        })
        setModoVisualizacion(false)
    }

    const abrirEditarModal = (cita, soloVer = false) => {
        setCitaSeleccionada(cita)
        setModoVisualizacion(soloVer)

        setFormEdicion({
            cliente: cita.cliente_nombre,
            manicurista: cita.manicurista_id,
            fecha: cita.Fecha,
            hora: cita.Hora,
            descripcion: cita.Descripcion,
            estado: cita.estado_id,
        })

        // En la función abrirEditarModal, después de setFormEdicion, agregar:
        setValoresOriginalesCita({
            fecha: cita.Fecha,
            hora: cita.Hora,
            manicurista: cita.manicurista_id,
        })

        // Convertir la hora de 24h a formato AM/PM para mostrar en el input
        const horaFormateada = formatearHoraAMPM(cita.Hora)
        setHoraInputEdicion(horaFormateada)

        setClienteEdicionSeleccionado(cita.cliente_nombre)

        const serviciosParseados = Array.isArray(cita.servicios)
            ? cita.servicios.map((servicio) => ({
                id: servicio.servicio_id,
                nombre: servicio.servicio_nombre?.trim() || servicio.nombre?.trim() || "Servicio",
                precioUnitario: Number.parseFloat(servicio.subtotal),
                precio: Number.parseFloat(servicio.subtotal),
            }))
            : []

        setServiciosEdicion(serviciosParseados)
        setPasoEdicion(1)
        setIsEditarModalOpen(true)
    }

    const handleBuscar = (e) => {
        const valorBusqueda = e.target.value.toLowerCase()
        setBusqueda(valorBusqueda)
        setPaginaActual(1)
    }

    const { darkMode } = useTheme()

    const [calificaciones, setCalificaciones] = useState([])
    const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
    const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tabActiva, setTabActiva] = useState("calificaciones")

    // Función para cargar calificaciones vistas desde localStorage
    const cargarCalificacionesVistas = () => {
        try {
            const vistas = localStorage.getItem("calificacionesVistas")
            if (vistas) {
                return new Set(JSON.parse(vistas))
            }
        } catch (error) {
            console.error("Error al cargar calificaciones vistas:", error)
        }
        return new Set()
    }

    const cargarCalificaciones = async () => {
        setLoadingCalificaciones(true)
        try {
            const data = await listar_calificaciones()
            setCalificaciones(data)
        } catch (error) {
            console.error("Error al cargar calificaciones:", error)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar las calificaciones.",
                customClass: { popup: "swal-rosado" },
            })
        } finally {
            setLoadingCalificaciones(false)
        }
    }

    const guardarCalificacionesVistas = (vistas) => {
        try {
            localStorage.setItem("calificacionesVistas", JSON.stringify([...vistas]))
        } catch (error) {
            console.error("Error al guardar calificaciones vistas:", error)
        }
    }

    const marcarCalificacionesComoVistas = (idsCalificaciones) => {
        const nuevasVistas = new Set([...calificacionesVistas, ...idsCalificaciones])
        setCalificacionesVistas(nuevasVistas)
        guardarCalificacionesVistas(nuevasVistas)
    }

    const openModal = (tab = "calificaciones") => {
        setTabActiva(tab)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        if (tabActiva === "calificaciones") {
            setNotificaciones((prev) => prev.map((n) => ({ ...n, visto: true })))
        } else if (tabActiva === "calificaciones") {
            const idsCalificaciones = calificaciones.map((c) => c.id)
            marcarCalificacionesComoVistas(idsCalificaciones)
        }
    }

    const calificacionesNoVistas = calificaciones.filter((c) => !calificacionesVistas.has(c.id)).length

    useEffect(() => {
        const vistasGuardadas = cargarCalificacionesVistas()
        setCalificacionesVistas(vistasGuardadas)


        cargarCalificaciones()
    }, [])

    useEffect(() => {
        if (calificaciones.length > 0) {
            const vistasActuales = cargarCalificacionesVistas()
            setCalificacionesVistas(vistasActuales)
        }
    }, [calificaciones])

    const citasConEstadosPermitidos = citas.filter((cita) =>
        ["En proceso", "Pendiente", "Cancelada"].includes(cita.estado_nombre),
    )

    const citasFiltradas = citasConEstadosPermitidos.filter((cita) =>
        Object.values(cita).some((valor) => String(valor).toLowerCase().includes(busqueda)),
    )

    const indexUltimaCita = paginaActual * citasPorPagina
    const indexPrimeraCita = indexUltimaCita - citasPorPagina
    const citasActuales = citasFiltradas.slice(indexPrimeraCita, indexUltimaCita)
    const totalPaginas = Math.ceil(citasFiltradas.length / citasPorPagina)

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return
        setPaginaActual(numero)
    }

    const [horasDisponibles, setHorasDisponibles] = useState([])
    const [horaInput, setHoraInput] = useState("")
    const [sugerenciasHora, setSugerenciasHora] = useState([])
    const [noRecomendables, setNoRecomendables] = useState([])
    const [mensajeHorasVacias, setMensajeHorasVacias] = useState("")

    const formatearHoraAMPM = (hora24) => {
        const [h, m] = hora24.split(":").map(Number)
        const ampm = h >= 12 ? "PM" : "AM"
        const h12 = h % 12 || 12
        return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
    }

    const convertirHoraA24 = (horaAMPM) => {
        const match = horaAMPM.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
        if (!match) return null
        let [_, h, m, ampm] = match
        h = Number.parseInt(h, 10)
        m = Number.parseInt(m, 10)
        if (ampm.toUpperCase() === "PM" && h < 12) h += 12
        if (ampm.toUpperCase() === "AM" && h === 12) h = 0
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }

    // Calendar functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date) => {
        return date.toISOString().split("T")[0]
    }

    const getCitasForDate = (date) => {
        const dateString = formatDate(date)
        return citasConEstadosPermitidos.filter((cita) => cita.Fecha === dateString)
    }

    const navigateMonth = (direction) => {
        const newDate = new Date(fechaActual)
        newDate.setMonth(newDate.getMonth() + direction)
        setFechaActual(newDate)
    }

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(fechaActual)
        const firstDay = getFirstDayOfMonth(fechaActual)
        const days = []
        const monthNames = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
        ]
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day calendar-day-empty"></div>)
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), day)
            const citasDelDia = getCitasForDate(currentDate)
            const isToday = formatDate(currentDate) === formatDate(new Date())

            days.push(
                <div key={day} className={`calendar-day ${isToday ? "calendar-day-today" : ""}`}>
                    <div className="calendar-day-number">{day}</div>
                    <div className="calendar-appointments">
                        {citasDelDia.slice(0, 2).map((cita) => (
                            <div
                                key={cita.id}
                                className={`calendar-appointment ${cita.estado_nombre === "Pendiente"
                                    ? "calendar-appointment-pending"
                                    : cita.estado_nombre === "En proceso"
                                        ? "calendar-appointment-process"
                                        : cita.estado_nombre === "Cancelada"
                                            ? "calendar-appointment-cancelled"
                                            : ""
                                    }`}
                                onClick={() => abrirEditarModal(cita, true)}
                                title={`${cita.cliente_nombre} - ${cita.Hora} - ${cita.estado_nombre}`}
                            >
                                {new Date(`1970-01-01T${cita.Hora}`).toLocaleTimeString("es-CO", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}{" "}
                                {cita.cliente_nombre}
                            </div>
                        ))}
                        {citasDelDia.length > 2 && <div className="calendar-more">+{citasDelDia.length - 2} más</div>}
                    </div>
                </div>,
            )
        }

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <h2 className="calendar-title">
                        {monthNames[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                    </h2>
                    <div className="calendar-navigation">
                        <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft size={20} />
                            <span className="sr-only">Mes anterior</span>
                        </button>
                        <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
                            <ChevronRight size={20} />
                            <span className="sr-only">Mes siguiente</span>
                        </button>
                    </div>
                </div>
                <div className="calendar-legend">
                    <div className="legend-item">
                        <span className="legend-color calendar-appointment-pending"></span>
                        <span className="legend-label">Pendiente</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color calendar-appointment-process"></span>
                        <span className="legend-label">En proceso</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color calendar-appointment-cancelled"></span>
                        <span className="legend-label">Cancelada</span>
                    </div>
                </div>
                <div className="calendar-grid">
                    {dayNames.map((dayName) => (
                        <div key={dayName} className="calendar-day-header">
                            {dayName}
                        </div>
                    ))}
                    {days}
                </div>
            </div>
        )
    }

    const renderTable = () => (
        <div className="overflow-hidden">
            <table className="roles-table">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Manicurista</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {citasActuales.length > 0 ? (
                        citasActuales.map((cita) => {
                            return (
                                <tr key={cita.id}>
                                    <td>{cita.cliente_nombre}</td>
                                    <td>{cita.manicurista_nombre}</td>
                                    <td>{cita.Fecha}</td>
                                    <td>
                                        {new Date(`${cita.Fecha}T${cita.Hora}`).toLocaleTimeString("es-CO", {
                                            timeZone: "America/Bogota",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </td>
                                    <td>$ {!isNaN(Number(cita.Total)) ? Number(cita.Total).toLocaleString() : "0"}</td>
                                    <td>
                                        <span
                                            className={`estado-texto ${cita.estado_nombre === "Pendiente"
                                                ? "estado-pendiente"
                                                : cita.estado_nombre === "En proceso"
                                                    ? "estado-proceso"
                                                    : cita.estado_nombre === "Cancelada"
                                                        ? "estado-cancelada"
                                                        : ""
                                                }`}
                                        >
                                            {cita.estado_nombre}
                                        </span>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button
                                            onClick={() => abrirEditarModal(cita, true)}
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalle de la cita"
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        {cita.estado_nombre !== "Cancelada" && (
                                            <button
                                                onClick={() => abrirEditarModal(cita, false)}
                                                className="acciones-btn editar-btn flex items-center justify-center p-2"
                                                title="Editar la cita"
                                            >
                                                <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                {loading ? "Cargando citas..." : "No se encontraron citas"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    useEffect(() => {
        const fetchHorasDisponibles = async () => {
            if (formCita.manicurista && formCita.fecha) {
                const response = await fetch(
                    `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${formCita.manicurista}&fecha=${formCita.fecha}`,
                )
                const data = await response.json()

                let horas = data.horas_disponibles || []

                const ahora = new Date()
                const hoyStr = ahora.toISOString().split("T")[0]
                const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes()

                if (formCita.fecha === hoyStr) {
                    horas = horas.filter((h) => {
                        const [hh, mm] = h.split(":").map(Number)
                        const horaEnMinutos = hh * 60 + mm
                        return horaEnMinutos > horaActualMinutos
                    })
                }

                setHorasDisponibles(horas)
                setNoRecomendables(data.no_recomendables || [])

                if (horas.length === 0) {
                    setMensajeHorasVacias("Ya no hay horas disponibles para este día.")
                } else {
                    setMensajeHorasVacias("")
                }
            }
        }

        fetchHorasDisponibles()
    }, [formCita.manicurista, formCita.fecha])

    useEffect(() => {
        const fetchHorasDisponiblesEdicion = async () => {
            if (formEdicion.manicurista && formEdicion.fecha) {
                const response = await fetch(
                    `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${formEdicion.manicurista}&fecha=${formEdicion.fecha}`,
                )
                const data = await response.json()

                let horas = data.horas_disponibles || []

                const ahora = new Date()
                const hoyStr = ahora.toISOString().split("T")[0]
                const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes()

                if (formEdicion.fecha === hoyStr) {
                    horas = horas.filter((h) => {
                        const [hh, mm] = h.split(":").map(Number)
                        const horaEnMinutos = hh * 60 + mm
                        return horaEnMinutos > horaActualMinutos
                    })
                }

                setHorasDisponiblesEdicion(horas)
                setNoRecomendablesEdicion(data.no_recomendables || [])

                if (horas.length === 0) {
                    setMensajeHorasVaciasEdicion("Ya no hay horas disponibles para este día.")
                } else {
                    setMensajeHorasVaciasEdicion("")
                }
            }
        }

        fetchHorasDisponiblesEdicion()
    }, [formEdicion.manicurista, formEdicion.fecha])

    const horaEsValida = (horaAMPM) => {
        const hora24 = convertirHoraA24(horaAMPM)
        if (!hora24) return false

        const [h, m] = hora24.split(":").map(Number)
        const entrada = new Date(0, 0, 0, h, m)

        return horasDisponibles.some((disponible) => {
            const [hd, md] = disponible.split(":").map(Number)
            const inicio = new Date(0, 0, 0, hd, md)
            const fin = new Date(inicio.getTime() + 30 * 60000)
            return entrada >= inicio && entrada < fin
        })
    }

    const handleHoraChange = (e) => {
        const valor = e.target.value
        setHoraInput(valor)
        setFormCita((prev) => ({ ...prev, hora: valor }))

        const sugerencias = horasDisponibles
            .map((h) => formatearHoraAMPM(h))
            .filter((s) => s.toLowerCase().startsWith(valor.toLowerCase()))

        setSugerenciasHora(sugerencias)

        if (!valor) {
            setErroresCita((prev) => ({ ...prev, hora: "La hora es obligatoria" }))
        } else {
            const esValida = horaEsValida(valor)
            setErroresCita((prev) => ({
                ...prev,
                hora: esValida ? "" : "Manicurista no disponible a esa hora",
            }))
        }
    }

    const handleHoraChangeEdicion = (e) => {
        const valor = e.target.value
        setHoraInputEdicion(valor)
        setFormEdicion((prev) => ({ ...prev, hora: valor }))

        const sugerencias = horasDisponiblesEdicion
            .map((h) => formatearHoraAMPM(h))
            .filter((s) => s.toLowerCase().startsWith(valor.toLowerCase()))

        setSugerenciasHoraEdicion(sugerencias)

        if (!valor) {
            setErroresEdicion((prev) => ({ ...prev, hora: "La hora es obligatoria" }))
        } else {
            // Solo validar si cambió la hora, fecha o manicurista
            const cambioHora = convertirHoraA24(valor) !== valoresOriginalesCita.hora
            const cambioFecha = formEdicion.fecha !== valoresOriginalesCita.fecha
            const cambioManicurista = formEdicion.manicurista !== valoresOriginalesCita.manicurista

            if (cambioHora || cambioFecha || cambioManicurista) {
                const esValida = horaEsValidaEdicion(valor)
                setErroresEdicion((prev) => ({
                    ...prev,
                    hora: esValida ? "" : "Manicurista no disponible a esa hora",
                }))
            } else {
                // Si no cambió nada, limpiar errores
                setErroresEdicion((prev) => ({ ...prev, hora: "" }))
            }
        }
    }

    const horaEsValidaEdicion = (horaAMPM) => {
        const hora24 = convertirHoraA24(horaAMPM)
        if (!hora24) return false

        const [h, m] = hora24.split(":").map(Number)
        const entrada = new Date(0, 0, 0, h, m)

        return horasDisponiblesEdicion.some((disponible) => {
            const [hd, md] = disponible.split(":").map(Number)
            const inicio = new Date(0, 0, 0, hd, md)
            const fin = new Date(inicio.getTime() + 30 * 60000)
            return entrada >= inicio && entrada < fin
        })
    }

    const esNoRecomendableEdicion = (hora24) => {
        return noRecomendablesEdicion.includes(hora24)
    }

    const esNoRecomendable = (hora24) => {
        return noRecomendables.includes(hora24)
    }

    const [validandoDisponibilidad, setValidandoDisponibilidad] = useState(false)
    const [errorDisponibilidad, setErrorDisponibilidad] = useState("")

    const validarDisponibilidad = async () => {
        if (!formCita.cliente || !formCita.fecha || !formCita.hora) {
            return false
        }

        setValidandoDisponibilidad(true)
        setErrorDisponibilidad("")

        try {
            const disponibilidadCliente = await verificarDisponibilidadCliente(
                formCita.cliente,
                formCita.fecha,
                formCita.hora,
            )

            if (!disponibilidadCliente.disponible && disponibilidadCliente.conflictos.length > 0) {
                const citaConflicto = disponibilidadCliente.conflictos[0]

                const horaInicio = citaConflicto.hora_inicio.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })

                const horaFin = citaConflicto.hora_fin.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })

                const fechaCita = new Date(citaConflicto.Fecha).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })

                // Leyly aqui esta el alerta con el estilo que mando la linda IA
                await Swal.fire({
                    icon: "warning",
                    title: "Cliente no disponible",
                    html: `
                <div style="text-align: left; padding: 10px;">
                  <p><strong>El cliente ya tiene una cita programada:</strong></p>
                  <br>
                  <p><strong>Fecha:</strong> ${fechaCita}</p>
                  <p><strong>Horario:</strong> desde las ${horaInicio} hasta las ${horaFin}</p>
                  <br>
                  <p>Por favor selecciona otro horario para este cliente.</p>
                </div>
              `,
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#7e2952",
                    customClass: { popup: "swal-rosado" },
                })

                setErrorDisponibilidad("El cliente ya tiene una cita programada en este horario.")
                return false
            }

            return true
        } catch (error) {
            console.error("Error validando disponibilidad:", error)
            setErrorDisponibilidad("Error al verificar disponibilidad. Intenta nuevamente.")
            return false
        } finally {
            setValidandoDisponibilidad(false)
        }
    }

    const handlePasoUno = async (e) => {
        e.preventDefault()

        const errores = {}

        if (!clienteSeleccionado) errores.cliente = "Debes seleccionar un cliente"
        if (!formCita.manicurista) errores.manicurista = "La manicurista es obligatoria"
        if (!formCita.fecha) errores.fecha = "La fecha es obligatoria"

        if (!formCita.hora) {
            errores.hora = "La hora es obligatoria"
        } else if (!horaEsValida(formatearHoraAMPM(formCita.hora))) {
            errores.hora = "Manicurista no disponible a esa hora"
        } else if (esNoRecomendable(formCita.hora)) {
            errores.hora = "Advertencia: hay una cita muy cerca de esta hora"
        }

        if (!formCita.descripcion) errores.descripcion = "La descripción es obligatoria"

        setErroresCita(errores)

        const hayErrores = Object.keys(errores).length > 0

        if (hayErrores) {
            const mensaje = errores.hora?.startsWith("Advertencia")
                ? errores.hora
                : "Por favor completa todos los campos obligatorios antes de continuar."

            await Swal.fire({
                icon: errores.hora?.startsWith("Advertencia") ? "warning" : "error",
                title: errores.hora?.startsWith("Advertencia") ? "Advertencia de agenda" : "Campos incompletos",
                text: mensaje,
                confirmButtonColor: "#d33",
                confirmButtonText: "Entendido",
            })
            return
        }

        const disponibilidadOk = await validarDisponibilidad()
        if (!disponibilidadOk) return

        setPasoActual(2)
    }

    const formatearFecha = (fechaString) => {
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getEstrellas = (puntuacion) => {
        const estrellas = []
        const maxEstrellas = 5

        const estrellasLlenas = puntuacion === 1 ? 5 : puntuacion === 2 ? 4 : puntuacion === 3 ? 2 : 1

        for (let i = 0; i < maxEstrellas; i++) {
            estrellas.push(
                <Star
                    key={i}
                    size={16}
                    style={{
                        color: i < estrellasLlenas ? "#fbbf24" : "#d1d5db",
                        fill: i < estrellasLlenas ? "#fbbf24" : "transparent",
                    }}
                />,
            )
        }
        return estrellas
    }

    const getPuntuacionTexto = (puntuacion) => {
        const opciones = {
            1: "Muy Bien",
            2: "Bien",
            3: "Mal",
            4: "Muy Mal",
        }
        return opciones[puntuacion] || "Sin calificar"
    }

    if (loading) return null

    return (
        <div
            className={`${vistaActual === "tabla" ? "roles-container" : "roles-container-cita"} ${darkMode ? "dark" : ""}`}
        >
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de citas</h1>

                <div className="iconos-perfil">
                    <div className="bell-container" onClick={() => openModal("calificaciones")}>
                        <span title="Ver calificaciones">
                            <Star className="icon" />
                        </span>
                        {calificacionesNoVistas > 0 && (
                            <span className="notification-badge">{calificacionesNoVistas > 99 ? "99+" : calificacionesNoVistas}</span>
                        )}
                    </div>
                    <Link to="/administrador/dashboard/perfil">
                        <span title="Tu perfil">
                            <User className="icon" />
                        </span>
                    </Link>
                </div>
            </div>

            <div className="view-toggle-container">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => setIsCrearModalOpen(true)} className="crear-btn">
                        Crear cita
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Buscar cita..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                    style={{ marginLeft: "200px" }}
                />
                <div className="view-toggle-buttons">
                    <button
                        className={`view-toggle-btn ${vistaActual === "tabla" ? "active" : ""}`}
                        onClick={() => setVistaActual("tabla")}
                        style={{ marginTop: "5px" }}
                    >
                        <Table size={18} />
                        <span>Tabla</span>
                    </button>
                    <button
                        className={`view-toggle-btn ${vistaActual === "calendario" ? "active" : ""}`}
                        onClick={() => setVistaActual("calendario")}
                        style={{ marginTop: "5px" }}
                    >
                        <Calendar size={18} />
                        <span>Calendario</span>
                    </button>
                </div>
            </div>

            {vistaActual === "tabla" ? renderTable() : renderCalendar()}

            {vistaActual === "tabla" && (
                <div className="paginacion-container">
                    <div
                        className={`flecha ${paginaActual === 1 ? "flecha-disabled" : ""}`}
                        onClick={() => cambiarPagina(paginaActual - 1)}
                    >
                        &#8592;
                    </div>

                    <span className="texto-paginacion">
                        Página {paginaActual} de {totalPaginas}
                    </span>

                    <div
                        className={`flecha ${paginaActual === totalPaginas ? "flecha-disabled" : ""}`}
                        onClick={() => cambiarPagina(paginaActual + 1)}
                    >
                        &#8594;
                    </div>
                </div>
            )}

            {isCrearModalOpen && (
                <div className="overlay-popup" onClick={closeCrearModal}>
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup3">
                            <h2 className="titulo-usuario">{pasoActual === 1 ? "Crear cita" : "Agregar servicios"}</h2>

                            {pasoActual === 1 && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const errores = {}
                                        if (!clienteSeleccionado) errores.cliente = "Debes seleccionar un cliente"
                                        if (!formCita.manicurista) errores.manicurista = "La manicurista es obligatoria"
                                        if (!formCita.fecha) errores.fecha = "La fecha es obligatoria"
                                        if (!formCita.hora) {
                                            errores.hora = "La hora es obligatoria"
                                        } else if (!horaEsValida(formatearHoraAMPM(formCita.hora))) {
                                            errores.hora = "Manicurista no disponible a esa hora"
                                        } else if (esNoRecomendable(formCita.hora)) {
                                            errores.hora = "Advertencia: hay una cita muy cerca de esta hora"
                                        }
                                        if (!formCita.descripcion) errores.descripcion = "La descripción es obligatoria"

                                        setErroresCita(errores)

                                        const hayErrores = Object.keys(errores).length > 0

                                        if (hayErrores) {
                                            const mensaje = errores.hora?.startsWith("Advertencia")
                                                ? errores.hora
                                                : "Por favor completa todos los campos obligatorios antes de continuar."

                                            Swal.fire({
                                                icon: errores.hora?.startsWith("Advertencia") ? "warning" : "error",
                                                title: errores.hora?.startsWith("Advertencia") ? "Advertencia de agenda" : "Campos incompletos",
                                                text: mensaje,
                                                confirmButtonColor: "#d33",
                                                confirmButtonText: "Entendido",
                                            })
                                            return
                                        }
                                        setPasoActual(2)
                                    }}
                                    className="space-y-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Nombre del cliente:</label>
                                                <input
                                                    className="input-select"
                                                    type="text"
                                                    value={clienteSeleccionado}
                                                    onChange={(e) => {
                                                        const texto = e.target.value
                                                        setClienteSeleccionado(texto)

                                                        const resultados = clientes.filter(
                                                            (cli) =>
                                                                `${cli.nombre} ${cli.apellido}`.toLowerCase().includes(texto.toLowerCase()) ||
                                                                cli.numero_documento?.toString().includes(texto),
                                                        )

                                                        setSugerenciasCliente(resultados)

                                                        if (texto !== "") {
                                                            setErroresCita((prev) => ({ ...prev, cliente: "" }))
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!clienteSeleccionado) {
                                                            setErroresCita((prev) => ({ ...prev, cliente: "Debes seleccionar un cliente" }))
                                                        }
                                                    }}
                                                    placeholder="Busca cliente *"
                                                />
                                                {sugerenciasCliente.length > 0 && (
                                                    <ul className="resultado-lista">
                                                        {sugerenciasCliente.map((cli, index) => (
                                                            <li
                                                                key={index}
                                                                className="resultado-item"
                                                                onMouseDown={() => {
                                                                    setClienteSeleccionado(`${cli.nombre} ${cli.apellido}`)
                                                                    setFormCita((prev) => ({ ...prev, cliente: cli.usuario_id }))
                                                                    setErroresCita((prev) => ({ ...prev, cliente: "" }))
                                                                    setSugerenciasCliente([])
                                                                }}
                                                            >
                                                                {cli.nombre} {cli.apellido} - {cli.numero_documento}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {erroresCita.cliente && <p className="error-texto">{erroresCita.cliente}</p>}
                                            </div>

                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Nombre de la manicurista:</label>
                                                <select
                                                    name="manicurista"
                                                    className="input-select"
                                                    value={formCita.manicurista}
                                                    onChange={(e) => {
                                                        setFormCita((prev) => ({ ...prev, manicurista: e.target.value }))
                                                        if (e.target.value !== "") setErroresCita((prev) => ({ ...prev, manicurista: "" }))
                                                    }}
                                                    onBlur={() => {
                                                        if (!formCita.manicurista)
                                                            setErroresCita((prev) => ({ ...prev, manicurista: "La manicurista es obligatoria" }))
                                                    }}
                                                >
                                                    <option value="">Selecciona manicurista *</option>
                                                    {manicuristas.map((manicurista) => (
                                                        <option key={manicurista.usuario_id} value={manicurista.usuario_id}>
                                                            {manicurista.nombre} {manicurista.apellido}
                                                        </option>
                                                    ))}
                                                </select>
                                                {erroresCita.manicurista && <p className="error-texto">{erroresCita.manicurista}</p>}
                                            </div>
                                        </div>

                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <div className="mb-4">
                                                    <label className="subtitulo-editar-todos">Fecha:</label>
                                                    {showIngresoDateInput || formCita.fecha ? (
                                                        <input
                                                            type="date"
                                                            id="fechaIngreso"
                                                            name="fechaIngreso"
                                                            className="input-fecha-activo-fecha-cita"
                                                            value={formCita.fecha}
                                                            min={today}
                                                            onChange={(e) => {
                                                                const valorIngresado = e.target.value
                                                                setFormCita((prev) => ({ ...prev, fecha: valorIngresado }))

                                                                if (!valorIngresado) {
                                                                    setErroresCita((prev) => ({ ...prev, fecha: "La fecha es obligatoria" }))
                                                                } else {
                                                                    setErroresCita((prev) => ({ ...prev, fecha: "" }))
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                if (!formCita.fecha) {
                                                                    setErroresCita((prev) => ({ ...prev, fecha: "La fecha es obligatoria" }))
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            onClick={() => setShowIngresoDateInput(true)}
                                                            className="input-fecha-placeholder-fecha-cita"
                                                        >
                                                            Fecha de la cita *
                                                        </div>
                                                    )}
                                                </div>
                                                {erroresCita.fecha && <p className="error-texto">{erroresCita.fecha}</p>}
                                            </div>

                                            <div className="campo" style={{ position: "relative" }}>
                                                <label className="subtitulo-editar-todos">Hora:</label>
                                                <input
                                                    type="text"
                                                    className="input-select"
                                                    placeholder="Ej: 8:30 AM"
                                                    value={horaInput}
                                                    onChange={handleHoraChange}
                                                    onBlur={() => {
                                                        setTimeout(() => setSugerenciasHora([]), 100)
                                                        const valor = horaInput

                                                        if (!valor) {
                                                            setErroresCita((prev) => ({ ...prev, hora: "La hora es obligatoria" }))
                                                        } else {
                                                            const esValida = horaEsValida(valor)
                                                            const hora24 = convertirHoraA24(valor)
                                                            let mensaje = ""

                                                            if (!esValida) {
                                                                mensaje = "Manicurista no disponible a esa hora"
                                                            } else if (hora24 && esNoRecomendable(hora24)) {
                                                                mensaje = "Advertencia: hay una cita muy cerca de esta hora"
                                                            }

                                                            setErroresCita((prev) => ({ ...prev, hora: mensaje }))

                                                            if (esValida && hora24) {
                                                                setFormCita((prev) => ({ ...prev, hora: hora24 }))
                                                            }
                                                        }
                                                    }}
                                                />
                                                {sugerenciasHora.length > 0 && (
                                                    <ul className="resultado-lista">
                                                        {sugerenciasHora.map((hora) => (
                                                            <li
                                                                key={hora}
                                                                className="resultado-item"
                                                                onMouseDown={() => {
                                                                    setHoraInput(hora)
                                                                    setFormCita((prev) => ({ ...prev, hora: convertirHoraA24(hora) }))
                                                                    setSugerenciasHora([])
                                                                    setErroresCita((prev) => ({ ...prev, hora: "" }))
                                                                }}
                                                            >
                                                                {hora}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {mensajeHorasVacias && <p className="error-texto">{mensajeHorasVacias}</p>}

                                                {erroresCita.hora && <p className="error-texto">{erroresCita.hora}</p>}
                                            </div>
                                        </div>
                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Descripción:</label>
                                                <input
                                                    type="text"
                                                    placeholder="Descripción *"
                                                    className="input-texto"
                                                    value={formCita.descripcion}
                                                    onChange={(e) => {
                                                        setFormCita((prev) => ({ ...prev, descripcion: e.target.value }))
                                                        if (e.target.value !== "") setErroresCita((prev) => ({ ...prev, descripcion: "" }))
                                                    }}
                                                    onBlur={() => {
                                                        if (!formCita.descripcion)
                                                            setErroresCita((prev) => ({ ...prev, descripcion: "La descripción es obligatoria" }))
                                                    }}
                                                />
                                                {erroresCita.descripcion && <p className="error-texto">{erroresCita.descripcion}</p>}
                                            </div>
                                        </div>

                                        <div className="button-container">
                                            <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-crear"
                                                onClick={handlePasoUno}
                                                disabled={validandoDisponibilidad}
                                            >
                                                {validandoDisponibilidad ? "Validando..." : "Continuar"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {pasoActual === 2 && (
                                <>
                                    <div className="modal-form-row">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Servicios:</label>
                                            <input
                                                type="text"
                                                className="input-texto modal-input"
                                                placeholder="Servicio *"
                                                value={servicioSeleccionado?.nombre || ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value
                                                    if (servicioSeleccionado) {
                                                        setServicioSeleccionado({ ...servicioSeleccionado, nombre: valor })
                                                    } else {
                                                        setServicioSeleccionado({ id: "", nombre: valor, precio: 0 })
                                                    }
                                                    setModalErrores((prev) => ({ ...prev, servicio: "" }))
                                                    const filtrados = serviciosDisponibles.filter((ser) =>
                                                        ser.nombre.toLowerCase().includes(valor.toLowerCase()),
                                                    )
                                                    setSugerenciasServicio(filtrados)
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => setSugerenciasServicio([]), 150)
                                                }}
                                                onFocus={() => {
                                                    if (servicioSeleccionado?.nombre) {
                                                        const filtrados = serviciosDisponibles.filter((ser) =>
                                                            ser.nombre.toLowerCase().includes(servicioSeleccionado.nombre.toLowerCase()),
                                                        )
                                                        setSugerenciasServicio(filtrados)
                                                    }
                                                }}
                                            />
                                            {sugerenciasServicio && sugerenciasServicio.length > 0 && (
                                                <ul className="resultado-lista">
                                                    {sugerenciasServicio.map((ser) => (
                                                        <li
                                                            key={ser.id}
                                                            className="resultado-item"
                                                            onMouseDown={() => {
                                                                setServicioSeleccionado(ser)
                                                                setPrecioUnitario(ser.precio)
                                                                setSugerenciasServicio([])
                                                                setModalErrores((prev) => ({
                                                                    ...prev,
                                                                    servicio: "",
                                                                    precio: ser.precio > 0 ? "" : "El precio no puede ser 0",
                                                                }))
                                                            }}
                                                        >
                                                            {ser.nombre} - ${ser.precio.toLocaleString("es-CO")} - {ser.duracion} min
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {modalErrores.servicio && <p className="error-texto">{modalErrores.servicio}</p>}
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Precio unitario:</label>
                                            <input
                                                type="number"
                                                className="input-texto modal-input"
                                                value={precioUnitario}
                                                min={0}
                                                onChange={(e) => {
                                                    const nuevoPrecio = Number(e.target.value)
                                                    setPrecioUnitario(nuevoPrecio)
                                                    setModalErrores((prev) => ({
                                                        ...prev,
                                                        precio: nuevoPrecio > 0 ? "" : "El precio no puede ser 0",
                                                    }))
                                                }}
                                                placeholder="Precio Unitario"
                                            />
                                            {modalErrores.precio && <p className="error-texto">{modalErrores.precio}</p>}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "center", margin: "16px 0" }}>
                                        <button
                                            type="button"
                                            className="btn-agregar"
                                            onClick={() => {
                                                if (!servicioSeleccionado || !precioUnitario) {
                                                    setModalErrores({
                                                        servicio: !servicioSeleccionado ? "Selecciona un servicio" : "",
                                                        precio: !precioUnitario ? "El precio no puede ser 0" : "",
                                                    })
                                                    return
                                                }

                                                if (typeof indiceEditando === "number" && indiceEditando >= 0) {
                                                    const nuevos = [...serviciosSeleccionados]
                                                    nuevos[indiceEditando] = {
                                                        id: servicioSeleccionado.id,
                                                        nombre: servicioSeleccionado.nombre,
                                                        precioUnitario: Number(precioUnitario),
                                                    }
                                                    setServiciosSeleccionados(nuevos)
                                                    setIndiceEditando(null)
                                                } else if (serviciosSeleccionados.some((s) => s.id === servicioSeleccionado.id)) {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: "Servicio ya agregado",
                                                        text: "Este servicio ya está en la lista.",
                                                        confirmButtonColor: "#d33",
                                                        confirmButtonText: "Entendido",
                                                    })
                                                    return
                                                } else {
                                                    setServiciosSeleccionados([
                                                        ...serviciosSeleccionados,
                                                        {
                                                            id: servicioSeleccionado.id,
                                                            nombre: servicioSeleccionado.nombre,
                                                            precioUnitario: Number(precioUnitario),
                                                            duracion: servicioSeleccionado.duracion,
                                                        },
                                                    ])
                                                }
                                                setServicioSeleccionado(null)
                                                setPrecioUnitario(0)
                                                setModalErrores({})
                                            }}
                                        >
                                            {typeof indiceEditando === "number" ? "Guardar cambios" : "Agregar servicio"}
                                        </button>
                                    </div>

                                    <div className="servicios-agregados-modal">
                                        <h4>Servicios agregados:</h4>
                                        {serviciosSeleccionados.length === 0 ? (
                                            <p>No has agregado servicios aún.</p>
                                        ) : (
                                            <div className="grid-insumos-modal">
                                                {serviciosSeleccionados.map((ser, index) => (
                                                    <div key={index} className="servicio-item-modal">
                                                        {ser.nombre} - ${ser.precioUnitario.toLocaleString("es-CO")} - {ser.duracion} min
                                                        <div className="servicio-item-actions space-x-2">
                                                            <button
                                                                className="btn-editar-servicio-agregar"
                                                                onClick={() => {
                                                                    setServicioSeleccionado(ser)
                                                                    setPrecioUnitario(ser.precioUnitario)
                                                                    setIndiceEditando(index)
                                                                }}
                                                                title="Editar"
                                                                type="button"
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                className="btn-eliminar-servicio-agregar"
                                                                onClick={() => {
                                                                    setServiciosSeleccionados(serviciosSeleccionados.filter((_, i) => i !== index))
                                                                    if (indiceEditando === index) {
                                                                        setServicioSeleccionado(null)
                                                                        setPrecioUnitario(0)
                                                                        setIndiceEditando(null)
                                                                    }
                                                                }}
                                                                title="Eliminar"
                                                                type="button"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="fila-formulario" style={{ marginTop: 16 }}>
                                        <input
                                            type="text"
                                            value={`Total: $${serviciosSeleccionados.reduce((acc, ser) => acc + Number(ser.precioUnitario), 0).toLocaleString()}`}
                                            className="input-texto"
                                            readOnly
                                        />
                                    </div>

                                    <div className="button-container">
                                        <button type="button" className="btn-cancelar" onClick={() => setPasoActual(1)}>
                                            Volver
                                        </button>
                                        <button type="button" className="btn-crear" onClick={handleCrearCita} disabled={isLoading}>
                                            {isLoading ? "Creando..." : "Crear cita"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isEditarModalOpen && (
                <div className="overlay-popup" onClick={closeEditarModal}>
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup3">
                            <h2 className="titulo-usuario">
                                {modoVisualizacion ? "Detalles de la cita" : pasoEdicion === 1 ? "Editar cita" : "Editar servicios"}
                            </h2>

                            {pasoEdicion === 1 && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        if (modoVisualizacion) return

                                        const errores = {}
                                        if (!clienteEdicionSeleccionado) errores.cliente = "Debes seleccionar un cliente"
                                        if (!formEdicion.manicurista) errores.manicurista = "La manicurista es obligatoria"
                                        if (!formEdicion.fecha) errores.fecha = "La fecha es obligatoria"
                                        // En el onSubmit del formulario de edición (pasoEdicion === 1), reemplazar la validación de hora:
                                        if (!formEdicion.hora) {
                                            errores.hora = "La hora es obligatoria"
                                        } else {
                                            // Solo validar disponibilidad si cambió la hora, fecha o manicurista
                                            const cambioHora = formEdicion.hora !== valoresOriginalesCita.hora
                                            const cambioFecha = formEdicion.fecha !== valoresOriginalesCita.fecha
                                            const cambioManicurista = formEdicion.manicurista !== valoresOriginalesCita.manicurista

                                            if (cambioHora || cambioFecha || cambioManicurista) {
                                                if (!horaEsValidaEdicion(formatearHoraAMPM(formEdicion.hora))) {
                                                    errores.hora = "Manicurista no disponible a esa hora"
                                                } else if (esNoRecomendableEdicion(formEdicion.hora)) {
                                                    errores.hora = "Advertencia: hay una cita muy cerca de esta hora"
                                                }
                                            }
                                        }
                                        if (!formEdicion.descripcion) errores.descripcion = "La descripción es obligatoria"
                                        if (!formEdicion.estado) errores.estado = "El estado es obligatorio"

                                        setErroresEdicion(errores)
                                        if (Object.keys(errores).length > 0) {
                                            Swal.fire({
                                                icon: "warning",
                                                title: "Campos incompletos",
                                                text: "Por favor completa todos los campos obligatorios antes de continuar.",
                                                confirmButtonColor: "#d33",
                                                confirmButtonText: "Entendido",
                                            })
                                            return
                                        }
                                        setPasoEdicion(2)
                                    }}
                                    className="space-y-3"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Nombre del cliente:</label>
                                                <input
                                                    className={`input-select ${modoVisualizacion ? "input-solo-lectura" : ""}`}
                                                    type="text"
                                                    value={clienteEdicionSeleccionado}
                                                    onChange={(e) => {
                                                        if (modoVisualizacion) return
                                                        const texto = e.target.value
                                                        setClienteEdicionSeleccionado(texto)

                                                        const resultados = clientes.filter(
                                                            (cli) =>
                                                                `${cli.nombre} ${cli.apellido}`.toLowerCase().includes(texto.toLowerCase()) ||
                                                                cli.numero_documento?.toString().includes(texto),
                                                        )

                                                        setSugerenciasCliente(resultados)

                                                        if (texto !== "") {
                                                            setErroresEdicion((prev) => ({ ...prev, cliente: "" }))
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (modoVisualizacion) return
                                                        if (!clienteEdicionSeleccionado) {
                                                            setErroresEdicion((prev) => ({ ...prev, cliente: "Debes seleccionar un cliente" }))
                                                        }
                                                    }}
                                                    placeholder="Busca cliente *"
                                                    readOnly={modoVisualizacion}
                                                />
                                                {!modoVisualizacion && sugerenciasCliente.length > 0 && (
                                                    <ul className="resultado-lista">
                                                        {sugerenciasCliente.map((cli, index) => (
                                                            <li
                                                                key={index}
                                                                className="resultado-item"
                                                                onMouseDown={() => {
                                                                    setClienteEdicionSeleccionado(`${cli.nombre} ${cli.apellido}`)
                                                                    setFormEdicion((prev) => ({
                                                                        ...prev,
                                                                        cliente_id: cli.usuario_id,
                                                                    }))
                                                                    setErroresEdicion((prev) => ({ ...prev, cliente: "" }))
                                                                    setSugerenciasCliente([])
                                                                }}
                                                            >
                                                                {cli.nombre} {cli.apellido} - {cli.numero_documento}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {!modoVisualizacion && erroresEdicion.cliente && (
                                                    <p className="error-texto">{erroresEdicion.cliente}</p>
                                                )}
                                            </div>

                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Nombre de la manicurista:</label>
                                                {modoVisualizacion ? (
                                                    <input
                                                        className="input-select input-solo-lectura"
                                                        type="text"
                                                        value={citaSeleccionada.manicurista_nombre}
                                                        readOnly
                                                    />
                                                ) : (
                                                    <>
                                                        <select
                                                            name="manicurista"
                                                            className="input-select"
                                                            value={formEdicion.manicurista}
                                                            onChange={(e) => {
                                                                setFormEdicion((prev) => ({ ...prev, manicurista: e.target.value }))
                                                                if (e.target.value !== "") setErroresEdicion((prev) => ({ ...prev, manicurista: "" }))
                                                            }}
                                                            onBlur={() => {
                                                                if (!formEdicion.manicurista)
                                                                    setErroresEdicion((prev) => ({
                                                                        ...prev,
                                                                        manicurista: "La manicurista es obligatoria",
                                                                    }))
                                                            }}
                                                        >
                                                            <option value="">Selecciona manicurista *</option>
                                                            {manicuristas.map((manicurista) => (
                                                                <option key={manicurista.usuario_id} value={manicurista.usuario_id}>
                                                                    {manicurista.nombre} {manicurista.apellido}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {erroresEdicion.manicurista && <p className="error-texto">{erroresEdicion.manicurista}</p>}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Fecha:</label>
                                                <input
                                                    type="date"
                                                    className={`input-fecha-activo-fecha-cita ${modoVisualizacion ? "input-solo-lectura" : ""}`}
                                                    value={formEdicion.fecha}
                                                    onChange={(e) => {
                                                        if (modoVisualizacion) return
                                                        setFormEdicion((prev) => ({ ...prev, fecha: e.target.value }))
                                                        if (e.target.value) setErroresEdicion((prev) => ({ ...prev, fecha: "" }))
                                                    }}
                                                    onBlur={() => {
                                                        if (modoVisualizacion) return
                                                        if (!formEdicion.fecha) {
                                                            setErroresEdicion((prev) => ({ ...prev, fecha: "La fecha es obligatoria" }))
                                                        }
                                                    }}
                                                    readOnly={modoVisualizacion}
                                                    min={today}
                                                />
                                                {!modoVisualizacion && erroresEdicion.fecha && (
                                                    <p className="error-texto">{erroresEdicion.fecha}</p>
                                                )}
                                            </div>

                                            <div className="campo" style={{ position: "relative" }}>
                                                <label className="subtitulo-editar-todos">Hora:</label>
                                                {modoVisualizacion ? (
                                                    <input
                                                        className="input-select input-solo-lectura"
                                                        type="text"
                                                        value={new Date(`1970-01-01T${citaSeleccionada.Hora}`).toLocaleTimeString("es-CO", {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })}
                                                        readOnly
                                                    />
                                                ) : (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="input-select"
                                                            placeholder="Ej: 8:30 AM"
                                                            value={horaInputEdicion}
                                                            onChange={handleHoraChangeEdicion}
                                                            onBlur={() => {
                                                                setTimeout(() => setSugerenciasHoraEdicion([]), 100)
                                                                const valor = horaInputEdicion

                                                                if (!valor) {
                                                                    setErroresEdicion((prev) => ({ ...prev, hora: "La hora es obligatoria" }))
                                                                } else {
                                                                    const esValida = horaEsValidaEdicion(valor)
                                                                    const hora24 = convertirHoraA24(valor)
                                                                    let mensaje = ""

                                                                    if (!esValida) {
                                                                        mensaje = "Manicurista no disponible a esa hora"
                                                                    } else if (hora24 && esNoRecomendableEdicion(hora24)) {
                                                                        mensaje = "Advertencia: hay una cita muy cerca de esta hora"
                                                                    }

                                                                    setErroresEdicion((prev) => ({ ...prev, hora: mensaje }))

                                                                    if (esValida && hora24) {
                                                                        setFormEdicion((prev) => ({ ...prev, hora: hora24 }))
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {sugerenciasHoraEdicion.length > 0 && (
                                                            <ul className="resultado-lista">
                                                                {sugerenciasHoraEdicion.map((hora) => (
                                                                    <li
                                                                        key={hora}
                                                                        className="resultado-item"
                                                                        onMouseDown={() => {
                                                                            setHoraInputEdicion(hora)
                                                                            setFormEdicion((prev) => ({ ...prev, hora: convertirHoraA24(hora) }))
                                                                            setSugerenciasHoraEdicion([])
                                                                            setErroresEdicion((prev) => ({ ...prev, hora: "" }))
                                                                        }}
                                                                    >
                                                                        {hora}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {mensajeHorasVaciasEdicion && <p className="error-texto">{mensajeHorasVaciasEdicion}</p>}
                                                        {erroresEdicion.hora && <p className="error-texto">{erroresEdicion.hora}</p>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Descripción:</label>
                                            <input
                                                type="text"
                                                placeholder="Descripción *"
                                                className={`input-texto ${modoVisualizacion ? "input-solo-lectura" : ""}`}
                                                value={formEdicion.descripcion}
                                                onChange={(e) => {
                                                    if (modoVisualizacion) return
                                                    setFormEdicion((prev) => ({ ...prev, descripcion: e.target.value }))
                                                    if (e.target.value !== "") setErroresEdicion((prev) => ({ ...prev, descripcion: "" }))
                                                }}
                                                onBlur={() => {
                                                    if (modoVisualizacion) return
                                                    if (!formEdicion.descripcion)
                                                        setErroresEdicion((prev) => ({ ...prev, descripcion: "La descripción es obligatoria" }))
                                                }}
                                                readOnly={modoVisualizacion}
                                            />
                                            {!modoVisualizacion && erroresEdicion.descripcion && (
                                                <p className="error-texto">{erroresEdicion.descripcion}</p>
                                            )}
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Estado:</label>
                                            {modoVisualizacion ? (
                                                <input
                                                    className="input-select input-solo-lectura"
                                                    type="text"
                                                    value={citaSeleccionada.estado_nombre}
                                                    readOnly
                                                />
                                            ) : (
                                                <>
                                                    <select
                                                        name="estado"
                                                        className="input-select"
                                                        value={formEdicion.estado}
                                                        onChange={(e) => {
                                                            setFormEdicion((prev) => ({ ...prev, estado: e.target.value }))
                                                            if (e.target.value !== "") setErroresEdicion((prev) => ({ ...prev, estado: "" }))
                                                        }}
                                                        onBlur={() => {
                                                            if (!formEdicion.estado)
                                                                setErroresEdicion((prev) => ({ ...prev, estado: "El estado es obligatorio" }))
                                                        }}
                                                    >
                                                        <option value="">Selecciona estado *</option>
                                                        {estados.map((estado) => (
                                                            <option key={estado.id} value={estado.id}>
                                                                {estado.Estado}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {erroresEdicion.estado && <p className="error-texto">{erroresEdicion.estado}</p>}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {modoVisualizacion && (
                                        <div className="fila-formulario">
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Servicios:</label>
                                                <input
                                                    className="input-texto input-solo-lectura"
                                                    type="text"
                                                    value={citaSeleccionada.serviciosNombres}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="campo">
                                                <label className="subtitulo-editar-todos">Total:</label>
                                                <input
                                                    className="input-texto input-solo-lectura"
                                                    type="text"
                                                    value={new Intl.NumberFormat("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    }).format(citaSeleccionada.Total || 0)}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="button-container">
                                        <button type="button" className="btn-cancelar" onClick={closeEditarModal}>
                                            {modoVisualizacion ? "Volver" : "Cancelar"}
                                        </button>
                                        {!modoVisualizacion && (
                                            <button type="submit" className="btn-crear">
                                                Continuar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {pasoEdicion === 2 && !modoVisualizacion && (
                                <>
                                    <div className="modal-form-row">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Servicio:</label>
                                            <input
                                                type="text"
                                                className="input-texto modal-input"
                                                placeholder="Servicio *"
                                                value={servicioSeleccionado?.nombre || ""}
                                                onChange={(e) => {
                                                    const valor = e.target.value
                                                    if (servicioSeleccionado) {
                                                        setServicioSeleccionado({ ...servicioSeleccionado, nombre: valor })
                                                    } else {
                                                        setServicioSeleccionado({ id: "", nombre: valor, precio: 0 })
                                                    }
                                                    setModalErrores((prev) => ({ ...prev, servicio: "" }))
                                                    const filtrados = serviciosDisponibles.filter((ser) =>
                                                        ser.nombre.toLowerCase().includes(valor.toLowerCase()),
                                                    )
                                                    setSugerenciasServicio(filtrados)
                                                }}
                                                onBlur={() => {
                                                    setTimeout(() => setSugerenciasServicio([]), 150)
                                                }}
                                                onFocus={() => {
                                                    if (servicioSeleccionado?.nombre) {
                                                        const filtrados = serviciosDisponibles.filter((ser) =>
                                                            ser.nombre.toLowerCase().includes(servicioSeleccionado.nombre.toLowerCase()),
                                                        )
                                                        setSugerenciasServicio(filtrados)
                                                    }
                                                }}
                                            />
                                            {sugerenciasServicio && sugerenciasServicio.length > 0 && (
                                                <ul className="resultado-lista">
                                                    {sugerenciasServicio.map((ser) => (
                                                        <li
                                                            key={ser.id}
                                                            className="resultado-item"
                                                            onMouseDown={() => {
                                                                setServicioSeleccionado(ser)
                                                                setPrecioUnitario(ser.precio)
                                                                setSugerenciasServicio([])
                                                                setModalErrores((prev) => ({
                                                                    ...prev,
                                                                    servicio: "",
                                                                    precio: ser.precio > 0 ? "" : "El precio no puede ser 0",
                                                                }))
                                                            }}
                                                        >
                                                            {ser.nombre} - ${ser.precio.toLocaleString("es-CO")} - {ser.duracion} min
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {modalErrores.servicio && <p className="error-texto">{modalErrores.servicio}</p>}
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Precio unitario:</label>
                                            <input
                                                type="number"
                                                className="input-texto modal-input"
                                                value={precioUnitario}
                                                min={0}
                                                onChange={(e) => {
                                                    const nuevoPrecio = Number(e.target.value)
                                                    setPrecioUnitario(nuevoPrecio)
                                                    setModalErrores((prev) => ({
                                                        ...prev,
                                                        precio: nuevoPrecio > 0 ? "" : "El precio no puede ser 0",
                                                    }))
                                                }}
                                                placeholder="Precio Unitario"
                                            />
                                            {modalErrores.precio && <p className="error-texto">{modalErrores.precio}</p>}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "center", margin: "16px 0" }}>
                                        <button
                                            type="button"
                                            className="btn-agregar"
                                            onClick={() => {
                                                if (!servicioSeleccionado || !precioUnitario) {
                                                    setModalErrores({
                                                        servicio: !servicioSeleccionado ? "Selecciona un servicio" : "",
                                                        precio: !precioUnitario ? "El precio no puede ser 0" : "",
                                                    })
                                                    return
                                                }

                                                if (typeof indiceEditando === "number" && indiceEditando >= 0) {
                                                    const nuevos = [...serviciosEdicion]
                                                    nuevos[indiceEditando] = {
                                                        id: servicioSeleccionado.id,
                                                        nombre: servicioSeleccionado.nombre,
                                                        precioUnitario: Number(precioUnitario),
                                                    }
                                                    setServiciosEdicion(nuevos)
                                                    setIndiceEditando(null)
                                                } else if (serviciosEdicion.some((s) => s.id === servicioSeleccionado.id)) {
                                                    Swal.fire({
                                                        icon: "warning",
                                                        title: "Servicio ya agregado",
                                                        text: "Este servicio ya está en la lista.",
                                                        confirmButtonColor: "#d33",
                                                        confirmButtonText: "Entendido",
                                                    })
                                                    return
                                                } else {
                                                    setServiciosEdicion([
                                                        ...serviciosEdicion,
                                                        {
                                                            id: servicioSeleccionado.id,
                                                            nombre: servicioSeleccionado.nombre,
                                                            precioUnitario: Number(precioUnitario),
                                                            duracion: servicioSeleccionado.duracion,
                                                        },
                                                    ])
                                                }
                                                setServicioSeleccionado(null)
                                                setPrecioUnitario(0)
                                                setModalErrores({})
                                            }}
                                        >
                                            {typeof indiceEditando === "number" ? "Guardar cambios" : "Agregar servicio"}
                                        </button>
                                    </div>

                                    <div className="servicios-agregados-modal">
                                        <h4>Servicios agregados:</h4>
                                        {serviciosEdicion.length === 0 ? (
                                            <p>No has agregado servicios aún.</p>
                                        ) : (
                                            <div className="grid-insumos-modal">
                                                {serviciosEdicion.map((ser, index) => (
                                                    <div key={index} className="servicio-item-modal">
                                                        {ser.nombre} - ${(ser.precioUnitario || ser.precio).toLocaleString("es-CO")} -{" "}
                                                        {ser.duracion} min
                                                        <div className="servicio-item-actions space-x-2">
                                                            <button
                                                                className="btn-editar-servicio-agregar"
                                                                onClick={() => {
                                                                    setServicioSeleccionado(ser)
                                                                    setPrecioUnitario(ser.precioUnitario || ser.precio)
                                                                    setIndiceEditando(index)
                                                                }}
                                                                title="Editar"
                                                                type="button"
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                className="btn-eliminar-servicio-agregar"
                                                                onClick={() => {
                                                                    setServiciosEdicion(serviciosEdicion.filter((_, i) => i !== index))
                                                                    if (indiceEditando === index) {
                                                                        setServicioSeleccionado(null)
                                                                        setPrecioUnitario(0)
                                                                        setIndiceEditando(null)
                                                                    }
                                                                }}
                                                                title="Eliminar"
                                                                type="button"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="fila-formulario" style={{ marginTop: 16 }}>
                                        <input
                                            type="text"
                                            value={`Total: $${serviciosEdicion.reduce((acc, ser) => acc + Number(ser.precioUnitario || ser.precio), 0).toLocaleString()}`}
                                            className="input-texto"
                                            readOnly
                                        />
                                    </div>

                                    <div className="button-container">
                                        <button type="button" className="btn-cancelar" onClick={() => setPasoEdicion(1)}>
                                            Volver
                                        </button>
                                        <button type="button" className="btn-crear" onClick={handleEditarCita} disabled={isLoading}>
                                            {isLoading ? "Actualizando..." : "Actualizar cita"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="overlay-popup-notifications" onClick={closeModal}>
                    <div className="ventana-popup-notifications" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup-notifications">
                            <div className="notifications-header">
                                <h1 className="notifications-title">Centro de calificaciones</h1>
                                <button onClick={closeModal} className="close-button">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="tabs-container">
                                <button
                                    className={`tab-button ${tabActiva === "calificaciones" ? "tab-active" : "tab-inactive"}`}
                                    onClick={() => setTabActiva("calificaciones")}
                                >
                                    <div className="tab-content">
                                        <Star className="w-4 h-4" />
                                        Calificaciones
                                        {calificacionesNoVistas > 0 && <span className="tab-badge">{calificacionesNoVistas}</span>}
                                    </div>
                                </button>
                            </div>

                            {/* Contenido de las pestañas mejorado */}
                            <div className="tab-content-container">
                                
                                {tabActiva === "calificaciones" && (
                                    <div className="tab-panel">
                                        <h2 className="section-title">Calificaciones Recibidas</h2>
                                        {loadingCalificaciones ? (
                                            <div className="loading-state">
                                                <div className="loading-spinner"></div>
                                                <p>Cargando calificaciones...</p>
                                            </div>
                                        ) : calificaciones.length === 0 ? (
                                            <div className="empty-state">
                                                <Star className="empty-icon" />
                                                <p>No hay calificaciones disponibles.</p>
                                            </div>
                                        ) : (
                                            <ul className="ratings-list">
                                                {calificaciones
                                                    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
                                                    .map((c) => (
                                                        <li
                                                            key={c.id}
                                                            className={`rating-item ${!calificacionesVistas.has(c.id) ? "rating-unread" : "rating-read"}`}
                                                        >
                                                            <div className="rating-header">
                                                                <div className="rating-stars">
                                                                    <div className="stars-container">{getEstrellas(c.puntuacion)}</div>
                                                                    <span className="rating-text">{getPuntuacionTexto(c.puntuacion)}</span>
                                                                </div>
                                                                {!calificacionesVistas.has(c.id) && <span className="rating-dot"></span>}
                                                            </div>
                                                            {c.comentario && <p className="rating-comment">"{c.comentario}"</p>}
                                                            <p className="rating-date">{formatearFecha(c.fecha_creacion)}</p>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button className="close-modal-button" onClick={closeModal}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GestionCitas
