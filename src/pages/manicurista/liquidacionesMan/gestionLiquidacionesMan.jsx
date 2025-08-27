import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import "../../../css/gestionar.css";
import "../../../css/liquidaciones.css";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTheme } from "../../tema/ThemeContext";
import { Link } from "react-router-dom";
import { Bell, User, X } from 'lucide-react';
import { listar_liquidaciones, listar_citas_completadas } from "../../../services/liquidaciones_service.js"

const GestionLiquidacionesMan = () => {
    const [liquidaciones, setLiquidaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const MySwal = withReactContent(Swal);

    //listar liquidaciones
    useEffect(() => {
        const fetchLiquidaciones = async () => {
            setLoading(true);
            try {
                const data = await listar_liquidaciones();
                const userId = localStorage.getItem("user_id");

                // Filtrar solo las liquidaciones de la manicurista logueada
                const liquidacionesFiltradas = data?.filter(
                    (liquidacion) => liquidacion.manicurista_id === parseInt(userId)
                );

                setLiquidaciones(liquidacionesFiltradas || []);
            } catch (err) {
                console.error("Error al cargar liquidaciones:", err);
                setError("No se pudo cargar la lista de liquidaciones");
            } finally {
                setLoading(false);
            }
        };
        fetchLiquidaciones();
    }, []);

    const [busqueda, setBusqueda] = useState("");
    const [liquidacionSeleccionado, setLiquidacionSeleccionado] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 4;

    const [isVerModalOpen, setVerModalOpen] = useState(false);

    const openVerModal = async (liquidacion) => {

        if (!liquidacion || !liquidacion.manicurista_id || !liquidacion.FechaInicial || !liquidacion.FechaFinal) {
            console.error("Liquidación o sus propiedades necesarias están incompletas:", liquidacion);
            return;
        }

        const citas = await handleBuscarCitas_modal(
            liquidacion.manicurista_id,
            liquidacion.FechaInicial,
            liquidacion.FechaFinal
        );

        console.log("Citas recibidas en openVerModal:", citas);

        const liquidacionConCitas = {
            ...liquidacion,
            citas: citas
        };

        setLiquidacionSeleccionado(liquidacionConCitas);
        setVerModalOpen(true);
    };

    const closeVerModal = () => {
        setLiquidacionSeleccionado(null);
        setVerModalOpen(false);
    };

    const handleBuscar = (e) => {
        const valorBusqueda = e.target.value.toLowerCase();
        setBusqueda(valorBusqueda);
        setPaginaActual(1);
    };

    const liquidacionesFiltradas = liquidaciones.filter(liquidacion =>
        Object.values(liquidacion).some(valor =>
            String(valor).toLowerCase().includes(busqueda)
        )
    );

    const indexUltima = paginaActual * itemsPorPagina;
    const indexPrimera = indexUltima - itemsPorPagina;
    const liquidacionesActuales = liquidacionesFiltradas.slice(indexPrimera, indexUltima);
    const totalPaginas = Math.ceil(liquidacionesFiltradas.length / itemsPorPagina);

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return;
        setPaginaActual(numero);
    };

    const handleBuscarCitas_modal = async (manicuristaId, fechaInicial, fechaFinal) => {

        try {
            const response = await listar_citas_completadas(
                manicuristaId,
                fechaFinal,
                fechaInicial
            );

            if (!response || !response.detalle) {
                console.warn("No se pudo obtener la información de citas o detalle vacío.");
                return [];
            }

            const citasMapeadas = response.detalle.map(cita => ({
                fecha: cita.Fecha,
                total: cita.Total,
                servicio: "No especificado"
            }));
            return citasMapeadas;
        } catch (error) {
            console.error("Error al cargar citas en handleBuscarCitas:", error);
            return [];
        }
    };

    const { darkMode } = useTheme();

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

    if (loading) return null;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión liquidaciones</h1>

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

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Buscar liquidación..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>

            <table className="roles-table">
                <thead>
                    <tr>
                        <th>Manicurista</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Final</th>
                        <th>Total</th>
                        <th>Comisión</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {liquidacionesActuales.length > 0 ? (
                        [...liquidacionesActuales]
                            .sort((a, b) => b.id - a.id)
                            .map((liq) => (
                                <tr key={liq.id}>
                                    <td>{liq.manicurista_nombre}</td>
                                    <td>{liq.FechaInicial}</td>
                                    <td>{liq.FechaFinal}</td>
                                    <td>$ {parseFloat(liq.TotalGenerado).toLocaleString('es-CO')}</td>
                                    <td>$ {parseFloat(liq.Comision).toLocaleString('es-CO')}</td>
                                    <td className="text-center space-x-2">
                                        <button onClick={() => openVerModal(liq)}
                                            className="acciones-btn ver-btn"
                                            title="Ver detalles de la liquidación">
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center p-4">No se encontraron liquidaciones</td>
                        </tr>
                    )}
                </tbody>

            </table>

            {/* Paginación */}
            <div className="paginacion-container">
                <div
                    className={`flecha ${paginaActual === 1 ? 'flecha-disabled' : ''}`}
                    onClick={() => cambiarPagina(paginaActual - 1)}
                >
                    &#8592;
                </div>

                <span className="texto-paginacion">
                    Página {paginaActual} de {totalPaginas}
                </span>

                <div
                    className={`flecha ${paginaActual === totalPaginas ? 'flecha-disabled' : ''}`}
                    onClick={() => cambiarPagina(paginaActual + 1)}
                >
                    &#8594;
                </div>
            </div>

            {isVerModalOpen && liquidacionSeleccionado && (
                <div className="overlay-popup" onClick={closeVerModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="titulo-usuario">Detalles de la liquidación</h2>

                            <div className="info-usuario space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario ">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Nombre de la manicurista:</label>
                                            <input
                                                className="input-select"
                                                value={liquidacionSeleccionado.manicurista_nombre}
                                                readOnly
                                            />
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Fecha de inicio:</label>
                                            <input
                                                className="input-select"
                                                value={liquidacionSeleccionado.FechaInicial}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Fecha final:</label>
                                            <input
                                                className="input-select"
                                                value={liquidacionSeleccionado.FechaFinal}
                                                readOnly
                                            />
                                        </div>
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Total:</label>
                                            <input
                                                className="input-select"
                                                value={Number(liquidacionSeleccionado.TotalGenerado).toLocaleString("es-CO", {
                                                    style: "currency",
                                                    currency: "COP",
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                })}
                                                readOnly
                                            />

                                        </div>
                                    </div>
                                    <div className="fila-formulario">
                                        <div className="campo">
                                            <label className="subtitulo-editar-todos">Comisión:</label>
                                            <input
                                                className="input-select"
                                                value={Number(liquidacionSeleccionado.Comision).toLocaleString("es-CO", {
                                                    style: "currency",
                                                    currency: "COP",
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                })}
                                                readOnly
                                            />

                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="tabla-liq">
                                <table className="roles-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liquidacionSeleccionado.citas.map((cita, index) => (
                                            <tr key={index}>
                                                <td>{cita.fecha}</td>
                                                <td>
                                                    {Number(cita.total).toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="button-container" >
                                <button className="btn-crear" onClick={closeVerModal}>
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
    );
};

export default GestionLiquidacionesMan;