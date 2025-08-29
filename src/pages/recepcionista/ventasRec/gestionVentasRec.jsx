import { useEffect, useState } from "react"
import "../../../css/gestionar.css"
import "../../../css/ventas.css"
import { AiOutlineEye, AiFillFilePdf } from "react-icons/ai"
import axios from "axios"
import Swal from "sweetalert2"
import { useTheme } from "../../tema/ThemeContext"
import { Link } from "react-router-dom"
import { Bell, User, Search, Calendar, Table, ChevronLeft, ChevronRight, Star, X } from "lucide-react"
import { listar_calificaciones } from "../../../services/calificaciones_service"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import logo from "../../../img/Logo.jpg"
import {
    listar_ventas,
    obtenerServicios,
    obtenerManicurista,
    obtenerCliente,
    verificarDisponibilidadCliente,
} from "../../../services/ventas_service"

const GestionVentasRec = () => {
    const [ventas, setVentas] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [paginaActual, setPaginaActual] = useState(1)
    const ventasPorPagina = 4
    const [isVerModalOpen, setIsVerModalOpen] = useState(false)
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
    const [serviciosVenta, setServiciosVenta] = useState([])
    const [indiceEditando, setIndiceEditando] = useState(null)
    const [editandoDesdeItems, setEditandoDesdeItems] = useState(false)
    const [indiceEditandoItem, setIndiceEditandoItem] = useState(null)
    const [errores, setErrores] = useState({})
    const { darkMode } = useTheme()
    const [manicuristas, setManicuristas] = useState([])
    const [servicios, setServicios] = useState([])
    const [ventaServicios, setVentaServicios] = useState([])
    const [clientes, setClientes] = useState([])
    const [loadingClientes, setLoadingClientes] = useState(true)
    const [errorClientes, setErrorClientes] = useState(null)
    const [clienteSeleccionado, setClienteSeleccionado] = useState("")
    const [sugerenciasCliente, setSugerenciasCliente] = useState([])
    const [tocoValidarCliente, setTocoValidarCliente] = useState(false)
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
    const [showVentaDateInput, setShowVentaDateInput] = useState(false)
    const [serviciosEnModal, setServiciosEnModal] = useState([])
    const [serviciosDisponibles, setServiciosDisponibles] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showVentaHoraInput, setShowVentaHoraInput] = useState(false)
    const [indiceEditandoServicio, setIndiceEditandoServicio] = useState(null)
    const [editandoDesdeServicios, setEditandoDesdeServicios] = useState(false)
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
    const [precioUnitario, setPrecioUnitario] = useState(0)
    const [tipoVenta, setTipoVenta] = useState("")
    const [formVenta, setFormVenta] = useState({
        cliente: "",
        manicurista: "",
        fecha_venta: "",
        hora_venta: "",
        descripcion: "",
        citaSeleccionada: "",
        tipoVenta: "",
    })
    const [erroresVenta, setErroresVenta] = useState({})
    const [datosCita, setDatosCita] = useState({ cliente: "", manicurista: "", fecha: "" })
    const [codigoCita, setCodigoCita] = useState("")
    const [citasExistentes, setCitasExistentes] = useState([])
    const [ventaDate, setVentaDate] = useState("")
    const [textoServicio, setTextoServicio] = useState("")
    const [modalErrores, setModalErrores] = useState({ servicio: "", precio: "" })
    const [sugerenciasServicio, setSugerenciasServicio] = useState([])
    const [manicuristaSeleccionado, setManicuristaSeleccionado] = useState(null)
    const [totalVenta, setTotalVenta] = useState(0)
    const [pasoActual, setPasoActual] = useState(1)
    const [todosServiciosCita, setTodosServiciosCita] = useState([])
    const [serviciosCita, setServiciosCita] = useState([])
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

    // Loading states
    const [cargandoCrearVenta, setCargandoCrearVenta] = useState(false)
    const [cargandoTerminarCita, setCargandoTerminarCita] = useState(false)

    // Autocomplete states for appointments
    const [textoBusquedaCita, setTextoBusquedaCita] = useState("")
    const [sugerenciasCita, setSugerenciasCita] = useState([])

    // Calendar state
    const [vistaActual, setVistaActual] = useState("tabla") // "tabla" o "calendario"
    const [fechaActual, setFechaActual] = useState(new Date())

    const [validandoDisponibilidad, setValidandoDisponibilidad] = useState(false)
    const [errorDisponibilidad, setErrorDisponibilidad] = useState("")
    const [setCitaEncontrada] = useState(null)
    const [setFechaBusquedaCita] = useState("")
    const [setResultadoBusqueda] = useState(null)
    const [setMostrarModal] = useState(false)

    const exportarPDF = (ventaId) => {
        const modal = document.getElementById("factura-modal")
        if (!modal) return

        const originalStyle = modal.getAttribute("style")
        modal.style.maxHeight = "none"
        modal.style.overflow = "visible"

        const btnVolver = modal.querySelector(".ocultar-al-exportar")
        if (btnVolver) btnVolver.classList.add("ocultar-en-pdf")

        html2canvas(modal, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY,
            windowWidth: modal.scrollWidth,
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png")

            const pdf = new jsPDF("landscape", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            const canvasWidthMM = canvas.width * 0.264583
            const canvasHeightMM = canvas.height * 0.264583
            const scale = Math.min(pdfWidth / canvasWidthMM, pdfHeight / canvasHeightMM)

            const renderWidth = canvasWidthMM * scale
            const renderHeight = canvasHeightMM * scale

            const marginX = (pdfWidth - renderWidth) / 2
            const marginY = (pdfHeight - renderHeight) / 2

            pdf.addImage(imgData, "PNG", marginX, marginY, renderWidth, renderHeight)
            pdf.save(`Factura_venta_${ventaId}.pdf`)

            if (btnVolver) btnVolver.classList.remove("ocultar-en-pdf")

            if (originalStyle !== null) {
                modal.setAttribute("style", originalStyle)
            } else {
                modal.removeAttribute("style")
            }
        })
    }

    const fetchVentas = async () => {
        const data = await listar_ventas()
        // Ordenar las ventas por ID de forma ascendente para que las nuevas aparezcan al final
        const ventasOrdenadas = data.sort((a, b) => a.id - b.id)
        setVentas(ventasOrdenadas)
    }

    useEffect(() => {
        fetchVentas()
    }, [])

    useEffect(() => {
        fetch("https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/")
            .then((res) => res.json())
            .then((data) => setManicuristas(data))
    }, [])

    useEffect(() => {
        fetch("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
            .then((res) => res.json())
            .then((data) => setServicios(data))
    }, [])

    const buscarServicioPorId = (id) => {
        return servicios.find((servicio) => servicio.id === id)
    }

    const obtenerVentaServiciosPorVenta = async (venta_id) => {
        try {
            const res = await fetch(`https://angelsuarez.pythonanywhere.com/api/ventas/venta-servicios/?venta_id=${venta_id}`)
            if (!res.ok) throw new Error("Error al cargar servicios")
            return await res.json()
        } catch (error) {
            console.error("Error:", error)
            return []
        }
    }

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase())
        setPaginaActual(1)
    }

    const ventasFiltradas = ventas.filter((venta) =>
        Object.values(venta).some((valor) => String(valor).toLowerCase().includes(busqueda)),
    )

    const ventasFiltradasTerminadas = ventasFiltradas.filter((venta) => venta.estado_nombre === "Terminada")

    const indexUltimo = paginaActual * ventasPorPagina
    const indexPrimero = indexUltimo - ventasPorPagina

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina)
        }
    }

    const totalPaginas = Math.ceil(ventasFiltradasTerminadas.length / ventasPorPagina)

    const ventasActuales = ventasFiltradasTerminadas.slice(
        (paginaActual - 1) * ventasPorPagina,
        paginaActual * ventasPorPagina,
    )

    useEffect(() => {
        const obtenerClientes = async () => {
            try {
                const res = await fetch("https://angelsuarez.pythonanywhere.com/api/usuario/clientes/")
                if (!res.ok) throw new Error("Error al cargar clientes")
                const data = await res.json()
                setClientes(data)
            } catch (error) {
                console.error("Error cargando clientes:", error)
                setErrorClientes(error.message)
            } finally {
                setLoadingClientes(false)
            }
        }

        obtenerClientes()
    }, [])

    const buscarClientePorId = (id) => {
        return clientes.find((cliente) => cliente.id === id)
    }

    const obtenerNombreCliente = (cliente) => {
        if (!cliente) return "Cliente no encontrado"
        return `${cliente.nombre} ${cliente.apellido}`
    }

    const openVerModal = async (venta) => {
        try {
            console.log("Venta recibida:", venta)

            const servicios = await obtenerServicios(venta.id)
            console.log("Servicios de la venta:", servicios)

            const serviciosCompletos = servicios

            const cliente = await obtenerCliente(venta.cliente_id)
            console.log("Cliente:", cliente)

            const manicurista = await obtenerManicurista(venta.manicurista_id)
            console.log("Manicurista:", manicurista)

            setVentaSeleccionada({
                ...venta,
                cliente,
                manicurista,
            })

            console.log("Servicios completos:", serviciosCompletos)
            setVentaServicios(serviciosCompletos || [])

            setIsVerModalOpen(true)
        } catch (error) {
            console.error("Error al cargar la venta completa:", error)
        }
    }

    const closeVerModal = () => {
        setIsVerModalOpen(false)
        setVentaSeleccionada(null)
        setServiciosVenta([])
    }

    const handleTipoChange = (e) => {
        setTipoVenta(e.target.value)
        setDatosCita({ cliente: "", manicurista: "", fecha: "" })
    }

    const closeCrearModal = () => {
        setIsCrearModalOpen(false)
        setShowVentaHoraInput(false)
        setTipoVenta("")
        setErrorDisponibilidad("")
        setCargandoCrearVenta(false)
        setCargandoTerminarCita(false)
        setTextoBusquedaCita("")
        setSugerenciasCita([])

        if (tipoVenta === "Directa") {
            setServiciosSeleccionados([])
            setShowVentaHoraInput(false)
            setShowVentaDateInput(false)
            setClienteSeleccionado("")
            setTocoValidarCliente(false)
        }

        setFormVenta({
            manicurista: "",
            fecha_venta: "",
            hora_venta: "",
            tipo_venta: "",
            cliente: "",
            descripcion: "",
        })

        setErroresVenta({})
        setServicios([])
        setPasoActual(1)

        if (tipoVenta === "Cita") {
            setCitaEncontrada(null)
            setCodigoCita("")
            setFechaBusquedaCita("")
            setResultadoBusqueda(null)
            setTipoVenta("")
        }

        setServiciosEnModal([])
        setServiciosCita([])
        setDatosCita({ cliente: "", manicurista: "", fecha: "" })
        setServicioSeleccionado(null)
        setPrecioUnitario(0)
        setTextoServicio("")
        setModalErrores({ servicio: "", precio: "" })
        setSugerenciasServicio([])
        setIndiceEditando(null)
        setEditandoDesdeServicios(false)
        setIndiceEditandoServicio(null)

        fetchVentas()
        setServicios([])
        setPasoActual(1)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormVenta((prev) => ({ ...prev, [name]: value }))
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        validarCampo(name, value)
    }

    const validarCampo = (name, value) => {
        const nuevosErrores = { ...erroresVenta }
        if (!value) {
            nuevosErrores[name] = "Este campo es obligatorio"
        } else {
            delete nuevosErrores[name]
        }
        setErroresVenta(nuevosErrores)
    }

    const validarDisponibilidad = async () => {
        if (!formVenta.cliente || !formVenta.fecha_venta || !formVenta.hora_venta) {
            return false
        }

        setValidandoDisponibilidad(true)
        setErrorDisponibilidad("")

        try {
            const disponibilidadCliente = await verificarDisponibilidadCliente(
                formVenta.cliente,
                formVenta.fecha_venta,
                formVenta.hora_venta,
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

    const guardarServiciosDelModal = () => {
        if (serviciosEnModal.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor agrega al menos un servicio antes de continuar.",
                customClass: { popup: "swal-rosado" },
            })

            setModalErrores({
                servicio: "Debes seleccionar un servicio",
                precio: "El precio no puede ser 0",
            })

            return
        }

        const total = serviciosEnModal.reduce((sum, s) => sum + Number(s.precioUnitario || 0), 0)

        if (tipoVenta === "Cita") {
            setServiciosCita((prev) => [
                ...prev,
                ...serviciosEnModal.map((s) => ({
                    servicio_nombre: s.nombre,
                    subtotal: s.precioUnitario,
                })),
            ])
        }

        setModalErrores("")
        setServiciosEnModal([])
        setShowModal(false)
        setMostrarModal(false)
    }

    const validarCamposVenta = () => {
        const errores = {}

        if (!formVenta.tipoVenta) errores.tipoVenta = "Debes seleccionar un tipo de venta"
        if (!formVenta.cliente) errores.cliente = "El cliente es obligatorio"
        if (!formVenta.manicurista) errores.manicurista = "La manicurista es obligatoria"
        if (!formVenta.fecha_venta) errores.fecha_venta = "La fecha de venta es obligatoria"
        if (!formVenta.hora_venta) errores.hora_venta = "La hora es obligatoria"
        if (!formVenta.descripcion) errores.descripcion = "La descripción es obligatoria"

        if (tipoVenta === "Cita") {
            if (!codigoCita) errores.cita = "La fecha es obligatoria"
        }

        setErroresVenta(errores)

        if (Object.keys(errores).length > 0) {
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: "swal-rosado" },
            })
            return false
        }

        return true
    }

    const handlePasoUno = async () => {
        if (tipoVenta === "Cita") {
            setPasoActual(2)
            return
        }

        if (tipoVenta === "Directa") {
            const esValido = validarCamposVenta()
            if (!esValido) return

            const disponibilidadValida = await validarDisponibilidad()
            if (!disponibilidadValida) {
                return
            }

            setPasoActual(2)
        }
    }

    const handleCrear = async (e) => {
        e.preventDefault()

        if (tipoVenta === "Directa") {
            setCargandoCrearVenta(true)

            const errores = {}

            if (!formVenta.fecha_venta) errores.fecha_venta = "La fecha es obligatoria"
            if (!formVenta.hora_venta) errores.hora_venta = "La hora es obligatoria"
            if (!formVenta.cliente) errores.cliente = "Selecciona un cliente"
            if (!formVenta.manicurista) errores.manicurista = "Selecciona una manicurista"
            if (!formVenta.descripcion.trim()) errores.descripcion = "La descripción es obligatoria"

            if (Object.keys(errores).length > 0) {
                setErroresVenta((prev) => ({ ...prev, ...errores }))
                setCargandoCrearVenta(false)
                Swal.fire({
                    icon: "warning",
                    title: "Campos incompletos",
                    text: "Por favor, completa todos los campos obligatorios.",
                    customClass: { popup: "swal-rosado" },
                })
                return
            }

            let serviciosFinales = [...serviciosSeleccionados]

            if (serviciosEnModal.length > 0) {
                serviciosFinales = [...serviciosFinales, ...serviciosEnModal]
                setServiciosSeleccionados(serviciosFinales)
                setServiciosEnModal([])
            }

            if (serviciosFinales.length === 0) {
                setCargandoCrearVenta(false)
                Swal.fire({
                    icon: "warning",
                    title: "Sin servicios",
                    text: "Agrega y guarda al menos un servicio antes de crear la venta.",
                    customClass: { popup: "swal-rosado" },
                })
                return
            }

            const serviciosInvalidos = serviciosSeleccionados.filter((s) => s.precioUnitario <= 0)
            if (serviciosInvalidos.length > 0) {
                setCargandoCrearVenta(false)
                Swal.fire({
                    icon: "warning",
                    title: "Precios inválidos",
                    text: "Verifica que todos los servicios tengan un precio mayor a 0.",
                    customClass: { popup: "swal-rosado" },
                })
                return
            }

            const confirmacion = await Swal.fire({
                title: "¿Estás seguro?",
                text: "Vas a crear una venta con los datos y servicios ingresados.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, crear venta",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                customClass: { popup: "swal-rosado" },
            })

            if (!confirmacion.isConfirmed) {
                setCargandoCrearVenta(false)
                return
            }

            console.log("🔍 Datos del formulario antes de crear venta:", {
                formVenta,
                serviciosFinales,
                totalVenta,
                clienteSeleccionado,
                tipoVenta,
            })

            try {
                const citaPayload = {
                    Fecha: formVenta.fecha_venta,
                    Hora: formVenta.hora_venta,
                    Descripcion: formVenta.descripcion,
                    cliente_id: formVenta.cliente,
                    manicurista_id: formVenta.manicurista,
                    Total: totalVenta,
                }

                console.log("📤 Enviando payload para venta directa:", citaPayload)

                const resVenta = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/venta-directa/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(citaPayload),
                })

                console.log("📥 Respuesta del servidor:", resVenta.status, resVenta.statusText)

                if (!resVenta.ok) {
                    let errorMessage = "Error al crear la cita-venta"
                    try {
                        const errorData = await resVenta.json()
                        console.error("❌ Error del servidor:", errorData)
                        errorMessage = errorData.message || errorData.detail || JSON.stringify(errorData)
                    } catch (parseError) {
                        console.error("❌ No se pudo parsear el error del servidor")
                        const errorText = await resVenta.text()
                        console.error("❌ Respuesta del servidor (texto):", errorText)
                        errorMessage = `Error ${resVenta.status}: ${errorText || resVenta.statusText}`
                    }

                    setCargandoCrearVenta(false)
                    Swal.fire({
                        icon: "error",
                        title: "Error del servidor",
                        text: errorMessage,
                        customClass: { popup: "swal-rosado" },
                    })
                    return
                }

                const ventaData = await resVenta.json()
                console.log("✅ Venta creada exitosamente:", ventaData)
                const citaId = ventaData.data?.id || ventaData.id

                if (!citaId) {
                    console.error("❌ No se recibió ID de la cita creada:", ventaData)
                    setCargandoCrearVenta(false)
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se pudo obtener el ID de la venta creada",
                        customClass: { popup: "swal-rosado" },
                    })
                    return
                }

                console.log("🔄 Guardando servicios para la cita ID:", citaId)

                for (const s of serviciosFinales) {
                    const servicioPayload = {
                        servicio_id: s.id,
                        cita_id: citaId,
                        subtotal: Number(s.precioUnitario),
                    }

                    console.log("📤 Enviando servicio:", servicioPayload)

                    const resServicio = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(servicioPayload),
                    })

                    if (!resServicio.ok) {
                        const errorText = await resServicio.text()
                        console.error("❌ Error al guardar servicio:", errorText)
                        throw new Error(`Error al guardar servicio: ${errorText}`)
                    }

                    const servicioData = await resServicio.json()
                    console.log("✅ Servicio guardado:", servicioData)
                }

                setCargandoCrearVenta(false)
                Swal.fire({
                    icon: "success",
                    title: "Venta creada",
                    text: "Venta y servicios creados exitosamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: "swal-rosado" },
                })

                await fetchVentas()
            } catch (err) {
                console.error("❌ Error completo en la creación de venta directa:", err)
                console.error("❌ Stack trace:", err.stack)

                setCargandoCrearVenta(false)
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Ocurrió un error al guardar la venta: ${err.message}`,
                    customClass: { popup: "swal-rosado" },
                })
                return
            }
        } else if (tipoVenta === "Cita") {
            setCargandoTerminarCita(true)

            try {
                const resActualizar = await fetch(`https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/${codigoCita}/terminar/`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                })

                if (!resActualizar.ok) throw new Error("Error al terminar la cita")

                setCargandoTerminarCita(false)
                Swal.fire({
                    icon: "success",
                    title: "Cita terminada",
                    text: "La cita ha sido finalizada exitosamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: "swal-rosado" },
                })

                await fetchVentas()
            } catch (err) {
                console.error("Error al finalizar la cita:", err)
                setCargandoTerminarCita(false)
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ocurrió un error al finalizar la cita.",
                    customClass: { popup: "swal-rosado" },
                })
                return
            }
        }

        setServiciosSeleccionados([])
        setServiciosEnModal([])

        await fetchVentas()
        closeCrearModal()
    }

    const agregarServicioAlModal = () => {
        const errores = {}

        if (!servicioSeleccionado) {
            errores.servicio = "Debes seleccionar un servicio"
        }

        if (!precioUnitario || precioUnitario <= 0) {
            errores.precio = "El precio no puede ser 0"
        }

        setModalErrores(errores)

        if (Object.keys(errores).length > 0) return

        const yaExiste = servicios.some((s) => s.nombre === servicioSeleccionado)
        if (yaExiste) return

        const nuevoServicio = {
            id: servicioSeleccionado.id,
            nombre: servicioSeleccionado.nombre,
            precioUnitario,
        }
        setServiciosEnModal([...serviciosEnModal, nuevoServicio])

        setServicios((prev) => [...prev, nuevoServicio])
        setServicioSeleccionado(null)
        setPrecioUnitario(0)
        setModalErrores({})
    }

    useEffect(() => {
        fetch("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
            .then((res) => res.json())
            .then((data) => setServiciosDisponibles(data))
            .catch((error) => console.error("Error al cargar servicios:", error))
    }, [])

    useEffect(() => {
        const cargarManicuristas = async () => {
            const data = await obtenerManicurista()
            setManicuristas(data)
        }
        cargarManicuristas()
    }, [])

    useEffect(() => {
        const total = serviciosSeleccionados.reduce((sum, s) => sum + Number(s.precioUnitario || 0), 0)
        setTotalVenta(total)
    }, [serviciosSeleccionados])

    useEffect(() => {
        if (tipoVenta === "Cita") {
            axios
                .get("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/en-proceso/")
                .then((res) => {
                    console.log("Fechas recibidas:", res.data.citas_en_proceso)
                    setCitasExistentes(res.data.citas_en_proceso)
                })
                .catch((err) => {
                    console.error("Error al obtener las citas:", err)
                })
        }
    }, [tipoVenta])

    // Handle appointment search with autocomplete
    const handleBusquedaCitaChange = (e) => {
        const texto = e.target.value
        setTextoBusquedaCita(texto)

        if (texto.trim() === "") {
            setSugerenciasCita([])
            setCodigoCita("")
            return
        }

        // Filter appointments by date or client name
        const sugerencias = citasExistentes.filter((cita) => {
            const fechaMatch = cita.Fecha.toLowerCase().includes(texto.toLowerCase())
            const clienteMatch = cita.cliente_nombre.toLowerCase().includes(texto.toLowerCase())
            return fechaMatch || clienteMatch
        })

        setSugerenciasCita(sugerencias)
    }

    const seleccionarCita = (cita) => {
        setTextoBusquedaCita(`${cita.Fecha} - ${cita.cliente_nombre}`)
        setCodigoCita(cita.id)
        setSugerenciasCita([])
        setErroresVenta((prev) => ({ ...prev, cita: "" }))
    }

    const handleBuscarCita = async () => {
        const citaSeleccionada = citasExistentes.find((c) => c.id === Number.parseInt(codigoCita))
        if (citaSeleccionada) {
            setDatosCita({
                cliente: citaSeleccionada.cliente_nombre,
                manicurista: citaSeleccionada.manicurista_nombre,
                fecha: citaSeleccionada.Fecha,
                hora: citaSeleccionada.Hora,
                descripcion: citaSeleccionada.Descripcion,
                total: citaSeleccionada.Total,
            })

            try {
                console.log("🔍 Cargando servicios de la cita:", codigoCita)

                const response = await axios.get(`https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/?cita_id=${codigoCita}`)

                console.log("✅ Servicios cargados:", response.data)

                const serviciosConDetalles = response.data.map((servicio) => {
                    const servicioCompleto = serviciosDisponibles.find((s) => s.id === servicio.servicio_id)
                    return {
                        id: servicio.id,
                        servicio_id: servicio.servicio_id,
                        servicio_nombre: servicio.servicio_nombre,
                        subtotal: Number.parseFloat(servicio.subtotal),
                        duracion: servicioCompleto?.duracion || "N/A",
                        cita_id: servicio.cita_id,
                    }
                })

                setServiciosCita(serviciosConDetalles)
            } catch (error) {
                console.error("❌ Error cargando servicios de la cita:", error)
                Swal.fire("Error", "No se pudieron cargar los servicios de la cita", "error")
            }
        }
    }

    const agregarServicioACita = async () => {
        if (!servicioSeleccionado || !precioUnitario || !codigoCita) {
            console.log("❌ Faltan datos para agregar servicio")
            return
        }

        try {
            console.log("📝 Agregando servicio a la cita via API")

            const servicioPayload = {
                cita_id: Number.parseInt(codigoCita),
                servicio_id: servicioSeleccionado.id,
                subtotal: precioUnitario.toString(),
            }

            console.log("🚀 Enviando a API:", servicioPayload)

            const response = await axios.post("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", servicioPayload)

            console.log("✅ Servicio agregado:", response.data)

            const nuevoServicioCita = {
                id: response.data.id,
                servicio_id: servicioSeleccionado.id,
                servicio_nombre: servicioSeleccionado.nombre,
                subtotal: Number.parseFloat(precioUnitario),
                duracion: servicioSeleccionado.duracion,
                cita_id: Number.parseInt(codigoCita),
            }

            setServiciosCita((prev) => [...prev, nuevoServicioCita])

            setServicioSeleccionado(null)
            setTextoServicio("")
            setPrecioUnitario(0)
            setModalErrores({ servicio: "", precio: "" })
        } catch (error) {
            console.error("❌ Error agregando servicio:", error)
            Swal.fire("Error", "No se pudo agregar el servicio a la cita", "error")
        }
    }

    const eliminarServicioDeCita = async (servicio, index) => {
        if (!servicio.id) {
            console.error("❌ El servicio no tiene ID válido")
            Swal.fire("Error", "No se puede eliminar este servicio (ID no válido)", "error")
            return
        }

        const resultado = await Swal.fire({
            title: `Eliminar servicio`,
            html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar el servicio <strong>${servicio.servicio_nombre}</strong>?</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#7e2952",
            cancelButtonColor: "#d8d6d7",
            reverseButtons: true,
            customClass: { popup: "swal-rosado" },
        })

        if (resultado.isConfirmed) {
            try {
                console.log("🗑️ Eliminando servicio de la API:", servicio.id)

                await axios.delete(`https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/${servicio.id}/`)

                console.log("✅ Servicio eliminado de la API")

                const nuevosServicios = serviciosCita.filter((_, i) => i !== index)
                setServiciosCita(nuevosServicios)

                Swal.fire({
                    icon: "success",
                    title: "Eliminado",
                    text: "Servicio eliminado exitosamente.",
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: "swal-rosado" },
                })
            } catch (error) {
                console.error("❌ Error eliminando servicio:", error)
                Swal.fire(
                    "Error",
                    `No se pudo eliminar el servicio. ${error.response?.data?.detail || "Error desconocido"}`,
                    "error",
                )
            }
        }
    }

    useEffect(() => {
        axios
            .get("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/")
            .then((res) => {
                setTodosServiciosCita(res.data)
            })
            .catch((err) => console.error("Error al cargar servicios de cita:", err))
    }, [])



    const total = serviciosEnModal.reduce((acc, serv) => acc + Number(serv.precioUnitario), 0)

    const [horasDisponibles, setHorasDisponibles] = useState([])
    const [horaInput, setHoraInput] = useState("")
    const [sugerenciasHora, setSugerenciasHora] = useState([])
    const [noRecomendables, setNoRecomendables] = useState([])
    const [mensajeHorasVacias, setMensajeHorasVacias] = useState("")

    useEffect(() => {
        const fetchHorasDisponibles = async () => {
            if (formVenta.manicurista && formVenta.fecha_venta) {
                console.log(`Fetching hours for manicurista: ${formVenta.manicurista}, date: ${formVenta.fecha_venta}`)

                try {
                    const response = await fetch(
                        `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${formVenta.manicurista}&fecha=${formVenta.fecha_venta}`,
                    )

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }

                    const data = await response.json()
                    console.log("API Response:", data)

                    let horas = data.horas_disponibles || []

                    const ahora = new Date()
                    const hoyStr = ahora.toISOString().split("T")[0]
                    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes()

                    if (formVenta.fecha_venta === hoyStr) {
                        horas = horas.filter((h) => {
                            const [hh, mm] = h.split(":").map(Number)
                            const horaEnMinutos = hh * 60 + mm
                            return horaEnMinutos > horaActualMinutos
                        })
                    }

                    console.log("Filtered available hours:", horas)

                    setHorasDisponibles(horas)
                    setNoRecomendables(data.no_recomendables || [])

                    if (horas.length === 0) {
                        setMensajeHorasVacias("Ya no hay horas disponibles para este día.")
                    } else {
                        setMensajeHorasVacias("")
                    }
                } catch (error) {
                    console.error("Error fetching available hours:", error)
                    setMensajeHorasVacias("Error al cargar las horas disponibles.")
                    setHorasDisponibles([])
                }
            } else {
                setHorasDisponibles([])
                setMensajeHorasVacias("")
            }
        }

        fetchHorasDisponibles()
    }, [formVenta.manicurista, formVenta.fecha_venta])

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

    const horaEsValida = (horaAMPM) => {
        const hora24 = convertirHoraA24(horaAMPM)
        if (!hora24) return false

        console.log(`Validating hour: ${horaAMPM} -> ${hora24}`)
        console.log(`Available hours:`, horasDisponibles)

        const esValida = horasDisponibles.includes(hora24)
        console.log(`Hour ${hora24} is valid: ${esValida}`)

        return esValida
    }

    const handleHoraChange = (e) => {
        const valor = e.target.value
        setHoraInput(valor)

        const sugerencias = horasDisponibles
            .map((h) => ({ original: h, label: formatearHoraAMPM(h) }))
            .filter(({ label }) => label.toLowerCase().startsWith(valor.toLowerCase()))

        setSugerenciasHora(sugerencias)

        if (!valor) {
            setErroresVenta((prev) => ({ ...prev, hora_venta: "La hora es obligatoria" }))
            setFormVenta((prev) => ({ ...prev, hora_venta: "" }))
        } else {
            const esValida = horaEsValida(valor)
            const hora24 = convertirHoraA24(valor)

            if (esValida && hora24) {
                setFormVenta((prev) => ({ ...prev, hora_venta: hora24 }))
                setErroresVenta((prev) => ({ ...prev, hora_venta: "" }))
            } else {
                setErroresVenta((prev) => ({
                    ...prev,
                    hora_venta: "Manicurista no disponible a esa hora",
                }))
                setFormVenta((prev) => ({ ...prev, hora_venta: "" }))
            }
        }
    }

    const esNoRecomendable = (hora24) => {
        return noRecomendables.includes(hora24)
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

    const getVentasForDate = (date) => {
        const dateString = formatDate(date)
        return ventasFiltradasTerminadas.filter((venta) => venta.Fecha === dateString)
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
            const ventasDelDia = getVentasForDate(currentDate)
            const isToday = formatDate(currentDate) === formatDate(new Date())

            days.push(
                <div key={day} className={`calendar-day ${isToday ? "calendar-day-today" : ""}`}>
                    <div className="calendar-day-number">{day}</div>
                    <div className="calendar-appointments">
                        {ventasDelDia.slice(0, 2).map((venta) => (
                            <div
                                key={venta.id}
                                className="calendar-appointment calendar-appointment-completed"
                                onClick={() => openVerModal(venta)}
                                title={`${venta.cliente_nombre} - ${venta.Hora} - Terminada`}
                            >
                                {new Date(`1970-01-01T${venta.Hora}`).toLocaleTimeString("es-CO", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}{" "}
                                {venta.cliente_nombre}
                            </div>
                        ))}
                        {ventasDelDia.length > 2 && <div className="calendar-more">+{ventasDelDia.length - 2} más</div>}
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
                        <span className="legend-color calendar-appointment-completed"></span>
                        <span className="legend-label">Terminada</span>
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
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventasActuales.filter((cita) => cita.estado_nombre === "Terminada").length > 0 ? (
                        ventasActuales
                            .filter((cita) => cita.estado_nombre === "Terminada")
                            .map((cita) => (
                                <tr key={cita.id}>
                                    <td>{cita.cliente_nombre}</td>
                                    <td>{cita.Fecha}</td>
                                    <td>
                                        {new Date(`${cita.Fecha}T${cita.Hora}`).toLocaleTimeString("es-CO", {
                                            timeZone: "America/Bogota",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </td>
                                    <td>${!isNaN(Number(cita.Total)) ? Number(cita.Total).toLocaleString() : "0"}</td>
                                    <td>
                                        <span
                                            className={`estado-texto ${cita.estado_nombre === "Pendiente"
                                                ? "estado-pendiente"
                                                : cita.estado_nombre === "Terminada"
                                                    ? "estado-terminada"
                                                    : ""
                                                }`}
                                        >
                                            {cita.estado_nombre}
                                        </span>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button
                                            onClick={() => openVerModal(cita)}
                                            className="acciones-btn editar-btn"
                                            title="Ver factura de la venta"
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500" />
                                        </button>
                                        <button
                                            className="acciones-btn ver-btn"
                                            title="Imprimir un pdf de la venta"
                                            onClick={() => {
                                                openVerModal(cita)
                                                setTimeout(() => {
                                                    exportarPDF(cita.id)
                                                }, 500)
                                            }}
                                        >
                                            <AiFillFilePdf size={18} className="text-red-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No se encontraron ventas terminadas
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    return (
        <div
            className={`${vistaActual === "tabla" ? "roles-container" : "roles-container-cita"} ${darkMode ? "dark" : ""}`}
        >
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de ventas</h1>

                <div className="iconos-perfil">
                    <div className="bell-container" onClick={() => openModal("calificaciones")}>
                        <span title="Ver calificaciones">
                            <Star className="icon" />
                        </span>
                        {calificacionesNoVistas > 0 && (
                            <span className="notification-badge">{calificacionesNoVistas > 99 ? "99+" : calificacionesNoVistas}</span>
                        )}
                    </div>
                    <Link to="/recepcionista/dashboard/perfil">
                        <span title="Tu perfil">
                            <User className="icon" />
                        </span>
                    </Link>
                </div>
            </div>

            <div className="view-toggle-container">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => setIsCrearModalOpen(true)} className="crear-btn">
                        Crear venta
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Buscar venta..."
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
                            <h2 className="titulo-usuario">Crear venta</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const errores = {}

                                    if (!clienteSeleccionado) errores.cliente = "Debes seleccionar un cliente"
                                    if (!formVenta.manicurista) errores.manicurista = "La manicurista es obligatoria"
                                    if (!formVenta.fecha) errores.fecha = "La fecha es obligatoria"

                                    const horaAMPM = horaInput.trim()
                                    const hora24 = convertirHoraA24(horaAMPM)

                                    if (!horaAMPM) {
                                        errores.hora_venta = "La hora es obligatoria"
                                    } else if (!hora24 || !horasDisponibles.includes(hora24)) {
                                        errores.hora_venta = "Manicurista no disponible a esa hora"
                                    } else if (esNoRecomendable(hora24)) {
                                        errores.hora_venta = "Advertencia: hay una cita muy cerca de esta hora"
                                    }

                                    if (!formVenta.descripcion) errores.descripcion = "La descripción es obligatoria"

                                    setErroresVenta(errores)

                                    const hayErrores = Object.values(errores).some((e) => e)

                                    if (!hayErrores) {
                                        setFormVenta((prev) => ({ ...prev, hora_venta: hora24 }))
                                        setPasoActual(2)
                                    }
                                }}
                                className="space-y-3"
                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <select
                                            value={formVenta.tipoVenta}
                                            onChange={(e) => {
                                                const tipo = e.target.value
                                                setTipoVenta(tipo)
                                                setFormVenta({
                                                    tipoVenta: tipo,
                                                    cliente: "",
                                                    manicurista: "",
                                                    fecha_venta: "",
                                                    hora_venta: "",
                                                    descripcion: "",
                                                    citaSeleccionada: "",
                                                })
                                                setErroresVenta({})
                                                setErrorDisponibilidad("")
                                                setServiciosSeleccionados([])
                                                setServiciosEnModal([])
                                                setServiciosCita([])
                                                setServicioSeleccionado(null)
                                                setPrecioUnitario(0)
                                                setTextoServicio("")
                                                setModalErrores({ servicio: "", precio: "" })
                                                setSugerenciasServicio([])

                                                setClienteSeleccionado("")
                                                setTocoValidarCliente(false)
                                                setSugerenciasCliente([])

                                                setDatosCita({ cliente: "", manicurista: "", fecha: "" })
                                                setCodigoCita("")
                                                setTextoBusquedaCita("")
                                                setSugerenciasCita([])

                                                setShowVentaDateInput(false)
                                                setShowVentaHoraInput(false)
                                                setPasoActual(1)
                                                setIndiceEditando(null)
                                                setEditandoDesdeServicios(false)
                                                setIndiceEditandoServicio(null)

                                                fetchVentas()
                                            }}
                                            onBlur={() => {
                                                if (!formVenta.tipoVenta) {
                                                    setErroresVenta((prev) => ({
                                                        ...prev,
                                                        tipoVenta: "Debes seleccionar un tipo de venta",
                                                    }))
                                                }
                                            }}
                                            className="input-select"
                                        >
                                            <option value="">Tipo de venta *</option>
                                            <option value="Directa">Directa</option>
                                            <option value="Cita">Cita</option>
                                        </select>

                                        {erroresVenta.tipoVenta && <p className="error-texto">{erroresVenta.tipoVenta}</p>}
                                    </div>
                                </div>
                                {tipoVenta === "Directa" && (
                                    <>
                                        {" "}
                                        <h2 className="titulo-usuario">{pasoActual === 1 ? "Datos principales" : "Agregar servicios"}</h2>
                                        {pasoActual === 1 && (
                                            <>
                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Cliente:</label>
                                                        <input
                                                            type="text"
                                                            name="buscarCliente"
                                                            className="input-select"
                                                            placeholder="Buscar cliente *"
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
                                                                    setErroresVenta((prev) => ({ ...prev, cliente: "" }))
                                                                }

                                                                setErrorDisponibilidad("")
                                                            }}
                                                            onBlur={() => {
                                                                setTocoValidarCliente(true)
                                                                if (!clienteSeleccionado) {
                                                                    setErroresVenta((prev) => ({ ...prev, cliente: "El cliente es obligatorio" }))
                                                                }
                                                                setTimeout(() => setSugerenciasCliente([]), 100)
                                                            }}
                                                        />
                                                        {sugerenciasCliente.length > 0 && (
                                                            <ul className="resultado-lista">
                                                                {sugerenciasCliente.map((cli, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="resultado-item"
                                                                        onMouseDown={() => {
                                                                            setClienteSeleccionado(`${cli.nombre} ${cli.apellido}`)
                                                                            setFormVenta((prev) => ({ ...prev, cliente: cli.usuario_id }))
                                                                            setErroresVenta((prev) => ({ ...prev, cliente: "" }))
                                                                            setSugerenciasCliente([])
                                                                            setErrorDisponibilidad("")
                                                                        }}
                                                                    >
                                                                        {cli.nombre} {cli.apellido} - {cli.numero_documento}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {erroresVenta.cliente && <p className="error-texto">{erroresVenta.cliente}</p>}

                                                        {errorDisponibilidad && (
                                                            <p
                                                                className="error-texto"
                                                                style={{ color: "#e74c3c", fontSize: "14px", marginTop: "5px" }}
                                                            >
                                                                {errorDisponibilidad}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Manicurista:</label>
                                                        <select
                                                            value={formVenta.manicurista}
                                                            onChange={(e) => {
                                                                setFormVenta((prev) => ({ ...prev, manicurista: e.target.value }))
                                                                if (e.target.value !== "") setErroresVenta((prev) => ({ ...prev, manicurista: "" }))
                                                                setErrorDisponibilidad("")
                                                            }}
                                                            onBlur={() => {
                                                                if (!formVenta.manicurista)
                                                                    setErroresVenta((prev) => ({ ...prev, manicurista: "La manicurista es obligatoria" }))
                                                            }}
                                                            className="input-select"
                                                        >
                                                            <option value="">Seleccione la manicurista *</option>
                                                            {manicuristas.map((manicurista, index) => (
                                                                <option key={index} value={manicurista.usuario_id}>
                                                                    {manicurista.nombre} {manicurista.apellido}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {erroresVenta.manicurista && <p className="error-texto">{erroresVenta.manicurista}</p>}
                                                    </div>
                                                </div>

                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Fecha de la venta:</label>
                                                        {showVentaDateInput || formVenta.fecha_venta ? (
                                                            <input
                                                                type="date"
                                                                value={formVenta.fecha_venta}
                                                                min={new Date().toISOString().split("T")[0]}
                                                                max={new Date().toISOString().split("T")[0]}
                                                                onChange={(e) => {
                                                                    const valorIngresado = e.target.value
                                                                    const hoy = new Date().toISOString().split("T")[0]

                                                                    setFormVenta((prev) => ({ ...prev, fecha_venta: valorIngresado }))

                                                                    if (!valorIngresado) {
                                                                        setErroresVenta((prev) => ({ ...prev, fecha_venta: "La fecha es obligatoria" }))
                                                                    } else if (valorIngresado !== hoy) {
                                                                        setErroresVenta((prev) => ({
                                                                            ...prev,
                                                                            fecha_venta: "Solo se permite la fecha actual",
                                                                        }))
                                                                    } else {
                                                                        setErroresVenta((prev) => ({ ...prev, fecha_venta: "" }))
                                                                    }

                                                                    setErrorDisponibilidad("")
                                                                }}
                                                                onBlur={() => {
                                                                    if (!formVenta.fecha_venta) {
                                                                        setErroresVenta((prev) => ({ ...prev, fecha_venta: "La fecha es obligatoria" }))
                                                                    }
                                                                }}
                                                                className="input-select"
                                                            />
                                                        ) : (
                                                            <div className="input-select" onClick={() => setShowVentaDateInput(true)}>
                                                                Fecha de venta *
                                                            </div>
                                                        )}
                                                        {erroresVenta.fecha_venta && <p className="error-texto">{erroresVenta.fecha_venta}</p>}
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
                                                                    setErroresVenta((prev) => ({ ...prev, hora: "La hora es obligatoria" }))
                                                                } else {
                                                                    const esValida = horaEsValida(valor)
                                                                    const hora24 = convertirHoraA24(valor)
                                                                    let mensaje = ""

                                                                    if (!esValida) {
                                                                        mensaje = "Manicurista no disponible a esa hora"
                                                                    } else if (hora24 && esNoRecomendable(hora24)) {
                                                                        mensaje = "Advertencia: hay una cita muy cerca de esta hora"
                                                                    }

                                                                    setErroresVenta((prev) => ({ ...prev, hora_venta: mensaje }))

                                                                    if (esValida && hora24) {
                                                                        setFormVenta((prev) => ({ ...prev, hora_venta: hora24 }))
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {sugerenciasHora.length > 0 && (
                                                            <ul className="resultado-lista">
                                                                {sugerenciasHora.map(({ original, label }) => (
                                                                    <li
                                                                        key={original}
                                                                        className="resultado-item"
                                                                        onMouseDown={() => {
                                                                            setHoraInput(label)
                                                                            setFormVenta((prev) => ({ ...prev, hora_venta: original }))
                                                                            setSugerenciasHora([])
                                                                            setErroresVenta((prev) => ({ ...prev, hora_venta: "" }))
                                                                        }}
                                                                    >
                                                                        {label}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {mensajeHorasVacias && <p className="error-texto">{mensajeHorasVacias}</p>}

                                                        {erroresVenta.hora_venta && <p className="error-texto">{erroresVenta.hora_venta}</p>}
                                                    </div>
                                                </div>

                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Descripción:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Descripción *"
                                                            className="input-texto"
                                                            value={formVenta.descripcion}
                                                            onChange={(e) => {
                                                                setFormVenta((prev) => ({ ...prev, descripcion: e.target.value }))
                                                                if (e.target.value !== "") setErroresVenta((prev) => ({ ...prev, descripcion: "" }))
                                                            }}
                                                            onBlur={() => {
                                                                if (!formVenta.descripcion)
                                                                    setErroresVenta((prev) => ({ ...prev, descripcion: "La descripción es obligatoria" }))
                                                            }}
                                                        />
                                                        {erroresVenta.descripcion && <p className="error-texto">{erroresVenta.descripcion}</p>}
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
                                            </>
                                        )}
                                        {pasoActual === 2 && (
                                            <>
                                                <div className="modal-form-row">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Servicio:</label>
                                                        <input
                                                            type="text"
                                                            name="buscarServicio"
                                                            className="input-select modal-input"
                                                            placeholder="Buscar servicio *"
                                                            value={textoServicio}
                                                            onChange={(e) => {
                                                                const texto = e.target.value
                                                                setTextoServicio(texto)

                                                                const resultados = serviciosDisponibles.filter((s) =>
                                                                    s.nombre.toLowerCase().includes(texto.toLowerCase()),
                                                                )

                                                                setSugerenciasServicio(resultados)

                                                                if (texto !== "") {
                                                                    setModalErrores((prev) => ({ ...prev, servicio: "" }))
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                setTimeout(() => setSugerenciasServicio([]), 100)
                                                                if (!servicioSeleccionado) {
                                                                    setModalErrores((prev) => ({
                                                                        ...prev,
                                                                        servicio: "Selecciona un servicio",
                                                                    }))
                                                                }
                                                            }}
                                                        />
                                                        {sugerenciasServicio.length > 0 && (
                                                            <ul className="resultado-lista">
                                                                {sugerenciasServicio.map((ser, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="resultado-item"
                                                                        onMouseDown={() => {
                                                                            setTextoServicio(ser.nombre)
                                                                            setServicioSeleccionado(ser)
                                                                            setPrecioUnitario(ser.precio)
                                                                            setModalErrores((prev) => ({ ...prev, servicio: "", precio: "" }))
                                                                            setSugerenciasServicio([])
                                                                        }}
                                                                    >
                                                                        {ser.nombre} - ${ser.precio} - {ser.duracion} min
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {modalErrores.servicio && <p className="error-texto">{modalErrores.servicio}</p>}
                                                    </div>

                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Precio:</label>
                                                        <input
                                                            type="text"
                                                            className="input-texto modal-input"
                                                            value={
                                                                precioUnitario
                                                                    ? new Intl.NumberFormat("es-CO", {
                                                                        style: "currency",
                                                                        currency: "COP",
                                                                        minimumFractionDigits: 0, 
                                                                    }).format(precioUnitario)
                                                                    : ""
                                                            }
                                                            onChange={(e) => {
                                                                const valorLimpio = e.target.value.replace(/[^0-9]/g, "");
                                                                const nuevoPrecio = Number(valorLimpio);

                                                                setPrecioUnitario(nuevoPrecio);

                                                                if (nuevoPrecio > 0) {
                                                                    setModalErrores((prev) => ({ ...prev, precio: "" }));
                                                                } else {
                                                                    setModalErrores((prev) => ({
                                                                        ...prev,
                                                                        precio: "El precio no puede ser 0",
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="Precio Unitario"
                                                        />
                                                        {modalErrores.precio && <p className="error-texto">{modalErrores.precio}</p>}
                                                    </div>
                                                </div>

                                                <div className="modal-botones">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!servicioSeleccionado || !precioUnitario) return

                                                            const nuevoServicio = {
                                                                id: servicioSeleccionado.id,
                                                                nombre: servicioSeleccionado.nombre,
                                                                precioUnitario: Number(precioUnitario),
                                                                duracion: servicioSeleccionado.duracion,
                                                            }

                                                            if (editandoDesdeServicios && indiceEditandoServicio !== null) {
                                                                const nuevosServicios = [...serviciosSeleccionados]
                                                                nuevosServicios[indiceEditandoServicio] = nuevoServicio
                                                                setServiciosSeleccionados(nuevosServicios)
                                                                setEditandoDesdeServicios(false)
                                                                setIndiceEditandoServicio(null)
                                                                setShowModal(false)
                                                            } else if (indiceEditando !== null) {
                                                                const actualizados = [...serviciosEnModal]
                                                                actualizados[indiceEditando] = nuevoServicio
                                                                setServiciosEnModal(actualizados)
                                                                setIndiceEditando(null)
                                                            } else {
                                                                setServiciosEnModal((prev) => [...prev, nuevoServicio])
                                                            }

                                                            setServicioSeleccionado(null)
                                                            setTextoServicio("")
                                                            setPrecioUnitario(0)
                                                        }}
                                                        className="btn-agregar"
                                                    >
                                                        {editandoDesdeServicios || indiceEditando !== null ? "Guardar cambios" : "Agregar servicio"}
                                                    </button>
                                                </div>

                                                <div className="servicios-agregados-modal">
                                                    <h4>Servicios agregados:</h4>
                                                    {serviciosEnModal.length === 0 ? (
                                                        <p>No has agregado servicios aún.</p>
                                                    ) : (
                                                        <div className="grid-insumos-modal">
                                                            {serviciosEnModal.map((ser, index) => (
                                                                <div key={index} className="servicio-item-modal">
                                                                    {ser.nombre} - ${ser.precioUnitario} - {ser.duracion} min
                                                                    <div className="servicio-item-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="btn-editar-servicio-agregar"
                                                                            onClick={() => {
                                                                                const servicioAEditar = serviciosDisponibles.find(
                                                                                    (s) => s.nombre === ser.nombre,
                                                                                )
                                                                                if (servicioAEditar) {
                                                                                    setServicioSeleccionado(servicioAEditar)
                                                                                    setTextoServicio(servicioAEditar.nombre)
                                                                                }
                                                                                setPrecioUnitario(ser.precioUnitario)
                                                                                setIndiceEditando(index)
                                                                            }}
                                                                        >
                                                                            ✎
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-eliminar-servicio-agregar"
                                                                            onClick={() => {
                                                                                const nuevosServiciosEnModal = serviciosEnModal.filter((_, i) => i !== index)
                                                                                setServiciosEnModal(nuevosServiciosEnModal)
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="fila-formulario">
                                                    <input
                                                        type="text"
                                                        value={`Total: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(total)}`}
                                                        className="input-texto"
                                                        readOnly
                                                    />
                                                </div>

                                                <div className="button-container">
                                                    <button type="button" className="btn-cancelar" onClick={() => setPasoActual(1)}>
                                                        Volver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-crear"
                                                        onClick={handleCrear}
                                                        disabled={cargandoCrearVenta}
                                                    >
                                                        {cargandoCrearVenta ? "Creando venta..." : "Crear venta"}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {tipoVenta === "Cita" && (
                                    <div className="fila-formulario">
                                        <div className="campo" style={{ position: "relative" }}>
                                            <input
                                                type="text"
                                                style={{ width: "850px" }}
                                                value={textoBusquedaCita}
                                                onChange={handleBusquedaCitaChange}
                                                onBlur={() => {
                                                    setTimeout(() => setSugerenciasCita([]), 100)
                                                    if (!codigoCita) {
                                                        setErroresVenta((prev) => ({ ...prev, cita: "Seleccione una cita" }))
                                                    }
                                                }}
                                                className="input-select"
                                                placeholder="Buscar por fecha (YYYY-MM-DD) o nombre del cliente *"
                                            />
                                            {sugerenciasCita.length > 0 && (
                                                <ul className="resultado-lista-cita">
                                                    {sugerenciasCita.map((cita) => (
                                                        <li key={cita.id} className="resultado-item-cita" onMouseDown={() => seleccionarCita(cita)}>
                                                            {cita.Fecha} - {cita.cliente_nombre} - {cita.manicurista_nombre}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {erroresVenta.cita && <p className="error-texto">{erroresVenta.cita}</p>}
                                        </div>

                                        <div className="campo-buscar">
                                            <button
                                                type="button"
                                                onClick={handleBuscarCita}
                                                className="btn-buscar-fecha"
                                                disabled={!codigoCita}
                                            >
                                                <Search size={22} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {tipoVenta === "Cita" && datosCita.cliente && (
                                    <>
                                        <h2 className="titulo-usuario">{pasoActual === 1 ? "Datos principales" : "Agregar servicios"}</h2>
                                        {pasoActual === 1 && (
                                            <div className="datos-cita">
                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Cliente:</label>
                                                        <input type="text" value={datosCita.cliente} className="input-texto" readOnly />
                                                    </div>
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Manicurista:</label>
                                                        <input type="text" value={datosCita.manicurista} className="input-texto" readOnly />
                                                    </div>
                                                </div>
                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Fecha:</label>
                                                        <input type="text" value={datosCita.fecha} className="input-texto" readOnly />
                                                    </div>
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Hora:</label>
                                                        <input type="text" value={datosCita.hora} className="input-texto" readOnly />
                                                    </div>
                                                </div>
                                                <div className="fila-formulario">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Descripción:</label>
                                                        <input type="text" value={datosCita.descripcion} className="input-texto" readOnly />
                                                    </div>
                                                </div>

                                                <div className="button-container">
                                                    <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                                                        Cancelar
                                                    </button>
                                                    <button type="button" className="btn-crear" onClick={handlePasoUno}>
                                                        Continuar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {pasoActual === 2 && (
                                            <>
                                                <div className="modal-form-row">
                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Servicio:</label>
                                                        <input
                                                            type="text"
                                                            name="buscarServicio"
                                                            className="input-select modal-input"
                                                            placeholder="Buscar servicio *"
                                                            value={textoServicio}
                                                            onChange={(e) => {
                                                                const texto = e.target.value
                                                                setTextoServicio(texto)

                                                                const resultados = serviciosDisponibles.filter((s) =>
                                                                    s.nombre.toLowerCase().includes(texto.toLowerCase()),
                                                                )

                                                                setSugerenciasServicio(resultados)

                                                                if (texto !== "") {
                                                                    setModalErrores((prev) => ({ ...prev, servicio: "" }))
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                setTimeout(() => setSugerenciasServicio([]), 100)
                                                                if (!servicioSeleccionado) {
                                                                    setModalErrores((prev) => ({
                                                                        ...prev,
                                                                        servicio: "Selecciona un servicio",
                                                                    }))
                                                                }
                                                            }}
                                                        />
                                                        {sugerenciasServicio.length > 0 && (
                                                            <ul className="resultado-lista">
                                                                {sugerenciasServicio.map((ser, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className="resultado-item"
                                                                        onMouseDown={() => {
                                                                            setTextoServicio(ser.nombre)
                                                                            setServicioSeleccionado(ser)
                                                                            setPrecioUnitario(ser.precio)
                                                                            setModalErrores((prev) => ({ ...prev, servicio: "", precio: "" }))
                                                                            setSugerenciasServicio([])
                                                                        }}
                                                                    >
                                                                        {ser.nombre} - ${ser.precio} - {ser.duracion} min
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {modalErrores.servicio && <p className="error-texto">{modalErrores.servicio}</p>}
                                                    </div>

                                                    <div className="campo">
                                                        <label className="subtitulo-editar-todos">Precio:</label>
                                                        <input
                                                            type="text"
                                                            className="input-texto modal-input"
                                                            value={precioUnitario}
                                                            onChange={(e) => {
                                                                const nuevoPrecio = Number(e.target.value)
                                                                setPrecioUnitario(nuevoPrecio)

                                                                if (nuevoPrecio > 0) {
                                                                    setModalErrores((prev) => ({ ...prev, precio: "" }))
                                                                } else {
                                                                    setModalErrores((prev) => ({ ...prev, precio: "El precio no puede ser 0" }))
                                                                }
                                                            }}
                                                            placeholder="Precio Unitario"
                                                        />
                                                        {modalErrores.precio && <p className="error-texto">{modalErrores.precio}</p>}
                                                    </div>
                                                </div>

                                                <div className="modal-botones">
                                                    <button type="button" onClick={agregarServicioACita} className="btn-agregar">
                                                        {indiceEditando !== null ? "Guardar cambios" : "Agregar servicio"}
                                                    </button>
                                                </div>

                                                <div className="servicios-agregados-modal">
                                                    <h4>Servicios agregados:</h4>
                                                    {serviciosCita.length === 0 && serviciosEnModal.length === 0 ? (
                                                        <p>No has agregado servicios aún.</p>
                                                    ) : (
                                                        <>
                                                            <div className="grid-insumos-modal-cita">
                                                                {serviciosCita.map((servicio, index) => {
                                                                    const servicioCompleto = serviciosDisponibles.find(
                                                                        (s) =>
                                                                            s.id === servicio.servicio_id ||
                                                                            s.nombre === (servicio.servicio_nombre || servicio.nombre),
                                                                    )

                                                                    const duracion = servicio.duracion || servicioCompleto?.duracion || "N/A"

                                                                    return (
                                                                        <div key={`existente-${index}`} className="servicio-item-modal">
                                                                            <span className="servicio-existente">
                                                                                {servicio.servicio_nombre || servicio.nombre} - $
                                                                                {servicio.subtotal || servicio.precio} - {duracion} min
                                                                                <small> (Servicio de la cita)</small>
                                                                            </span>
                                                                            <div className="servicio-item-actions">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-eliminar-servicio-agregar"
                                                                                    onClick={async () => {
                                                                                        eliminarServicioDeCita(servicio, index)
                                                                                        const resultado = await Swal.fire({
                                                                                            title: `Eliminar servicio`,
                                                                                            html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar el servicio <strong>${servicio.nombre || servicio.servicio_nombre}</strong>?</p>`,
                                                                                            icon: "warning",
                                                                                            showCancelButton: true,
                                                                                            confirmButtonText: "Sí, eliminar",
                                                                                            cancelButtonText: "Cancelar",
                                                                                            confirmButtonColor: "#7e2952",
                                                                                            cancelButtonColor: "#d8d6d7",
                                                                                            reverseButtons: true,
                                                                                            customClass: {
                                                                                                popup: "swal-rosado",
                                                                                            },
                                                                                        })

                                                                                        if (resultado.isConfirmed) {
                                                                                            try {
                                                                                                console.log("Eliminando servicio con ID:", servicio.id)

                                                                                                if (servicio.id) {
                                                                                                    await axios.delete(
                                                                                                        `https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/${servicio.id}/`,
                                                                                                    )
                                                                                                }

                                                                                                const nuevosServicios = serviciosCita.filter((_, i) => i !== index)
                                                                                                setServiciosCita(nuevosServicios)
                                                                                            } catch (error) {
                                                                                                console.error("Error eliminando el servicio en la API:", error)
                                                                                                Swal.fire(
                                                                                                    "Error",
                                                                                                    "No se pudo eliminar el servicio. Verifica la conexión con la API.",
                                                                                                    "error",
                                                                                                )
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}

                                                                {serviciosEnModal.map((ser, index) => (
                                                                    <div key={`nuevo-${index}`} className="servicio-item-modal">
                                                                        {ser.nombre} - ${ser.precioUnitario} - {ser.duracion} min
                                                                        <small> (Servicio adicional)</small>
                                                                        <div className="servicio-item-actions">
                                                                            <button
                                                                                type="button"
                                                                                className="btn-editar-servicio-agregar"
                                                                                onClick={() => {
                                                                                    const servicioAEditar = serviciosDisponibles.find(
                                                                                        (s) => s.nombre === ser.nombre,
                                                                                    )
                                                                                    if (servicioAEditar) {
                                                                                        setServicioSeleccionado(servicioAEditar)
                                                                                        setTextoServicio(servicioAEditar.nombre)
                                                                                    }
                                                                                    setPrecioUnitario(ser.precioUnitario)
                                                                                    setIndiceEditando(index)
                                                                                }}
                                                                            >
                                                                                ✎
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn-eliminar-servicio-agregar"
                                                                                onClick={async () => {
                                                                                    const resultado = await Swal.fire({
                                                                                        title: `Eliminar servicio`,
                                                                                        html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar el servicio <strong>${ser.nombre}</strong>?</p>`,
                                                                                        icon: "warning",
                                                                                        showCancelButton: true,
                                                                                        confirmButtonText: "Sí, eliminar",
                                                                                        cancelButtonText: "Cancelar",
                                                                                        confirmButtonColor: "#7e2952",
                                                                                        cancelButtonColor: "#d8d6d7",
                                                                                        reverseButtons: true,
                                                                                        customClass: { popup: "swal-rosado" },
                                                                                    })

                                                                                    if (resultado.isConfirmed) {
                                                                                        try {
                                                                                            if (ser.id) {
                                                                                                await axios.delete(
                                                                                                    `https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/${ser.id}/`,
                                                                                                )
                                                                                            }
                                                                                            const nuevosServiciosEnModal = serviciosEnModal.filter(
                                                                                                (_, i) => i !== index,
                                                                                            )
                                                                                            setServiciosEnModal(nuevosServiciosEnModal)

                                                                                            Swal.fire({
                                                                                                icon: "success",
                                                                                                title: "Eliminado",
                                                                                                text: "Servicio eliminado exitosamente.",
                                                                                                timer: 1500,
                                                                                                showConfirmButton: false,
                                                                                                customClass: { popup: "swal-rosado" },
                                                                                            })
                                                                                        } catch (error) {
                                                                                            console.error("Error eliminando servicio:", error)
                                                                                            Swal.fire("Error", "No se pudo eliminar el servicio.", "error")
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="fila-formulario">
                                                    <input
                                                        type="text"
                                                        value={`Total: ${new Intl.NumberFormat("es-CO", {
                                                            style: "currency",
                                                            currency: "COP",
                                                        }).format(
                                                            serviciosCita.reduce((acc, s) => acc + Number(s.subtotal || s.precio || 0), 0) +
                                                            serviciosEnModal.reduce((acc, s) => acc + Number(s.precioUnitario || 0), 0),
                                                        )}`}
                                                        className="input-texto"
                                                        readOnly
                                                    />
                                                </div>

                                                <div className="button-container">
                                                    <button type="button" className="btn-cancelar" onClick={() => setPasoActual(1)}>
                                                        Volver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-crear"
                                                        onClick={handleCrear}
                                                        disabled={cargandoTerminarCita}
                                                    >
                                                        {cargandoTerminarCita ? "Terminando cita..." : "Terminar cita"}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isVerModalOpen && ventaSeleccionada && (
                <div className="overlay-popup" onClick={closeVerModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div id="factura-modal" className="contenido-popup-2">
                            <h2 className="titulo-usuario">Factura {ventaSeleccionada.estado_nombre}</h2>
                            <img src={logo || "/placeholder.svg"} alt="" className="logo-ver-compra" />
                            <hr className="linea" />
                            <div>
                                <h5 className="informacion-cliente">Venta #{ventaSeleccionada.id}</h5>
                                <div className="fechas">
                                    <p>Fecha de la venta: {ventaSeleccionada.Fecha}</p>
                                    <p>
                                        Hora de la venta:{" "}
                                        {new Date(`1970-01-01T${ventaSeleccionada.Hora}`).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </p>
                                </div>

                                <div className="informacion-cliente">
                                    <p>
                                        <strong>Información Cliente</strong>
                                    </p>
                                    <p>
                                        {ventaSeleccionada.cliente?.nombre} {ventaSeleccionada.cliente?.apellido}
                                    </p>
                                    <p>CC: {ventaSeleccionada.cliente?.numero_documento}</p>
                                    <p>{ventaSeleccionada.cliente?.celular}</p>
                                    <p>{ventaSeleccionada.cliente?.correo}</p>
                                    <p>
                                        <strong>Información Manicurista</strong>
                                    </p>
                                    <p>
                                        {ventaSeleccionada.manicurista?.nombre} {ventaSeleccionada.manicurista?.apellido}
                                    </p>
                                    <p style={{ marginTop: "10px" }}>
                                        <strong>Estado de la cita-venta</strong>
                                    </p>
                                    <p>{ventaSeleccionada.estado_nombre}</p>
                                </div>
                            </div>
                            <hr className="linea" />

                            <div className="insumos-factura">
                                <h4 className="facturados">Servicios Facturados</h4>

                                <div className="header-factura">
                                    <p>
                                        <strong>Servicio</strong>
                                    </p>
                                    <p>Precio</p>
                                    <p>IVA</p>
                                    <p>Total</p>
                                </div>

                                {ventaServicios.map((ser, index) => {
                                    const servicio_id = ser.servicio?.id
                                    console.log("servicio_id:", servicio_id, "para:", ser)

                                    const nombre = ser.servicio_nombre || "Servicio sin nombre"
                                    const subtotal = Number.parseFloat(ser.subtotal || 0)
                                    const iva = subtotal * 0.19
                                    const total = subtotal + iva

                                    return (
                                        <div key={index} className="fila-factura">
                                            <p className="col-insumo">{nombre}</p>
                                            <p className="dinero">${subtotal.toLocaleString()}</p>
                                            <p className="dinero">${iva.toLocaleString()}</p>
                                            <p className="dinero">${total.toLocaleString()}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="valores-totales">
                                <p>
                                    <strong>Subtotal de la venta:</strong>{" "}
                                    <span>
                                        ${ventaServicios.reduce((acc, s) => acc + Number.parseFloat(s.subtotal || 0), 0).toLocaleString()}
                                    </span>
                                </p>
                                <p>
                                    <strong>IVA total de la venta:</strong>{" "}
                                    <span>
                                        $
                                        {ventaServicios
                                            .reduce((acc, s) => acc + Number.parseFloat(s.subtotal || 0) * 0.19, 0)
                                            .toLocaleString()}
                                    </span>
                                </p>
                                <p>
                                    <strong>Total a pagar:</strong>{" "}
                                    <span className="total">
                                        $
                                        {ventaServicios
                                            .reduce((acc, s) => acc + Number.parseFloat(s.subtotal || 0) * 1.19, 0)
                                            .toLocaleString()}
                                    </span>
                                </p>
                            </div>

                            <div className="footer-popup">
                                <p>
                                    "Este comprobante corresponde a la venta realizada al cliente y es de uso exclusivo para control
                                    interno"
                                </p>
                                <p>CandyNails Medellín © 2025</p>
                            </div>
                            <div className="button-container">
                                <button className="btn-cancelar" onClick={closeVerModal}>
                                    Volver
                                </button>
                            </div>
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

export default GestionVentasRec
