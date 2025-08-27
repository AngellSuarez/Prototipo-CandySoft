import { useState, useEffect } from "react"
import "../../../css/gestionar.css"
import "../../../css/citas.css"
import { AiOutlineEye } from "react-icons/ai"
import Swal from "sweetalert2"
import {
    listar_citas,
    listar_servicios_para_citas,
    listar_servicios_para_citas_creadas,
} from "../../../services/citas_services"
import withReactContent from "sweetalert2-react-content"
import { useTheme } from "../../tema/ThemeContext"
import { Link } from "react-router-dom"
import { Bell, User, Calendar, Table, ChevronLeft, ChevronRight, X } from 'lucide-react'

const GestionCitasMan = () => {
    const MySwal = withReactContent(Swal)
    const [citaSeleccionada, setCitaSeleccionada] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [loading, setLoading] = useState(true)
    const [paginaActual, setPaginaActual] = useState(1)
    const citasPorPagina = 4
    const [citas, setCitas] = useState([])
    const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
    const [modoVisualizacion, setModoVisualizacion] = useState(false)
    const [vistaActual, setVistaActual] = useState("tabla") // "tabla" o "calendario"
    const [fechaActual, setFechaActual] = useState(new Date())
    const { darkMode } = useTheme()

    const [notificaciones, setNotificaciones] = useState([
        {
            id: 1,
            mensaje: "Nueva novedad creada por Paula. Cambio en el horario de ingreso",
            fecha: "2024-12-29",
            visto: false,
        },
        {
            id: 2,
            mensaje: "Se ha agendado una cita para el 03/05/2025.",
            fecha: "2024-12-28",
            visto: false,
        },
    ])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tabActiva, setTabActiva] = useState("notificaciones")

    const openModal = (tab = "notificaciones") => {
        setTabActiva(tab)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        if (tabActiva === "notificaciones") {
            setNotificaciones((prev) => prev.map((n) => ({ ...n, visto: true })))
        }
    }

    const notificacionesNoVistas = notificaciones.filter((n) => !n.visto).length

    const fetchCitas = async () => {
        try {
            setLoading(true)
            const response = await fetch('https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/')
            const data = await response.json()
            const userId = localStorage.getItem("user_id")

            const citasFiltradas = data?.filter((cita) => cita.manicurista_id === Number.parseInt(userId))

            setCitas(citasFiltradas || [])
        } catch (err) {
            console.error("Error al cargar citas:", err)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las citas'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchCitas = async () => {
            try {
                const data = await listar_citas()
                const data2 = await listar_servicios_para_citas_creadas()
                const data3 = await listar_servicios_para_citas()
                const userId = localStorage.getItem("user_id")

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

                // Filter appointments for the logged-in manicurist
                const citasFiltradas = data?.filter((cita) => cita.manicurista_id === Number.parseInt(userId))

                citasFiltradas.forEach((cita) => {
                    const nombres = serviciosPorCita[cita.id] || []
                    const precio = serviciosprecioCita[cita.id] || []
                    cita.serviciosNombres = nombres.join(", ")
                    cita.servicios = precio
                })

                setCitas(citasFiltradas || [])
            } catch (err) {
                console.error("Error al cargar citas:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchCitas()
    }, [])

    useEffect(() => {
        fetchCitas()
    }, [])

    const closeEditarModal = () => {
        setCitaSeleccionada(null)
        setIsEditarModalOpen(false)
        setModoVisualizacion(false)
    }

    const abrirEditarModal = (cita) => {
        setCitaSeleccionada(cita)
        setModoVisualizacion(true)
        setIsEditarModalOpen(true)
    }

    const handleBuscar = (e) => {
        const valorBusqueda = e.target.value.toLowerCase()
        setBusqueda(valorBusqueda)
        setPaginaActual(1)
    }

    const citasConEstadosPermitidos = citas.filter((cita) =>
        ["En proceso", "Pendiente"].includes(cita.estado_nombre),
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

    const horaFormateada = new Date(`1970-01-01T${citaSeleccionada?.Hora}`).toLocaleTimeString('es-CO', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const totalFormateado = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(citaSeleccionada?.Total || 0);

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
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
        ]
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="calendar-day calendar-day-empty"></div>
            )
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), day)
            const citasDelDia = getCitasForDate(currentDate)
            const isToday = formatDate(currentDate) === formatDate(new Date())

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? "calendar-day-today" : ""}`}
                >
                    <div className="calendar-day-number">{day}</div>
                    <div className="calendar-appointments">
                        {citasDelDia.slice(0, 2).map((cita) => (
                            <div
                                key={cita.id}
                                className={`calendar-appointment ${cita.estado_nombre === "Pendiente"
                                    ? "calendar-appointment-pending"
                                    : "calendar-appointment-process"
                                    }`}
                                onClick={() => abrirEditarModal(cita)}
                                title={`${cita.cliente_nombre} - ${cita.Hora} - ${cita.estado_nombre}`}
                            >
                                {new Date(`1970-01-01T${cita.Hora}`).toLocaleTimeString("es-CO", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true
                                })} {cita.cliente_nombre}
                            </div>
                        ))}
                        {citasDelDia.length > 2 && (
                            <div className="calendar-more">+{citasDelDia.length - 2} más</div>
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <h2 className="calendar-title">
                        {monthNames[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                    </h2>
                    <div className="calendar-navigation">
                        <button
                            className="calendar-nav-btn"
                            onClick={() => navigateMonth(-1)}
                        >
                            <ChevronLeft size={20} />
                            <span className="sr-only">Mes anterior</span>
                        </button>
                        <button
                            className="calendar-nav-btn"
                            onClick={() => navigateMonth(1)}
                        >
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
                                            className={`estado-texto ${cita.estado_nombre === 'Pendiente'
                                                ? 'estado-pendiente'
                                                : cita.estado_nombre === 'En proceso'
                                                    ? 'estado-proceso'
                                                    : 'estado-texto'
                                                }`}
                                        >
                                            {cita.estado_nombre}
                                        </span>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button
                                            onClick={() => abrirEditarModal(cita)}
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalle de la cita"
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
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

    if (loading) return null;

    return (
        <div
            className={`${vistaActual === "tabla" ? "roles-container" : "roles-container-cita"} ${darkMode ? "dark" : ""}`}
        >
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de citas</h1>

                <div className="iconos-perfil">
                    <div className="bell-container" onClick={() => openModal("notificaciones")}>
                        <span title="Ver tus notificaciones">
                            <Bell className="icon" />
                        </span>
                        {notificacionesNoVistas > 0 && (
                            <span className="notification-badge">{notificacionesNoVistas > 99 ? "99+" : notificacionesNoVistas}</span>
                        )}
                    </div>
                    <Link to="/manicurista/dashboard/perfil">
                        <span title="Tu perfil">
                            <User className="icon" />
                        </span>
                    </Link>
                </div>
            </div>

            <div className="view-toggle-container">
                <div className="view-toggle-buttons">
                    <button
                        className={`view-toggle-btn ${vistaActual === "tabla" ? "active" : ""}`}
                        onClick={() => setVistaActual("tabla")}
                    >
                        <Table size={18} />
                        <span>Tabla</span>
                    </button>
                    <button
                        className={`view-toggle-btn ${vistaActual === "calendario" ? "active" : ""}`}
                        onClick={() => setVistaActual("calendario")}
                    >
                        <Calendar size={18} />
                        <span>Calendario</span>
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar cita..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
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

            {isEditarModalOpen && (
                <div className="overlay-popup" onClick={closeEditarModal}>
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup3">
                            <h2 className="titulo-usuario">Detalles de la cita</h2>

                            <form className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Nombre del cliente:</label>
                                            <input
                                                className="input-select input-solo-lectura"
                                                type="text"
                                                value={citaSeleccionada?.cliente_nombre || ""}
                                                readOnly
                                            />
                                        </div>

                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Nombre de la manicurista:</label>
                                            <input
                                                className="input-select input-solo-lectura"
                                                type="text"
                                                value={citaSeleccionada?.manicurista_nombre || ""}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Fecha:</label>
                                            <input
                                                type="text"
                                                className="input-fecha-activo-fecha-cita input-solo-lectura"
                                                value={citaSeleccionada?.Fecha || ""}
                                                readOnly
                                            />
                                        </div>

                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Hora:</label>
                                            <input
                                                type="text"
                                                className="input-fecha-activo-cita input-solo-lectura"
                                                value={horaFormateada}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Descripción:</label>
                                        <input
                                            type="text"
                                            className="input-texto input-solo-lectura"
                                            value={citaSeleccionada?.Descripcion || ""}
                                            readOnly
                                        />
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Estado:</label>
                                        <input
                                            className="input-select input-solo-lectura"
                                            type="text"
                                            value={citaSeleccionada?.estado_nombre || ""}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Servicios:</label>
                                        <input
                                            className="input-texto input-solo-lectura"
                                            type="text"
                                            value={citaSeleccionada?.serviciosNombres || ""}
                                            readOnly
                                        />
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Total:</label>
                                        <input
                                            className="input-texto input-solo-lectura"
                                            type="text"
                                            value={totalFormateado}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeEditarModal}>
                                        Volver
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="overlay-popup-notifications" onClick={closeModal}>
                    <div className="ventana-popup-notifications" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup-notifications">
                            <div className="notifications-header">
                                <h1 className="notifications-title">Centro de Notificaciones</h1>
                                <button onClick={closeModal} className="close-button">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="tabs-container">
                                <button
                                    className={`tab-button ${tabActiva === "notificaciones" ? "tab-active" : "tab-inactive"}`}
                                    onClick={() => setTabActiva("notificaciones")}
                                >
                                    <div className="tab-content">
                                        <Bell className="w-4 h-4" />
                                        Notificaciones
                                        {notificacionesNoVistas > 0 && <span className="tab-badge">{notificacionesNoVistas}</span>}
                                    </div>
                                </button>
                            </div>

                            {/* Contenido de las pestañas mejorado */}
                            <div className="tab-content-container">
                                {tabActiva === "notificaciones" && (
                                    <div className="tab-panel">
                                        <h2 className="section-title">Notificaciones Recientes</h2>
                                        {notificaciones.length === 0 ? (
                                            <div className="empty-state">
                                                <Bell className="empty-icon" />
                                                <p>No tienes notificaciones nuevas.</p>
                                            </div>
                                        ) : (
                                            <ul className="notifications-list">
                                                {notificaciones.map((n) => (
                                                    <li
                                                        key={n.id}
                                                        className={`notification-item ${!n.visto ? "notification-unread" : "notification-read"}`}
                                                    >
                                                        <div className="notification-content">
                                                            <div className="notification-text">
                                                                <p className="notification-message">{n.mensaje}</p>
                                                                <p className="notification-date">{n.fecha}</p>
                                                            </div>
                                                            {!n.visto && <span className="notification-dot"></span>}
                                                        </div>
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

export default GestionCitasMan