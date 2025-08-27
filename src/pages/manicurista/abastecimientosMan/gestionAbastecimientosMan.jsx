import React, { useState } from "react";
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai";
import { FiTrash2 } from "react-icons/fi";
import "../../../css/gestionar.css";
import "../../../css/abastecimientos.css";
import "../../../css/liquidaciones.css";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTheme } from "../../tema/ThemeContext";
import { Link } from "react-router-dom";
import { Bell, User, X } from 'lucide-react';
import { useCallback } from "react";

import { useEffect } from "react";
import { getAbastecimiento, getAbastecimientos, reportarInsumos } from '../../../services/abastecimientos_service';

const GestionAbastecimientosMan = () => {

    const [abastecimientos, setAbastecimientos] = useState([]);

    const { darkMode } = useTheme();
    const [erroresEstado, setErroresEstado] = useState({})
    const [loadingCompletar, setLoadingCompletar] = useState(false)

    const [abastecimientoSeleccionado, setAbastecimientoSeleccionado] = useState(null);

    //efects para cargar los datos necesarios al inicio, manicuristas, insumos
    const fetchAbastecimientos = useCallback(async () => {
        try {
            const data = await getAbastecimientos();
            const userId = localStorage.getItem("user_id");

            // Filtrar solo los abastecimientos de la manicurista logueada
            const abastecimientosFiltradas = data?.filter(
                (abastecimiento) => abastecimiento.manicurista_id === parseInt(userId)
            );

            setAbastecimientos(abastecimientosFiltradas || []);
        } catch (err) {
            console.error("Error al cargar abastecimientos:", err);
            setError("No se pudo cargar la lista de abastecimientos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAbastecimientos();
    }, [fetchAbastecimientos]);

    //parte de ver abasteciminento
    useEffect(() => {
        if (abastecimientoSeleccionado) {
            console.log("Abastecimiento seleccionado (después de la actualización de estado): ", abastecimientoSeleccionado);
        }
    }, [abastecimientoSeleccionado]);
    const [isVerModalOpen, setVerModalOpen] = useState(false);
    const openVerModal = async (abastecimiento) => {
        try {
            const data = await getAbastecimiento(abastecimiento.id);
            console.log("Abastecimiento obtenido: ", data);
            setAbastecimientoSeleccionado(data);
            console.log("Abastecimiento seleccionado: ", abastecimientoSeleccionado);
            setVerModalOpen(true);
        } catch (error) {
            MySwal.fire({
                title: 'Error al obtener el abastecimiento',
                text: error ? error : 'No se pudo cargar el abastecimiento seleccionado.',
                icon: 'error',
                confirmButtonColor: '#7e2952',
                customClass: {
                    popup: 'swal-rosado'
                }
            })
        }
    };
    const closeVerModal = () => {
        setAbastecimientoSeleccionado(null);
        setVerModalOpen(false);
    };

    //parte de reportar insumos
    const [isReportarModalOpen, setReportarModalOpen] = useState(false);
    const [insumosParaReporte, setInsumosParaReporte] = useState([]);

    // Funciones del modal
    const openReportarModal = () => setReportarModalOpen(true);
    const closeReportarModal = () => {
        setReportarModalOpen(false);
        setInsumosParaReporte([]);
    };

    //parte de buscar abastecimiento en la barra de busqueda
    const [busqueda, setBusqueda] = useState("");
    const handleBuscar = (e) => {
        const valorBusqueda = e.target.value.toLowerCase();
        setBusqueda(valorBusqueda);
        setPaginaActual(1);
    };
    const abastecimientosFiltrados = abastecimientos.filter(abastecimiento =>
        Object.values(abastecimiento).some(valor =>
            String(valor).toLowerCase().includes(busqueda)
        )
    );

    //parte de la paginacion
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 3;
    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= Math.ceil(abastecimientosFiltrados.length / itemsPorPagina)) {
            setPaginaActual(nuevaPagina);
        }
    };
    const indexUltima = paginaActual * itemsPorPagina;
    const indexPrimera = indexUltima - itemsPorPagina;
    const abastecimientosActuales = abastecimientosFiltrados.slice(indexPrimera, indexUltima);
    const totalPaginas = Math.ceil(abastecimientosFiltrados.length / itemsPorPagina);

    const MySwal = withReactContent(Swal);

    const completarAbastecimiento = async (abastecimiento) => {
        if (abastecimiento.estado !== 'Sin reportar') {
            console.warn('El abastecimiento no está en estado "Sin reportar"');
            return;
        }

        try {
            const data = await getAbastecimiento(abastecimiento.id);
            setAbastecimientoSeleccionado(data);

            const insumosFormateados = data.insumos?.map(ins => ({
                id: ins.id,
                nombre: ins.insumo_nombre,
                estado: ins.estado,
                comentario: ins.comentario || ''
            })) || [];

            setInsumosParaReporte(insumosFormateados);
            openReportarModal();

        } catch (error) {
            console.error('Error al obtener el detalle del abastecimiento:', error);
            MySwal.fire({
                title: "Error al obtener detalles",
                text: error.message || 'No se pudo cargar el abastecimiento seleccionado.',
                icon: "error",
                confirmButtonColor: '#7e2952',
                customClass: {
                    popup: 'swal-rosado'
                }
            })
        }
    };
    const actualizarInsumo = (index, campo, valor) => {
        const nuevosInsumos = [...insumosParaReporte];
        nuevosInsumos[index][campo] = valor;
        setInsumosParaReporte(nuevosInsumos);
    };

    const validarEstadosInsumos = () => {
        const errores = {}
        const insumosIncompletos = []

        insumosParaReporte.forEach((insumo, index) => {
            if (!insumo.estado || insumo.estado.trim() === "") {
                errores[index] = "Debe seleccionar un estado"
                insumosIncompletos.push({
                    index,
                    nombre: insumo.nombre,
                })
            }
        })

        setErroresEstado(errores)
        return { esValido: Object.keys(errores).length === 0, insumosIncompletos }
    }

    const handleCompletarAbastecimiento = async () => {
        const { esValido, insumosIncompletos } = validarEstadosInsumos()

        if (!esValido) {
            const listaInsumos = insumosIncompletos.map((item) => `• ${item.nombre}`).join("<br>")

            Swal.fire({
                icon: "error",
                title: "⚠️ Estados Requeridos",
                html: `
              <div style="text-align: left; padding: 15px;">
                <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                  <strong>Debe seleccionar el estado para todos los insumos:</strong>
                </p>
                <div style="background-color: #fee; border: 2px solid #fcc; border-radius: 8px; padding: 15px; margin: 10px 0;">
                  <p style="color: #c33; font-size: 14px; font-weight: bold; margin-bottom: 10px;">
                    Insumos sin estado seleccionado:
                  </p>
                  <div style="color: #c33; font-size: 13px; line-height: 1.6;">
                    ${listaInsumos}
                  </div>
                </div>
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin: 15px 0;">
                  <p style="color: #856404; font-size: 13px; margin: 0;">
                    💡 <strong>Instrucciones:</strong> Seleccione el estado correspondiente (Acabado, Uso medio, Bajo) para cada insumo en la tabla antes de completar el reporte.
                  </p>
                </div>
              </div>
            `,
                confirmButtonText: "Entendido",
                confirmButtonColor: "#dc3545",
                customClass: {
                    popup: "swal-rosado",
                    htmlContainer: "text-left",
                },
                width: "550px",
                focusConfirm: false,
                allowOutsideClick: false,
            })
            return
        }

        // Show confirmation dialog
        const confirmacion = await Swal.fire({
            title: "¿Confirmar completar abastecimiento?",
            html: `
            <div style="text-align: left; padding: 10px;">
              <p style="color: #666; font-size: 15px; margin-bottom: 15px;">
                Se va a marcar como <strong>reportado</strong> el abastecimiento con los siguientes estados:
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 10px 0; max-height: 200px; overflow-y: auto;">
                ${insumosParaReporte
                    .map(
                        (insumo) => `
                  <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                    <span style="font-weight: 500;">${insumo.nombre}</span>
                    <span style="color: #7e2952; font-weight: bold;">${insumo.estado}</span>
                  </div>
                `,
                    )
                    .join("")}
              </div>
              <p style="color: #666; font-size: 13px; margin-top: 15px;">
                ⚠️ <em>Esta acción no se puede deshacer.</em>
              </p>
            </div>
          `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, completar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            customClass: { popup: "swal-rosado" },
            width: "500px",
        })

        if (!confirmacion.isConfirmed) return

        setLoadingCompletar(true)
        try {
            // Formatear datos para el API
            const insumosFormateados = insumosParaReporte.map((insumo) => ({
                id: insumo.id,
                estado: insumo.estado,
                comentario: insumo.comentario || "",
            }))

            console.log("Enviando datos:", {
                abastecimiento_id: abastecimientoSeleccionado.id,
                insumos_reporte: insumosFormateados,
            })

            await reportarInsumos(abastecimientoSeleccionado.id, insumosFormateados)

            MySwal.fire({
                title: "Abastecimiento Completado",
                html: `
              <div style="text-align: center; padding: 15px;">
                <p style="color: #7e2952; font-size: 16px; margin-bottom: 10px;">
                  El abastecimiento ha sido reportado exitosamente
                </p>
                <p style="color: #666; font-size: 14px;">
                  Estado cambiado a: <strong>Reportado</strong>
                </p>
              </div>
            `,
                icon: "success",
                confirmButtonColor: "#28a745",
                customClass: {
                    popup: "swal-rosado",
                },
                timer: 3000,
                timerProgressBar: true,
            })
            closeReportarModal()
            fetchAbastecimientos() // Recargar lista de abastecimientos
            setLoadingCompletar(false)
        } catch (error) {
            console.error("Error al completar abastecimiento:", error)
            MySwal.fire({
                title: "Error al reportar el abastecimiento",
                text: error.message || "No se pudo reportar el abastecimiento.",
                icon: "error",
                confirmButtonColor: "#7e2952",
                customClass: {
                    popup: "swal-rosado",
                },
            })
            setLoadingCompletar(false)
        }
    }

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión abastecimientos</h1>

                <div className="iconos-perfil">
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
                    placeholder="Buscar abastecimiento..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>
            <table className="roles-table">
                <thead>
                    <tr>
                        <th>Fecha creacion</th>
                        <th>Manicurista</th>
                        <th>Fecha Reporte</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {abastecimientosActuales.length > 0 ? (
                        abastecimientosActuales.map((abastecimiento) => {
                            const esEditable = abastecimiento.estado != 'Reportado';

                            return (
                                <tr key={abastecimiento.id}>
                                    <td>{abastecimiento.fecha_creacion}</td>
                                    <td>{abastecimiento.manicurista_nombre}</td>
                                    <td>{abastecimiento.fecha_reporte ? abastecimiento.fecha_reporte : 'no reportado'}</td>
                                    <td>
                                        <span
                                            className={`estado-texto ${abastecimiento.estado === 'Reportado'
                                                ? 'estado-reportada'
                                                : abastecimiento.estado === 'Sin reportar'
                                                    ? 'estado-sin-reportar'
                                                    : 'estado-texto'
                                                }`}
                                        >
                                            {abastecimiento.estado}
                                        </span>
                                    </td>
                                    <td className="text-center space-x-2">
                                        <button
                                            onClick={() => openVerModal(abastecimiento)}
                                            className="acciones-btn editar-btn flex items-center justify-center p-2"
                                            title="Ver detalles del abastecimiento"
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>

                                        {abastecimiento.estado !== 'Reportado' && (
                                            <button
                                                onClick={() => esEditable && completarAbastecimiento(abastecimiento)}
                                                className={`acciones-btn ver-btn flex items-center justify-center p-2 rounded transition-all duration-200 ${!esEditable
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-green-50 hover:scale-105'
                                                    }`}
                                                disabled={!esEditable}
                                                title={
                                                    !esEditable
                                                        ? "No se puede completar el abastecimiento"
                                                        : "Completar el abastecimiento"
                                                }
                                                aria-label="Completar abastecimiento"
                                            >
                                                <AiOutlineCheck
                                                    size={18}
                                                    className={`text-green-500 transition-colors duration-200 ${esEditable ? 'hover:text-green-700' : ''
                                                        }`}
                                                />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center p-4">No se encontraron abastecimientos</td>
                        </tr>
                    )}
                </tbody>
            </table>

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

            {isVerModalOpen && abastecimientoSeleccionado && (
                <div className="overlay-popup" onClick={closeVerModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="titulo-usuario">Detalle del abastecimiento</h2>
                            <div className="info-usuario">
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Manicurista:</label>
                                        <input
                                            type="text"
                                            className="input-select"
                                            readOnly
                                            value={abastecimientoSeleccionado.manicurista_nombre}
                                            onChange={(e) =>
                                                setAbastecimientoSeleccionado({
                                                    ...abastecimientoSeleccionado,
                                                    manicurista_nombre: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos" >Estado:</label>
                                        <input
                                            type="text"
                                            className="input-select"
                                            readOnly
                                            value={abastecimientoSeleccionado.estado}
                                            onChange={(e) =>
                                                setAbastecimientoSeleccionado({
                                                    ...abastecimientoSeleccionado,
                                                    estado: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha creación:</label>
                                        <input
                                            type="date"
                                            className="input-select"
                                            readOnly
                                            value={abastecimientoSeleccionado.fecha_creacion}
                                            onChange={(e) =>
                                                setAbastecimientoSeleccionado({
                                                    ...abastecimientoSeleccionado,
                                                    fecha_creacion: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha Reporte:</label>
                                        {abastecimientoSeleccionado.fecha_reporte ? (
                                            <input
                                                type="date"
                                                className="input-select"
                                                readOnly
                                                value={abastecimientoSeleccionado.fecha_reporte}
                                                onChange={(e) =>
                                                    setAbastecimientoSeleccionado({
                                                        ...abastecimientoSeleccionado,
                                                        fecha_reporte: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="input-select"
                                                readOnly
                                                value="Sin reportar"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="tabla-liq">
                                <table className="roles-table">
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Cantidad</th>
                                            <th>Estado</th>
                                            <th>Comentario</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {abastecimientoSeleccionado.insumos.map((insumo, index) => (
                                            <tr key={index}>
                                                <td>{insumo.insumo_nombre}</td>
                                                <td>{insumo.cantidad}</td>
                                                <td>{insumo.estado}</td>
                                                <td>{insumo.comentario}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

            {isReportarModalOpen && abastecimientoSeleccionado && (
                <div className="overlay-popup" onClick={closeReportarModal}>
                    <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="titulo-usuario">Completar Abastecimiento</h2>
                            <div className="info-usuario space-y-3">
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha creación:</label>
                                        <input
                                            type="date"
                                            className="input-select"
                                            readOnly
                                            value={abastecimientoSeleccionado.fecha_creacion}
                                            onChange={(e) =>
                                                setAbastecimientoSeleccionado({
                                                    ...abastecimientoSeleccionado,
                                                    fecha_creacion: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos" >Estado:</label>
                                        <input
                                            type="text"
                                            className="input-select"
                                            readOnly
                                            value={abastecimientoSeleccionado.estado}
                                            onChange={(e) =>
                                                setAbastecimientoSeleccionado({
                                                    ...abastecimientoSeleccionado,
                                                    estado: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="tabla-rep">
                                    <table className="roles-table">
                                        <thead>
                                            <tr>
                                                <th>Insumo</th>
                                                <th>Estado</th>
                                                <th>Comentarios</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {insumosParaReporte.map((insumo, index) => (
                                                <tr key={insumo.id || index}>
                                                    <td className="rep-insumo">{insumo.nombre}</td>
                                                    <td className="rep-estado">
                                                        <select
                                                            value={insumo.estado}
                                                            onChange={(e) => actualizarInsumo(index, "estado", e.target.value)}
                                                            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${erroresEstado[index]
                                                                ? "border-red-500 bg-red-50"
                                                                : !insumo.estado
                                                                    ? "border-orange-300 bg-orange-50"
                                                                    : "border-gray-300"
                                                                }`}
                                                            required
                                                        >
                                                            <option value="">Seleccionar estado *</option>
                                                            <option value="Acabado">Acabado</option>
                                                            <option value="Uso medio">Uso medio</option>
                                                            <option value="Bajo">Bajo</option>
                                                            <option value="Sin usar">Sin usar</option>
                                                        </select>
                                                        {erroresEstado[index] && (
                                                            <p
                                                                style={{
                                                                    color: "#dc3545",
                                                                    fontSize: "12px",
                                                                    margin: "4px 0 0 0",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {erroresEstado[index]}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="rep-observacion">
                                                        <textarea
                                                            value={insumo.comentario}
                                                            onChange={(e) => actualizarInsumo(index, "comentario", e.target.value)}
                                                            placeholder="Comentarios adicionales..."
                                                            className="cosas-textarea"
                                                            rows="2"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="button-container">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={closeReportarModal}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-crear"
                                        onClick={handleCompletarAbastecimiento}
                                    >
                                        Completar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAbastecimientosMan;