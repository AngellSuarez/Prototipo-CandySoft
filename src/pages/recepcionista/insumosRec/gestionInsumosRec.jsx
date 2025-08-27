import React, { useState, useEffect } from "react";
import "../../../css/gestionar.css";
import { listar_insumos, listar_marcas, crear_insumo, actualizar_insumo, eliminar_insumo, obtener_insumo } from "../../../services/insumos_service";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const GestionInsumosRec = () => {
    const MySwal = withReactContent(Swal);
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [marcas, setMarcas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const insumoPorPagina = 4;

    const [formulario, setFormulario] = useState({
        nombre: "",
        stock: "",
        marca_id: "",
    });

    const [calificaciones, setCalificaciones] = useState([])
    const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
    const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [tabActiva, setTabActiva] = useState("notificaciones")

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

    const [errores, setErrores] = useState({});
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalVer, setMostrarModalVer] = useState(false);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [tocado, setTocado] = useState({});

    const handleBlur = (e) => {
        const { name } = e.target;
        setTocado((prev) => ({ ...prev, [name]: true }));
        validarCampo(name, formulario[name]);
    };

    const validarCampo = (name, value) => {
        let error = "";

        if (name === "nombre" && !value.trim()) {
            error = "Campo obligatorio";
        }

        if (name === "stock") {
            if (!value || isNaN(value) || parseInt(value) < 0) {
                error = "El stock debe ser un número mayor o igual a 0";
            }
        }

        if (name === "marca_id" && !value) {
            error = "Seleccione una marca";
        }

        setErrores((prev) => ({ ...prev, [name]: error }));
    };


    useEffect(() => {
        if (!mostrarModalCrear && !mostrarModalEditar) {
            setFormulario({
                nombre: "",
                stock: "",
                marca_id: "",
                estado: "Activo",
            });
            setErrores({});
            setTocado({});
            setInsumoSeleccionado(null);
        }
    }, [mostrarModalCrear, mostrarModalEditar]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormulario((prev) => ({ ...prev, [name]: value }));
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };


    const validarTodo = (formulario) => {
        const nuevosErrores = {};

        if (!formulario.nombre.trim()) {
            nuevosErrores.nombre = "Campo obligatorio";
        }

        if (!formulario.stock || isNaN(formulario.stock) || parseInt(formulario.stock) < 0) {
            nuevosErrores.stock = "El stock debe ser un número mayor o igual a 0";
        }

        if (!formulario.marca_id) {
            nuevosErrores.marca_id = "Seleccione una marca";
        }

        return nuevosErrores;
    };

    const handleCrear = async () => {
        setLoading(true);
        const erroresValidacion = validarTodo(formulario);

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            setTocado({
                nombre: true,
                stock: true,
                marca_id: true
            });
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoading(false);
            return;
        }

        try {
            const respuesta = await crear_insumo({
                nombre: formulario.nombre,
                stock: parseInt(formulario.stock),
                marca_id: parseInt(formulario.marca_id),
            });

            if (respuesta.errores) {
                setErrores(respuesta.errores);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo registrar el insumo. Revisa los campos.",
                    customClass: { popup: 'swal-rosado' }
                });
                return;
            }

            setInsumos([...insumos, respuesta]);
            setMostrarModalCrear(false);
            Swal.fire({
                icon: "success",
                title: "Insumo creado",
                text: "El insumo fue registrado exitosamente.",
                timer: 2000,
                customClass: { popup: 'swal-rosado' },
                showConfirmButton: false,
            });

            setFormulario({
                nombre: "",
                stock: "",
                marca_id: "",
            });
            setErrores({});
            setTocado({});
        } catch (error) {
            console.error("Error inesperado:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "No se pudo registrar el insumo. Intenta nuevamente.",
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoading(false); // ✅ Se ejecuta pase lo que pase
        }
    };

    const handleEditar = async () => {
        setLoadingEditar(true);

        const erroresValidacion = validarTodo(formulario);

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);
            setTocado({
                nombre: true,
                stock: true,
                marca_id: true,
            });

            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });

            setLoadingEditar(false); // ✅ IMPORTANTE: detener loading aquí también
            return;
        }

        try {
            const respuesta = await actualizar_insumo(insumoSeleccionado.id, {
                nombre: formulario.nombre,
                stock: parseInt(formulario.stock),
                marca_id: parseInt(formulario.marca_id),
                estado: formulario.estado,
            });

            if (respuesta?.errores) {
                setErrores(respuesta.errores);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo actualizar el insumo. Revisa los campos.",
                    customClass: { popup: 'swal-rosado' }
                });
                return;
            }

            if (respuesta) {
                setInsumos((prev) =>
                    prev.map((prov) =>
                        prov.id === insumoSeleccionado.id ? respuesta : prov
                    )
                );
                setMostrarModalEditar(false);
                setInsumoSeleccionado(null);

                Swal.fire({
                    icon: "success",
                    title: "Insumo actualizado",
                    text: "Los datos del insumo fueron actualizados correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'swal-rosado' }
                });

                setFormulario({
                    nombre: "",
                    stock: "",
                    marca_id: "",
                    estado: "Activo",
                });
                setErrores({});
                setTocado({});
            }
        } catch (error) {
            console.error("Error inesperado al actualizar insumo:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "Ocurrió un error al actualizar el insumo. Intenta nuevamente.",
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoadingEditar(false); // ✅ Siempre se ejecuta
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            const datosInsumos = await listar_insumos();
            const datosMarcas = await listar_marcas();
            console.log("Datos de insumos:", datosInsumos);
            setInsumos(datosInsumos);
            setMarcas(datosMarcas);
        };
        cargarDatos();
    }, []);

    const handleEliminar = async (id) => {
        const confirm = await MySwal.fire({
            title: "¿Eliminar insumo?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: '#7e2952',
            cancelButtonColor: '#d8d6d7',
            reverseButtons: true,
            customClass: {
                popup: 'swal-rosado',
            },
        });

        if (confirm.isConfirmed) {
            try {
                const res = await eliminar_insumo(id);

                if (res.eliminado) {
                    setInsumos((prev) => prev.filter((i) => i.id !== id));
                    Swal.fire({
                        title: "Eliminado",
                        text: "El insumo fue eliminado correctamente.",
                        icon: "success",
                        customClass: {
                            popup: 'swal-rosado',
                        },
                    });
                } else {
                    let mensaje = "El insumo no pudo eliminarse por una razón desconocida.";

                    if (res.message?.includes("compra no completada")) {
                        mensaje = "No se puede eliminar el insumo porque está en una compra no completada o cancelada.";
                    } else if (res.message?.includes("abastecimiento sin reportar")) {
                        mensaje = "No se puede eliminar el insumo porque tiene un abastecimiento sin reportar.";
                    }

                    Swal.fire({
                        title: "No se pudo eliminar",
                        text: mensaje,
                        icon: "error",
                        customClass: {
                            popup: 'swal-rosado',
                        },
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Error inesperado",
                    text: error.message || "Ocurrió un error al intentar eliminar el insumo.",
                    icon: "error",
                    customClass: {
                        popup: 'swal-rosado',
                    },
                });
            }
        }
    };

    const abrirEditar = (insumo) => {
        setFormulario({
            nombre: insumo.nombre,
            stock: insumo.stock.toString(),
            marca_id: typeof insumo.marca_id === "object" ? insumo.marca_id.id : insumo.marca_id,
            estado: insumo.estado,
        });
        setInsumoSeleccionado(insumo);
        setMostrarModalEditar(true);
    };

    const abrirVer = async (id) => {
        const insumo = await obtener_insumo(id);
        setInsumoSeleccionado(insumo);
        setMostrarModalVer(true);
    };

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    const insumosFiltrados = insumos.filter((i) =>
        Object.values(i).some((val) =>
            String(val).toLowerCase().includes(busqueda.toLowerCase())
        )
    );

    const totalPaginasRaw = Math.ceil(insumosFiltrados.length / insumoPorPagina);
    const totalPaginas = totalPaginasRaw > 0 ? totalPaginasRaw : 1;
    const indiceInicio = (paginaActual - 1) * insumoPorPagina;
    const indiceFin = indiceInicio + insumoPorPagina;
    const insumosActuales = insumosFiltrados.slice(indiceInicio, indiceFin);

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


    return (
        <div className="roles-container">
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de Insumos</h1>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setMostrarModalCrear(true)} className="crear-btn mt-4">Crear Insumo</button>

                <input
                    type="text"
                    placeholder="Buscar insumo..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>
            <div className="overflow-hidden">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Stock</th>
                            <th>Marca</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insumosActuales.length > 0 ? (
                            insumosActuales.map((insumo) => (
                                <tr key={insumo.id}>
                                    <td>{insumo.nombre}</td>
                                    <td>{insumo.stock}</td>
                                    <td>{typeof insumo.marca_id === "object" ? insumo.marca_id.nombre : (marcas.find((m) => m.id === insumo.marca_id)?.nombre || "Sin marca")}</td>
                                    <td>
                                        <span
                                            className={`estado-texto ${insumo.estado === 'Activo'
                                                ? 'estado-completada'
                                                : insumo.estado === 'Agotado'
                                                    ? 'estado-agotado'
                                                    : insumo.estado === 'Bajo'
                                                        ? 'estado-bajo'
                                                        : ''
                                                }`}
                                        >
                                            {insumo.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => abrirVer(insumo.id)} title="Ver detalles del insumo" className="acciones-btn ver-btn p-2">
                                            <AiOutlineEye size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button onClick={() => abrirEditar(insumo)} title="Editar insumo" className="acciones-btn editar-btn p-2">
                                            <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button onClick={() => handleEliminar(insumo.id)} title="Eliminar el insumo" className="acciones-btn eliminar-btn p-2">
                                            <FiTrash2 size={16} className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center">No se encontraron insumos</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
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

            {mostrarModalCrear && (
                <ModalInsumo
                    titulo="Crear Insumo"
                    onClose={() => setMostrarModalCrear(false)}
                    onSave={handleCrear}
                    formulario={formulario}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                    errores={errores}
                    marcas={marcas}
                    tocado={tocado}
                    esEdicion={false}
                    loading={loading} // ✅ Se está pasando correctamente aquí
                />
            )}

            {mostrarModalEditar && (
                <ModalInsumo
                    titulo="Editar Insumo"
                    onClose={() => setMostrarModalEditar(false)}
                    onSave={handleEditar}
                    formulario={formulario}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                    errores={errores}
                    marcas={marcas}
                    tocado={tocado}
                    esEdicion={true}
                    loading={loadingEditar} // ✅ ¡Esto FALTABA!
                />
            )}

            {mostrarModalVer && insumoSeleccionado && (
                <ModalInsumo
                    titulo="Detalles del insumo"
                    onClose={() => setMostrarModalVer(false)}
                    onSave={() => { }}
                    formulario={insumoSeleccionado}
                    handleInputChange={() => { }}
                    handleBlur={() => { }}
                    errores={{}}
                    marcas={marcas}
                    tocado={{}}
                    esEdicion={false}
                    esSoloLectura={true}
                />
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
    );
};


const ModalInsumo = ({
    titulo,
    onClose,
    onSave,
    formulario,
    handleInputChange,
    handleBlur,
    errores,
    marcas,
    tocado,
    esEdicion,
    loading,
    esSoloLectura = false,
}) => (
    <div className="overlay-popup" onClick={onClose}>
        <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
                <h2 className="text-xl font-semibold mb-4">{titulo}</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-3">
                    <div className="fila-formulario">
                        <div className="campo">
                            <label htmlFor="nombre" className="subtitulo-editar-todos">Nombre:</label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                placeholder={esEdicion ? "" : "Nombre *"}
                                value={formulario.nombre}
                                maxLength={40}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                    if (regex.test(value) && value.length <= 40) {
                                        handleInputChange(e);
                                    }
                                }}
                                onBlur={handleBlur}
                                className="input-texto"
                                readOnly={esSoloLectura}
                            />
                            {tocado.nombre && errores.nombre && (
                                <p className="error-texto">{errores.nombre}</p>
                            )}
                            {formulario.nombre.length === 40 && (
                                <p className="error-texto">
                                    Has alcanzado el máximo de 40 caracteres.
                                </p>
                            )}

                        </div>
                        <div className="campo">
                            <label htmlFor="stock" className="subtitulo-editar-todos">Stock:</label>
                            <input
                                type="number"
                                name="stock"
                                id="stock"
                                min="0"
                                placeholder={esEdicion ? "" : "Stock *"}
                                value={formulario.stock}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="input-texto"
                                disabled={esSoloLectura}
                            />
                            {tocado.stock && errores.stock && <p className="error-texto">{errores.stock}</p>}
                        </div>
                    </div>

                    <div className="fila-formulario">
                        <div className="campo">
                            <label htmlFor="marca_id" className="subtitulo-editar-todos">Marca:</label>
                            <select
                                name="marca_id"
                                id="marca_id"
                                value={formulario.marca_id}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                className="input-select"
                                onKeyDown={(e) => esSoloLectura && e.preventDefault()}
                                style={{ pointerEvents: esSoloLectura ? "none" : "auto" }}
                            >
                                <option value="">{esEdicion ? "Seleccione una marca" : "Seleccionar marca *"}</option>
                                {marcas.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                            {tocado.marca_id && errores.marca_id && <p className="error-texto">{errores.marca_id}</p>}
                        </div>

                        {(esEdicion || esSoloLectura) && (
                            <div className="campo" >
                                <label htmlFor="estado" className="subtitulo-editar-todos">Estado:</label>
                                <select
                                    id="estado"
                                    name="estado"
                                    value={formulario.estado}
                                    onChange={handleInputChange}
                                    className="input-select"
                                    onKeyDown={(e) => esSoloLectura && e.preventDefault()}
                                    style={{ pointerEvents: esSoloLectura ? "none" : "auto" }}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Agotado">Agotado</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="button-container">
                        {esSoloLectura ? (
                            <button type="button" className="btn-cancelar" onClick={onClose}>Volver</button>
                        ) : (
                            <>
                                <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
                                <button type="submit" className="btn-crear" disabled={loading}>
                                    {loading
                                        ? esEdicion
                                            ? "Actualizando..."
                                            : "Creando insumo..."
                                        : esEdicion
                                            ? "Actualizar"
                                            : "Crear insumo"}
                                </button>

                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    </div>
);

export default GestionInsumosRec;