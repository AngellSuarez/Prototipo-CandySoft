import React, { useState, useEffect } from "react";
import "../../../css/gestionar.css";
import { useTheme } from "../../tema/ThemeContext";
import { listar_servicios, obtener_servicio, crear_servicio, actualizar_servicio, actualizar_estado_servicio, eliminar_servicio, } from "../../../services/servicios_services";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';

const GestionServicioRec = () => {
    const { darkMode } = useTheme();
    const MySwal = withReactContent(Swal);

    const [loading, setLoading] = useState(true);
    const [modoVer, setModoVer] = useState(false);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);

    const [servicios, setServicios] = useState([]);
    const servicioPorPagina = 4;


    const [errores, setErrores] = useState({
        nombre: "",
        precio: "",
        duracion: "",
        descripcion: "",
        estado: "",
        imagen: "",
    });

    const obtenerNombreCampo = (campo) => {
        const nombres = {
            nombre: "nombre",
            descripcion: "descripción",
            duracion: "duracion",
            precio: "precio",
            imagen: "imagen"
        };
        return nombres[campo] || campo;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoServicio((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const [loadingCrear, setLoadingCrear] = useState(false);
    const [loadingActualizar, setLoadingActualizar] = useState(false);

    const handleEditarServicio = async () => {
        setLoadingActualizar(true);
        const erroresValidacion = validarCampos(nuevoServicio);
        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);

            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingActualizar(false);
            return;
        }

        const formData = new FormData();
        formData.append("nombre", nuevoServicio.nombre);
        formData.append("descripcion", nuevoServicio.descripcion);
        formData.append("precio", nuevoServicio.precio);
        formData.append("duracion", nuevoServicio.duracion);
        formData.append("estado", nuevoServicio.estado);
        formData.append("tipo", nuevoServicio.tipo);
        if (nuevoServicio.imagen) {
            formData.append("imagen", nuevoServicio.imagen);
        }

        const respuesta = await actualizar_servicio(servicioSeleccionado.id, nuevoServicio);

        if (respuesta?.errores) {
            setErrores(respuesta.errores);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el servicio. Revisa los campos.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingActualizar(false);
            return;
        }

        if (respuesta) {
            setServicios((prev) =>
                prev.map((serv) =>
                    serv.id === servicioSeleccionado.id ? respuesta : serv
                )
            );
            setMostrarModalEditar(false);
            setServicioSeleccionado(null);
            Swal.fire({
                icon: "success",
                title: "Servicio actualizado",
                text: "Los datos del servicio fueron actualizados correctamente.",
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
            setNuevoServicio({
                nombre: "",
                descripcion: "",
                duracion: "",
                precio: "",
                estado: "Activo",
            });
            setErrores({});
            setLoadingActualizar(false);
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el servicio. Intenta nuevamente.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingActualizar(false);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (!value.trim()) {
            const nombreCampo = obtenerNombreCampo(name);
            setErrores((prev) => ({ ...prev, [name]: `El ${nombreCampo} es obligatorio` }));
        } else {
            let error = "";

            if (name === "precio") {
                if (!/^\d*\.?\d{0,2}$/.test(value)) {
                    error = "El precio debe contener solo números";
                }
            }

            if (error) {
                setErrores((prev) => ({ ...prev, [name]: error }));
            } else {
                setErrores((prev) => {
                    const nuevosErrores = { ...prev };
                    delete nuevosErrores[name];
                    return nuevosErrores;
                });
            }
            if (name === "duracion") {
                const duracionValida = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/; // formato HH:MM:SS
                if (!duracionValida.test(value)) {
                    nuevosErrores.duracion = "Formato inválido. Usa HH:MM:SS";
                }
            }

        }

    };

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

    useEffect(() => {
        const fetchServicios = async () => {
            setLoading(true);
            try {
                const data = await listar_servicios();
                setServicios(data || []);
            } catch (err) {
                console.error("Error al cargar servicios:", err);
                setError("No se pudo cargar la lista de servicios");
            } finally {
                setLoading(false);
            }
        };
        fetchServicios();
    }, []);

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return;
        setPaginaActual(numero);
    };

    const handleToggleEstado = async (id) => {
        try {
            const servicio = servicios.find((s) => s.id === id);
            const nuevoEstado = servicio.estado === "Activo" ? "Inactivo" : "Activo";

            await actualizar_estado_servicio(id, nuevoEstado);

            setServicios((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, estado: nuevoEstado } : s
                )
            );

            Swal.fire({
                icon: "success",
                title: "Estado actualizado",
                text: `El servicio ahora está ${nuevoEstado}.`,
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el estado del servicio.",
                customClass: { popup: 'swal-rosado' }
            });
        }
    };

    const serviciosFiltrados = servicios.filter((s) =>
        Object.values(s).some((valor) =>
            String(valor).toLowerCase().includes(busqueda)
        )
    );

    const handleEliminarServicio = async (servicio, onSuccess) => {
        const result = await MySwal.fire({
            title: `Eliminar servicio`,
            html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar el servicio <strong>${servicio.nombre}</strong>?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#7e2952',
            cancelButtonColor: '#d8d6d7',
            reverseButtons: true,
            customClass: {
                popup: 'swal-rosado',
            },
        });

        if (result.isConfirmed) {
            try {
                const { status, data } = await eliminar_servicio(servicio.id);

                if (status === 200) {
                    await MySwal.fire({
                        icon: 'info',
                        title: 'Servicio desactivado',
                        text: 'El servicio fue desactivado porque tiene relaciones activas.',
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }
                    });
                    if (onSuccess) onSuccess(false);

                } else if (status === 204) {
                    await MySwal.fire({
                        icon: 'success',
                        title: 'Servicio eliminado',
                        text: 'El servicio fue eliminado correctamente.',
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }
                    });
                    if (onSuccess) onSuccess(true);

                } else if (status === 400) {
                    await MySwal.fire({
                        icon: 'warning',
                        title: 'No se puede eliminar',
                        text: data.message || 'El servicio está asociado a una cita pendiente o en proceso.',
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }
                    });

                } else {
                    throw new Error('Error inesperado al eliminar el servicio');
                }

            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                await MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar el servicio. Intenta nuevamente.',
                    confirmButtonColor: '#7e2952',
                    customClass: { popup: 'swal-rosado' }
                });
            }
        }
    };

    const totalPaginasRaw = Math.ceil(serviciosFiltrados.length / servicioPorPagina);
    const totalPaginas = totalPaginasRaw > 0 ? totalPaginasRaw : 1;
    const indiceInicio = (paginaActual - 1) * servicioPorPagina;
    const indiceFin = indiceInicio + servicioPorPagina;
    const serviciosActuales = serviciosFiltrados.slice(indiceInicio, indiceFin);

    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [servicioVisualizado, setServicioVisualizado] = useState(null);
    const [mostrarModalVer, setMostrarModalVer] = useState(false);

    const [nuevoServicio, setNuevoServicio] = useState({
        tipo: "",
        nombre: '',
        precio: '',
        duracion: '',
        descripcion: '',
        estado: 'activo',
        imagen: null,
        url_imagen_preview: null
    });

    const abrirModalCrear = () => {
        setNuevoServicio({
            tipoServicio: "",
            nombre: "",
            precio: "",
            duracion: "",
            descripcion: "",
            estado: "Activo",
        });
        setErrores({});
        setMostrarModalCrear(true);
    };

    const validarCampos = (datos) => {
        const errores = {};

        if (!datos.nombre || datos.nombre.trim() === "") {
            errores.nombre = "El nombre es obligatorio";
        }
        if (!datos.duracion || datos.duracion.trim() === "") {
            errores.duracion = "El duración es obligatoria";
        }
        if (!datos.precio || datos.precio.trim() === "") {
            errores.precio = "El precio es obligatorio";
        } else if (!/^\d*\.?\d{0,2}$/.test(datos.precio)) {
            errores.precio = "El precio debe ser un número válido";
        }

        if (!datos.descripcion || datos.descripcion.trim() === "") {
            errores.descripcion = "La descripción es obligatoria";
        }

        return errores;
    };

    const handleCrearServicio = async () => {
        setLoadingCrear(true);
        const erroresValidacion = validarCampos(nuevoServicio);
        const formData = new FormData();
        formData.append("nombre", nuevoServicio.nombre);
        formData.append("descripcion", nuevoServicio.descripcion);
        formData.append("precio", nuevoServicio.precio);
        formData.append("duracion", nuevoServicio.duracion);
        formData.append("tipo", nuevoServicio.tipo);
        if (nuevoServicio.imagen) {
            formData.append("imagen", nuevoServicio.imagen);
        }


        if (!nuevoServicio.tipo || !nuevoServicio.tipo.trim()) {
            erroresValidacion.tipo = 'El tipo de servicio es obligatorio';
        }

        if (!nuevoServicio.imagen) {
            erroresValidacion.imagen = 'La imagen es obligatoria';
        }

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);

            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingCrear(false);
            return;
        }

        const respuesta = await crear_servicio(nuevoServicio);

        if (respuesta.errores) {
            setErrores(respuesta.errores);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo registrar el servicio. Revisa los campos.",
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingCrear(false);
            return;
        }

        setServicios([...servicios, respuesta]);
        setMostrarModalCrear(false);
        Swal.fire({
            icon: "success",
            title: "Servicio creado",
            text: "El servicio fue registrado exitosamente.",
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: 'swal-rosado' }
        });


        setNuevoServicio({
            tipo: "",
            nombre: "",
            precio: "",
            duracion: "",
            descripcion: "",
            estado: "Activo",
            imagen: null,
            url_imagen_preview: null,
        });
        setErrores({});
        setLoadingCrear(false);
    };

    const handleVerServicio = async (id) => {
        const servicio = await obtener_servicio(id);
        if (servicio) {
            setServicioVisualizado(servicio);
            setMostrarModalVer(true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la información del servicio.',
            });
        }
    };

    const abrirCrear = () => {
        setErrores({
            tipo: "",
            nombre: "",
            precio: "",
            duracion: "",
            descripcion: "",
            estado: "Activo",
            imagen: null,
            url_imagen_preview: null,
        });
        setErrores({});
        setMostrarModalCrear(true);
    };

    useEffect(() => {
        if (!mostrarModalCrear && !mostrarModalEditar) {
            setErrores({
                tipo: "",
                nombre: "",
                precio: "",
                duracion: "",
                descripcion: "",
                estado: "Activo",
                imagen: null,
                url_imagen_preview: null,
            });
            setErrores({});
            setServicioSeleccionado(null);
        }
    }, [mostrarModalCrear, mostrarModalEditar]);

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


    if (loading) return null;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de servicios</h1>

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
                <button className="crear-btn mt-4" onClick={abrirModalCrear}>
                    Crear servicio
                </button>

                <input
                    type="text"
                    placeholder="Buscar servicio..."
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
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {serviciosActuales.length > 0 ? (
                            serviciosActuales.map((servicio) => (
                                <tr key={servicio.id}>
                                    <td>{servicio.nombre}</td>
                                    <td>${servicio.precio}</td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleEstado(servicio.id)}
                                            className={`estado-btn ${servicio.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                                        >
                                            {servicio.estado}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalles del servicio"
                                            onClick={() => {
                                                setServicioSeleccionado(servicio);
                                                setNuevoServicio(servicio);
                                                setModoVer(true);
                                                setMostrarModalEditar(true);
                                            }}
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button
                                            className="acciones-btn editar-btn flex items-center justify-center p-2"
                                            title="Editar el servicio"
                                            onClick={() => {
                                                setServicioSeleccionado(servicio);
                                                setNuevoServicio(servicio);
                                                setModoVer(false);
                                                setMostrarModalEditar(true);
                                            }}
                                        >
                                            <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleEliminarServicio(servicio, (eliminadoCompletamente = false) => {
                                                    if (eliminadoCompletamente) {
                                                        setServicios((prev) => prev.filter((s) => s.id !== servicio.id));
                                                    } else {
                                                        setServicios((prev) =>
                                                            prev.map((s) =>
                                                                s.id === servicio.id ? { ...s, estado: "Inactivo" } : s
                                                            )
                                                        );
                                                    }
                                                })
                                            }
                                            className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                                            title="Eliminar el servicio"
                                        >
                                            <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No se encontraron servicios
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="paginacion-container">
                <div
                    className={`flecha ${paginaActual === 1 ? "flecha-disabled" : ""}`}
                    onClick={() => paginaActual > 1 && cambiarPagina(paginaActual - 1)}
                >
                    &#8592;
                </div>

                <span className="texto-paginacion">
                    Página {paginaActual} de {totalPaginas}
                </span>

                <div
                    className={`flecha ${paginaActual === totalPaginas ? "flecha-disabled" : ""}`}
                    onClick={() => paginaActual < totalPaginas && cambiarPagina(paginaActual + 1)}
                >
                    &#8594;
                </div>
            </div>

            {mostrarModalCrear && (
                <div className="overlay-popup" onClick={() => { setMostrarModalCrear(false); setLoadingCrear(false); }}>
                    <div
                        className="ventana-popup max-h-[300vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Crear servicio</h2>
                            <form
                                encType="multipart/form-data"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCrearServicio();
                                }}
                                className="form-crear-servicio"

                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de sercivio:</label>
                                        <select
                                            name="tipo"
                                            value={nuevoServicio.tipo}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                        >
                                            <option value="">Tipo de servicio *</option>
                                            <option value="Manicure">Manicure</option>
                                            <option value="Pedicure">Pedicure</option>
                                            <option value="Retiros">Retiros</option>
                                        </select>
                                        {errores.tipo && <p className="error-texto">{errores.tipo}</p>}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombre:</label>
                                        <input
                                            name="nombre"
                                            placeholder="Nombre del servicio *"
                                            value={nuevoServicio.nombre}
                                            className="input-texto"
                                            maxLength={40}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                if (regex.test(value) && value.length <= 40) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {errores.nombre && <p className="error-texto">{errores.nombre}</p>}
                                        {nuevoServicio.nombre.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">Has alcanzado el máximo de 40 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo relative">
                                        <label className="subtitulo-editar-todos">Precio:</label>
                                        <input
                                            name="precio"
                                            placeholder="Precio *"
                                            value={nuevoServicio.precio}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                if (/^\d*$/.test(value)) {
                                                    if (Number(value) <= 1000000) {
                                                        handleInputChange(e);
                                                    }
                                                }
                                            }}
                                        />
                                        {errores.precio && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                {errores.precio}
                                            </p>
                                        )}
                                        {/^\d+$/.test(nuevoServicio.precio) && Number(nuevoServicio.precio) === 1000000 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el valor máximo permitido (1,000,000).
                                            </p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Duración:</label>
                                        <input
                                            name="duracion"
                                            placeholder="Ej: 02:00:00 *"
                                            value={nuevoServicio.duracion}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const soloNumerosYDosPuntos = /^[0-9:]{0,8}$/;
                                                const puntos = (value.match(/:/g) || []).length;

                                                if (soloNumerosYDosPuntos.test(value) && puntos <= 2) {
                                                    setNuevoServicio((prev) => ({
                                                        ...prev,
                                                        duracion: value,
                                                    }));
                                                }
                                            }}
                                        />
                                        {errores.duracion && (
                                            <p className="error-texto text-left text-red-600">{errores.duracion}</p>
                                        )}
                                    </div>


                                </div>
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Descripción:</label>
                                        <input
                                            name="descripcion"
                                            placeholder="Descripción *"
                                            value={nuevoServicio.descripcion}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            maxLength={900}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 900) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                        />
                                        {errores.descripcion && <p className="error-texto">{errores.descripcion}</p>}
                                        {nuevoServicio.descripcion.length === 900 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">Has alcanzado el máximo de 900 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-imagen">
                                    <label className="custom-file-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setNuevoServicio((prev) => ({
                                                        ...prev,
                                                        imagen: file,
                                                        url_imagen_preview: URL.createObjectURL(file), // Previsualización local
                                                    }));
                                                }
                                            }}

                                        />
                                        📷 Agregar Imagen
                                    </label>
                                    {errores.imagen && <p className="error-texto">{errores.imagen}</p>}

                                    {nuevoServicio.url_imagen_preview && (
                                        <div className="vista-previa">
                                            <div className="imagen-container">
                                                <img
                                                    src={nuevoServicio.url_imagen_preview || "/placeholder.svg"}
                                                    alt="Vista previa del servicio"
                                                    className="imagen-preview"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="button-container">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setMostrarModalCrear(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-crear" disabled={loadingCrear}>
                                        {loadingCrear ? "Creando servicio..." : "Crear servicio"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div >
            )}

            {(mostrarModalEditar || modoVer) && servicioSeleccionado && (
                <div
                    className="overlay-popup"
                    onClick={() => {
                        setMostrarModalEditar(false);
                        setModoVer(false);
                    }}
                >
                    <div
                        className="ventana-popup max-h-[300vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">
                                {modoVer ? "Detalles del servicio" : "Editar servicio"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!modoVer) handleEditarServicio();
                                }}
                                className="form-crear-usuario"
                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de servicio:</label>
                                        <select
                                            name="tipo_servicio"
                                            value={nuevoServicio.tipo}
                                            onChange={(e) => setNuevoServicio({ ...nuevoServicio, tipo: e.target.value })}
                                            className="input-texto"
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                        >
                                            <option value="">Tipo de servicio</option>
                                            <option value="Manicure">Manicure</option>
                                            <option value="Pedicure">Pedicure</option>
                                            <option value="Retiros">Retiros</option>
                                        </select>
                                        {!modoVer && errores.tipo_servicio && (
                                            <p className="error-texto">{errores.tipo_servicio}</p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombre:</label>
                                        <input
                                            name="nombre"
                                            placeholder="Nombre *"
                                            value={nuevoServicio.nombre}
                                            className="input-texto"
                                            maxLength={40}
                                            readOnly={modoVer}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                if (regex.test(value) && value.length <= 40) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {!modoVer && errores.nombre && (
                                            <p className="error-texto">{errores.nombre}</p>
                                        )}
                                        {!modoVer && nuevoServicio.nombre.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 40 caracteres.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Precio:</label>
                                        <input
                                            name="precio"
                                            placeholder="Precio *"
                                            value={nuevoServicio.precio}
                                            readOnly={modoVer}
                                            className="input-texto"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) {
                                                    if (Number(value) <= 1000000) {
                                                        handleInputChange(e);
                                                    }
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {!modoVer && errores.precio && (
                                            <p className="error-texto">{errores.precio}</p>
                                        )}
                                        {!modoVer && /^\d+$/.test(nuevoServicio.precio) && Number(nuevoServicio.precio) === 1000000 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el valor máximo permitido (1,000,000).
                                            </p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Duración:</label>
                                        <input
                                            name="duracion"
                                            placeholder="Ej: 02:00:00 *"
                                            value={nuevoServicio.duracion}
                                            className="input-texto"
                                            readOnly={modoVer}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const validChars = value.replace(/[^0-9:]/g, "");
                                                const colonCount = (validChars.match(/:/g) || []).length;
                                                if (colonCount <= 2) {
                                                    setNuevoServicio({ ...nuevoServicio, duracion: validChars });
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {!modoVer && errores.duracion && (
                                            <p className="error-texto">{errores.duracion}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Descripción:</label>
                                        <input
                                            name="descripcion"
                                            placeholder="Descripción *"
                                            value={nuevoServicio.descripcion}
                                            readOnly={modoVer}
                                            className="input-texto"
                                            maxLength={900}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 900) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {!modoVer && errores.descripcion && (
                                            <p className="error-texto">{errores.descripcion}</p>
                                        )}
                                        {!modoVer && nuevoServicio.descripcion.length === 900 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 900 caracteres.
                                            </p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Estado:</label>
                                        <select
                                            name="estado"
                                            value={nuevoServicio.estado}
                                            onChange={handleInputChange}
                                            className="input-texto"
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                        {!modoVer && errores.estado && (
                                            <p className="error-texto">{errores.estado}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="fila-imagen">
                                        {!modoVer && (
                                            <label className="custom-file-upload">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNuevoServicio((prev) => ({
                                                                ...prev,
                                                                imagen: file,
                                                                url_imagen_preview: URL.createObjectURL(file),
                                                            }));
                                                        }
                                                    }}
                                                />
                                                📷 Cambiar Imagen
                                            </label>
                                        )}
                                        {servicioSeleccionado.url_imagen && (
                                            <div className="vista-previa">
                                                <div className="imagen-container">
                                                    <img
                                                        src={
                                                            nuevoServicio.url_imagen_preview || servicioSeleccionado.url_imagen
                                                        }
                                                        alt="Imagen del servicio"
                                                        className="imagen-preview"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="button-container">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMostrarModalEditar(false);
                                            setModoVer(false);
                                        }}
                                        className="btn-cancelar"
                                    >
                                        {modoVer ? "Volver" : "Cancelar"}
                                    </button>
                                    {!modoVer && (
                                        <button type="submit" className="btn-crear" disabled={loadingActualizar}>
                                            {loadingActualizar ? "Actualizando..." : "Actualizar"}
                                        </button>
                                    )}
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
        </div >
    );

};

export default GestionServicioRec;