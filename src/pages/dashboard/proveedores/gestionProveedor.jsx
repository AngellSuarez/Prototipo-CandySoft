import React, { useState, useEffect } from "react";
import "../../../css/gestionar.css";
import { useTheme } from "../../tema/ThemeContext";
import { listar_proveedores, actualizar_estado_proveedor, crear_proveedor, eliminar_proveedor, actualizar_proveedor, obtener_proveedor } from "../../../services/proveedor_service";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';

const GestionProveedores = () => {
    const { darkMode } = useTheme();
    const MySwal = withReactContent(Swal);

    const [loading, setLoading] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [proveedores, setProveedores] = useState([]);

    const proveedorPorPagina = 4;

    const [errores, setErrores] = useState({});

    const obtenerNombreCampo = (campo) => {
        const nombres = {
            nombre_representante: "nombre del representante",
            apellido_representante: "apellido del representante",
            telefono: "teléfono",
            email: "correo",
            direccion: "dirección",
            ciudad: "ciudad",
            numero_documento: "número del documento",
            nombre_empresa: "nombre de la empresa",
            telefono_representante: "tel. del representante",
            email_representante: "email del representante",
        };
        return nombres[campo] || campo;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (!value.trim()) {
            const nombreCampo = obtenerNombreCampo(name);
            setErrores((prev) => ({ ...prev, [name]: `El ${nombreCampo} es obligatorio` }));
        } else {
            let error = "";

            if (name === "numero_documento") {
                if (!/^[\d-]{8,15}$/.test(value)) {
                    error = "El número de documento debe tener entre 8 y 15 caracteres numéricos o guiones en caso de nit";
                }
            }


            if (name === "telefono" || name === "telefono_representante") {
                if (!/^\d{10,15}$/.test(value)) {
                    error = "El teléfono debe tener entre 10 y 15 números";
                }
            }

            if (name === "email" || name === "email_representante") {
                const dominiosPermitidos = ["@gmail.com", "@outlook.com", "@yahoo.es"];
                const incluyeDominio = dominiosPermitidos.some((dom) =>
                    value.toLowerCase().endsWith(dom)
                );
                if (!value.includes("@") || !incluyeDominio) {
                    error = "Correo inválido. Ej: @gmail.com, @outlook.com o @yahoo.es";
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

    useEffect(() => {
        const fetchProveedores = async () => {
            try {
                const data = await listar_proveedores();
                setProveedores(data || []);
            } catch (err) {
                console.error("Error al cargar proveedores:", err);
                setError("No se pudo cargar la lista de proveedores");
            } finally {
                setLoading(false);
            }
        };
        fetchProveedores();
    }, []);

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };

    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            setPaginaActual(nuevaPagina);
        }
    };

    const handleToggleEstado = async (id) => {
        try {
            const proveedor = proveedores.find((p) => p.id === id);
            const nuevoEstado = proveedor.estado === "Activo" ? "Inactivo" : "Activo";

            await actualizar_estado_proveedor(id, nuevoEstado);

            setProveedores((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, estado: nuevoEstado } : p
                )
            );

            Swal.fire({
                icon: "success",
                title: "Estado actualizado",
                text: `El proveedor ahora está ${nuevoEstado}.`,
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar el estado del proveedor.",
                customClass: { popup: 'swal-rosado' }
            });
        }
    };

    const proveedoresFiltrados = proveedores.filter((p) =>
        Object.values(p).some((valor) =>
            String(valor).toLowerCase().includes(busqueda)
        )
    );

    const handleEliminarProveedor = async (proveedor, onSuccess) => {
        const result = await MySwal.fire({
            title: `Eliminar proveedor`,
            html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar a <strong>${proveedor.nombre_empresa || proveedor.nombre_representante}</strong>?</p>`,
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
                const eliminado = await eliminar_proveedor(proveedor.id);

                if (eliminado) {
                    await MySwal.fire({
                        icon: 'success',
                        title: 'Proveedor eliminado',
                        text: 'El proveedor fue eliminado exitosamente.',
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }
                    });
                    if (onSuccess) onSuccess(true);
                } else {
                    throw new Error('No se pudo eliminar el proveedor, intentea nuevamente');
                }
            } catch (error) {
                console.error('Error al eliminar proveedor:', error);
                await MySwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el proveedor. Intenta nuevamente.',
                    confirmButtonColor: '#7e2952',
                    customClass: { popup: 'swal-rosado' }
                })
            }
        }
    };

    const totalPaginasRaw = Math.ceil(proveedoresFiltrados.length / proveedorPorPagina);
    const totalPaginas = totalPaginasRaw > 0 ? totalPaginasRaw : 1;
    const indiceInicio = (paginaActual - 1) * proveedorPorPagina;
    const indiceFin = indiceInicio + proveedorPorPagina;
    const proveedoresActuales = proveedoresFiltrados.slice(indiceInicio, indiceFin);
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [modoVer, setModoVer] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

    const [nuevoProveedor, setNuevoProveedor] = useState({
        tipo_persona: "NATURAL",
        tipo_documento: "CC",
        numero_documento: "",
        nombre_empresa: "",
        nombre_representante: "",
        apellido_representante: "",
        telefono: "",
        email: "",
        direccion: "",
        ciudad: "",
        telefono_representante: "",
        email_representante: "",
        estado: "Activo",
    });

    const abrirModalCrear = () => {
        setNuevoProveedor({
            tipo_persona: "NATURAL",
            tipo_documento: "CC",
            numero_documento: "",
            nombre_empresa: "",
            nombre_representante: "",
            apellido_representante: "",
            telefono: "",
            email: "",
            direccion: "",
            ciudad: "",
            telefono_representante: "",
            email_representante: "",
            estado: "Activo",
        });
        setErrores({});
        setMostrarModalCrear(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProveedor({ ...nuevoProveedor, [name]: value });
    };

    const validarCampos = (datos) => {
        const errores = {};
        const esEmpresa = datos.tipo_persona === "JURIDICA" || datos.tipo_documento === "NIT";

        const base = ["telefono", "email", "direccion", "ciudad", "nombre_representante", "apellido_representante"];
        const empresaExtra = ["nombre_empresa", "telefono_representante", "email_representante"];
        const campos = esEmpresa ? [...base, ...empresaExtra] : base;

        campos.forEach(campo => {
            if (!datos[campo] || datos[campo].trim() === "") {
                errores[campo] = "Este campo es obligatorio";
            }
        });

        if (!datos.tipo_persona) errores.tipo_persona = "Seleccione el tipo de persona";
        if (!datos.tipo_documento) errores.tipo_documento = "Seleccione el tipo de documento";
        if (!datos.numero_documento) errores.numero_documento = "Ingrese el número de documento";

        return errores;
    };

    const handleCrearProveedor = async () => {
        setLoading(true);
        const erroresValidacion = validarCampos(nuevoProveedor);

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);

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
            const respuesta = await crear_proveedor(nuevoProveedor);

            if (respuesta.errores) {
                setErrores(respuesta.errores);

                const mensajes = Object.entries(respuesta.errores)
                    .map(([campo, errores]) => `• ${errores.join(', ')}`)
                    .join('\n');

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Corrige los errores indicados en el formulario.",
                    customClass: { popup: 'swal-rosado' }
                });

                return;
            }

            setProveedores([...proveedores, respuesta]);
            setMostrarModalCrear(false);

            Swal.fire({
                icon: "success",
                title: "Proveedor creado",
                text: "El proveedor fue registrado exitosamente.",
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });

            // Reiniciar formulario
            setNuevoProveedor({
                tipo_persona: "NATURAL",
                tipo_documento: "CC",
                numero_documento: "",
                nombre_empresa: "",
                nombre_representante: "",
                apellido_representante: "",
                telefono: "",
                email: "",
                direccion: "",
                ciudad: "",
                telefono_representante: "",
                email_representante: "",
                estado: "Activo",
            });
            setErrores({});
        } catch (error) {
            console.error("Error inesperado al crear proveedor:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "No se pudo crear el proveedor. Intenta nuevamente.",
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoading(false); // ✅ Se ejecuta pase lo que pase
        }
    };

    const handleEditarProveedor = async () => {
        setLoadingEditar(true);

        const erroresValidacion = validarCampos(nuevoProveedor);

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion);

            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: 'swal-rosado' }
            });

            setLoadingEditar(false);
            return;
        }

        try {
            const respuesta = await actualizar_proveedor(proveedorSeleccionado.id, nuevoProveedor);

            if (respuesta?.errores) {
                setErrores(respuesta.errores);

                const mensajes = Object.entries(respuesta.errores)
                    .map(([campo, errores]) => `• ${errores.join(', ')}`)
                    .join('\n');

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Corrige los errores indicados en el formulario.",
                    customClass: { popup: 'swal-rosado' }
                });

                return;
            }

            if (respuesta) {
                setProveedores((prev) =>
                    prev.map((prov) =>
                        prov.id === proveedorSeleccionado.id ? respuesta : prov
                    )
                );
                setMostrarModalEditar(false);
                setProveedorSeleccionado(null);

                Swal.fire({
                    icon: "success",
                    title: "Proveedor actualizado",
                    text: "Los datos del proveedor fueron actualizados correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'swal-rosado' }
                });

                setNuevoProveedor({
                    tipo_persona: "NATURAL",
                    tipo_documento: "CC",
                    numero_documento: "",
                    nombre_empresa: "",
                    nombre_representante: "",
                    apellido_representante: "",
                    telefono: "",
                    email: "",
                    direccion: "",
                    ciudad: "",
                    telefono_representante: "",
                    email_representante: "",
                    estado: "Activo",
                });
                setErrores({});
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo actualizar el proveedor. Intenta nuevamente.",
                    customClass: { popup: 'swal-rosado' }
                });
            }
        } catch (error) {
            console.error("Error inesperado al actualizar proveedor:", error);
            Swal.fire({
                icon: "error",
                title: "Error inesperado",
                text: "Ocurrió un error al actualizar el proveedor. Intenta nuevamente.",
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoadingEditar(false); // ✅ Siempre se ejecuta
        }
    };

    const abrirCrear = () => {
        setErrores({
            tipo_persona: "NATURAL",
            tipo_documento: "CC",
            numero_documento: "",
            nombre_empresa: "",
            nombre_representante: "",
            apellido_representante: "",
            telefono: "",
            email: "",
            direccion: "",
            ciudad: "",
            telefono_representante: "",
            email_representante: "",
            estado: "Activo",
        });
        setErrores({});
        setMostrarModalCrear(true);
    };

    useEffect(() => {
        if (!mostrarModalCrear && !mostrarModalEditar) {
            setErrores({
                tipo_persona: "NATURAL",
                tipo_documento: "CC",
                numero_documento: "",
                nombre_empresa: "",
                nombre_representante: "",
                apellido_representante: "",
                telefono: "",
                email: "",
                direccion: "",
                ciudad: "",
                telefono_representante: "",
                email_representante: "",
                estado: "Activo",
            });
            setErrores({});
            setProveedorSeleccionado(null);
        }
    }, [mostrarModalCrear, mostrarModalEditar]);

    if (loading) return null;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de proveedores</h1>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="crear-btn mt-4" onClick={abrirModalCrear}>
                    Crear proveedor
                </button>

                <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>

            <div className="overflow-hidden">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Número documento</th>
                            <th>Celular</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {proveedoresActuales.length > 0 ? (
                            proveedoresActuales.map((proveedor) => (
                                <tr key={proveedor.id}>
                                    <td>
                                        {proveedor.nombre_empresa
                                            ? proveedor.nombre_empresa
                                            : `${proveedor.nombre_representante} ${proveedor.apellido_representante}`}
                                    </td>

                                    <td>{proveedor.numero_documento}</td>
                                    <td>{proveedor.telefono}</td>
                                    <td>{proveedor.direccion}</td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleEstado(proveedor.id)}
                                            className={`estado-btn ${proveedor.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                                        >
                                            {proveedor.estado}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalles del proveedor"
                                            onClick={() => {
                                                setProveedorSeleccionado(proveedor);
                                                setNuevoProveedor(proveedor);
                                                setModoVer(true);
                                                setMostrarModalEditar(true);
                                            }}
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button
                                            className="acciones-btn editar-btn flex items-center justify-center p-2"
                                            title="Editar el proveedor"
                                            onClick={() => {
                                                setProveedorSeleccionado(proveedor);
                                                setNuevoProveedor(proveedor);
                                                setModoVer(false);
                                                setMostrarModalEditar(true);
                                            }}
                                        >
                                            <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleEliminarProveedor(proveedor, (eliminadoCompletamente = false) => {
                                                    if (eliminadoCompletamente) {
                                                        setProveedores((prev) => prev.filter((p) => p.id !== proveedor.id));
                                                    } else {
                                                        setProveedores((prev) =>
                                                            prev.map((p) =>
                                                                p.id === proveedor.id ? { ...p, estado: "Inactivo" } : p
                                                            )
                                                        );
                                                    }
                                                })
                                            }
                                            className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                                            title="Eliminar el proveedor"
                                        >
                                            <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td ctd colSpan="4" className="text-center">
                                    No se encontraron proveedores
                                </td>
                            </tr>
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
                <div className="overlay-popup" onClick={() => setMostrarModalCrear(false)}>
                    <div
                        className="ventana-popup max-h-[300vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Crear proveedor</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleCrearProveedor();
                                }}
                                className="form-crear-usuario"
                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo persona:</label>
                                        <select
                                            name="tipo_persona"
                                            value={nuevoProveedor.tipo_persona}
                                            onChange={(e) => {
                                                const nuevoTipo = e.target.value;
                                                handleInputChange(e);
                                                if (nuevoTipo === "NATURAL") {
                                                    setNuevoProveedor((prev) => ({
                                                        ...prev,
                                                        tipo_documento: "CC",
                                                        nombre_empresa: "",
                                                        telefono_representante: "",
                                                        email_representante: "",
                                                    }));
                                                } else if (nuevoTipo === "JURIDICA") {
                                                    setNuevoProveedor((prev) => ({
                                                        ...prev,
                                                        tipo_documento: "NIT",
                                                    }));
                                                }
                                            }}
                                            className="input-select"
                                        >
                                            <option value="NATURAL">Natural</option>
                                            <option value="JURIDICA">Jurídica</option>
                                        </select>
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de documento:</label>
                                        <select
                                            name="tipo_documento"
                                            value={nuevoProveedor.tipo_documento}
                                            onChange={handleInputChange}
                                            className="input-select"
                                        >
                                            {nuevoProveedor.tipo_persona === "NATURAL" && (
                                                <>
                                                    <option value="CC">Cédula</option>
                                                    <option value="CE">Cédula extranjería</option>
                                                </>
                                            )}
                                            {nuevoProveedor.tipo_persona === "JURIDICA" && (
                                                <option value="NIT">NIT</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {(nuevoProveedor.tipo_persona === "NATURAL" &&
                                    (nuevoProveedor.tipo_documento === "CC" ||
                                        nuevoProveedor.tipo_documento === "CE")) && (
                                        <>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Número documento:</label>
                                                    <input
                                                        name="numero_documento"
                                                        placeholder="Número documento *"
                                                        value={nuevoProveedor.numero_documento}
                                                        onChange={(e) => {
                                                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                                                            handleInputChange({ target: { name: 'numero_documento', value: onlyNumbers } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                    />
                                                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                                    {nuevoProveedor.numero_documento.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombres del representante:</label>
                                                    <input
                                                        name="nombre_representante"
                                                        placeholder="Nombres representante *"
                                                        value={nuevoProveedor.nombre_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 40) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />

                                                    {errores.nombre_representante && (
                                                        <p className="error-texto">{errores.nombre_representante}</p>
                                                    )}

                                                    {nuevoProveedor.nombre_representante.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Apellidos del representante:</label>
                                                    <input
                                                        name="apellido_representante"
                                                        placeholder="Apellidos representante *"
                                                        value={nuevoProveedor.apellido_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 40) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.apellido_representante && <p className="error-texto">{errores.apellido_representante}</p>}
                                                    {nuevoProveedor.apellido_representante.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono:</label>
                                                    <input
                                                        name="telefono"
                                                        placeholder="Teléfono *"
                                                        value={nuevoProveedor.telefono}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                    />
                                                    {errores.telefono && <p className="error-texto">{errores.telefono}</p>}
                                                    {nuevoProveedor.telefono.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo:</label>
                                                    <input
                                                        name="email"
                                                        placeholder="Correo *"
                                                        value={nuevoProveedor.email}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                    />
                                                    {errores.email && <p className="error-texto">{errores.email}</p>}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Dirección:</label>
                                                    <input
                                                        name="direccion"
                                                        placeholder="Dirección *"
                                                        value={nuevoProveedor.direccion}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.direccion && <p className="error-texto">{errores.direccion}</p>}
                                                    {nuevoProveedor.direccion.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Ciudad:</label>
                                                    <input
                                                        name="ciudad"
                                                        placeholder="Ciudad *"
                                                        value={nuevoProveedor.ciudad}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto w-full"
                                                        maxLength={40}
                                                    />
                                                    {errores.ciudad && <p className="error-texto">{errores.ciudad}</p>}
                                                    {nuevoProveedor.ciudad.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                {(nuevoProveedor.tipo_persona === "JURIDICA" ||
                                    nuevoProveedor.tipo_documento === "NIT") && (
                                        <>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Número del nit:</label>
                                                    <input
                                                        name="numero_documento"
                                                        placeholder="Número del NIT *"
                                                        value={nuevoProveedor.numero_documento}
                                                        onChange={(e) => {
                                                            const onlyNumbersAndDashes = e.target.value.replace(/[^0-9-]/g, '');
                                                            handleInputChange({ target: { name: 'numero_documento', value: onlyNumbersAndDashes } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                    />
                                                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                                    {nuevoProveedor.numero_documento.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombre de la empresa:</label>
                                                    <input
                                                        name="nombre_empresa"
                                                        placeholder="Nombre empresa *"
                                                        value={nuevoProveedor.nombre_empresa}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 40) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.nombre_empresa && <p className="error-texto">{errores.nombre_empresa}</p>}
                                                    {nuevoProveedor.nombre_empresa.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono:</label>
                                                    <input
                                                        name="telefono"
                                                        placeholder="Teléfono *"
                                                        value={nuevoProveedor.telefono}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                    />
                                                    {errores.telefono && <p className="error-texto">{errores.telefono}</p>}
                                                    {nuevoProveedor.telefono.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo:</label>
                                                    <input
                                                        name="email"
                                                        placeholder="Email *"
                                                        value={nuevoProveedor.email}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                    />
                                                    {errores.email && <p className="error-texto">{errores.email}</p>}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Dirección:</label>
                                                    <input
                                                        name="direccion"
                                                        placeholder="Dirección *"
                                                        value={nuevoProveedor.direccion}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.direccion && <p className="error-texto">{errores.direccion}</p>}
                                                    {nuevoProveedor.direccion.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Ciudad:</label>
                                                    <input
                                                        name="ciudad"
                                                        placeholder="Ciudad *"
                                                        value={nuevoProveedor.ciudad}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto w-full"
                                                        maxLength={40}
                                                    />
                                                    {errores.ciudad && <p className="error-texto">{errores.ciudad}</p>}
                                                    {nuevoProveedor.ciudad.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombres del representante:</label>
                                                    <input
                                                        name="nombre_representante"
                                                        placeholder="Nombres representante *"
                                                        value={nuevoProveedor.nombre_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 40) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.nombre_representante && <p className="error-texto">{errores.nombre_representante}</p>}
                                                    {nuevoProveedor.nombre_representante.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Apellidos del representante:</label>
                                                    <input
                                                        name="apellido_representante"
                                                        placeholder="Apellidos representante *"
                                                        value={nuevoProveedor.apellido_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 40) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={40}
                                                    />
                                                    {errores.apellido_representante && <p className="error-texto">{errores.apellido_representante}</p>}
                                                    {nuevoProveedor.apellido_representante.length === 40 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono del representante:</label>
                                                    <input
                                                        name="telefono_representante"
                                                        placeholder="Tel. representante *"
                                                        value={nuevoProveedor.telefono_representante}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono_representante', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                    />
                                                    {errores.telefono_representante && <p className="error-texto">{errores.telefono_representante}</p>}
                                                    {nuevoProveedor.telefono_representante.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo del representante:</label>
                                                    <input
                                                        name="email_representante"
                                                        placeholder="Email representante *"
                                                        value={nuevoProveedor.email_representante}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                    />
                                                    {errores.email_representante && <p className="error-texto">{errores.email_representante}</p>}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                <div className="button-container">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setMostrarModalCrear(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-crear"
                                        disabled={loading}
                                    >
                                        {loading ? "Creando proveedor..." : "Crear proveedor"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {(mostrarModalEditar || modoVer) && proveedorSeleccionado && (
                <div className="overlay-popup" onClick={() => {
                    setMostrarModalEditar(false);
                    setModoVer(false);
                }}>
                    <div
                        className="ventana-popup max-h-[300vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">
                                {modoVer ? "Detalles del proveedor" : "Editar proveedor"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEditarProveedor();
                                }}
                                className="form-crear-usuario"
                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo persona:</label>
                                        <select
                                            name="tipo_persona"
                                            value={nuevoProveedor.tipo_persona}
                                            onChange={(e) => {
                                                const nuevoTipo = e.target.value;
                                                handleInputChange(e);
                                                if (nuevoTipo === "NATURAL") {
                                                    setNuevoProveedor((prev) => ({
                                                        ...prev,
                                                        tipo_documento: "CC",
                                                        nombre_empresa: "",
                                                        telefono_representante: "",
                                                        email_representante: "",
                                                    }));
                                                } else if (nuevoTipo === "JURIDICA") {
                                                    setNuevoProveedor((prev) => ({
                                                        ...prev,
                                                        tipo_documento: "NIT",
                                                    }));
                                                }
                                            }}
                                            className="input-select"
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                        >
                                            <option value="NATURAL">Natural</option>
                                            <option value="JURIDICA">Jurídica</option>
                                        </select>
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de documento:</label>
                                        <select
                                            name="tipo_documento"
                                            value={nuevoProveedor.tipo_documento}
                                            onChange={handleInputChange}
                                            className="input-select"
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                        >
                                            {nuevoProveedor.tipo_persona === "NATURAL" && (
                                                <>
                                                    <option value="CC">Cédula</option>
                                                    <option value="CE">Extranjería</option>
                                                </>
                                            )}
                                            {nuevoProveedor.tipo_persona === "JURIDICA" && (
                                                <option value="NIT">NIT</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {(nuevoProveedor.tipo_persona === "NATURAL" &&
                                    (nuevoProveedor.tipo_documento === "CC" ||
                                        nuevoProveedor.tipo_documento === "CE")) && (
                                        <>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Número documento:</label>
                                                    <input
                                                        name="numero_documento"
                                                        placeholder="Número documento *"
                                                        value={nuevoProveedor.numero_documento}
                                                        onChange={(e) => {
                                                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                                                            handleInputChange({ target: { name: 'numero_documento', value: onlyNumbers } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                                    {nuevoProveedor.numero_documento.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombres del representante:</label>
                                                    <input
                                                        name="nombre_representante"
                                                        placeholder="Nombres representante *"
                                                        value={nuevoProveedor.nombre_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 20) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.nombre_representante && <p className="error-texto">{errores.nombre_representante}</p>}
                                                    {nuevoProveedor.nombre_representante.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Apellidos del representante:</label>
                                                    <input
                                                        name="apellido_representante"
                                                        placeholder="Apellidos representante *"
                                                        value={nuevoProveedor.apellido_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 20) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.apellido_representante && <p className="error-texto">{errores.apellido_representante}</p>}
                                                    {nuevoProveedor.apellido_representante.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono:</label>
                                                    <input
                                                        name="telefono"
                                                        placeholder="Teléfono *"
                                                        value={nuevoProveedor.telefono}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.telefono && <p className="error-texto">{errores.telefono}</p>}
                                                    {nuevoProveedor.telefono.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo:</label>
                                                    <input
                                                        name="email"
                                                        placeholder="Correo *"
                                                        value={nuevoProveedor.email}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.email && <p className="error-texto">{errores.email}</p>}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Dirección:</label>
                                                    <input
                                                        name="direccion"
                                                        placeholder="Dirección *"
                                                        value={nuevoProveedor.direccion}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.direccion && <p className="error-texto">{errores.direccion}</p>}
                                                    {nuevoProveedor.direccion.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Cuidad:</label>
                                                    <input
                                                        name="ciudad"
                                                        placeholder="Ciudad *"
                                                        value={nuevoProveedor.ciudad}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto w-full"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.ciudad && <p className="error-texto">{errores.ciudad}</p>}
                                                    {nuevoProveedor.ciudad.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Estado:</label>
                                                    <select
                                                        name="estado"
                                                        value={nuevoProveedor.estado}
                                                        onChange={handleInputChange}
                                                        className="input-texto"
                                                        onKeyDown={(e) => modoVer && e.preventDefault()}
                                                        style={{ pointerEvents: modoVer ? "none" : "auto" }}

                                                    >
                                                        <option value="Activo">Activo</option>
                                                        <option value="Inactivo">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                {(nuevoProveedor.tipo_persona === "JURIDICA" ||
                                    nuevoProveedor.tipo_documento === "NIT") && (
                                        <>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Número del NIT:</label>
                                                    <input
                                                        name="numero_documento"
                                                        placeholder="Número del NIT *"
                                                        value={nuevoProveedor.numero_documento}
                                                        onChange={(e) => {
                                                            const onlyNumbersAndDashes = e.target.value.replace(/[^0-9-]/g, '');
                                                            handleInputChange({ target: { name: 'numero_documento', value: onlyNumbersAndDashes } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                                    {nuevoProveedor.numero_documento.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombre de la empresa:</label>
                                                    <input
                                                        name="nombre_empresa"
                                                        placeholder="Nombre empresa *"
                                                        value={nuevoProveedor.nombre_empresa}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 20) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.nombre_empresa && <p className="error-texto">{errores.nombre_empresa}</p>}
                                                    {nuevoProveedor.nombre_empresa.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono de la empresa:</label>
                                                    <input
                                                        name="telefono"
                                                        placeholder="Teléfono *"
                                                        value={nuevoProveedor.telefono}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.telefono && <p className="error-texto">{errores.telefono}</p>}
                                                    {nuevoProveedor.telefono.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo:</label>
                                                    <input
                                                        name="email"
                                                        placeholder="Email *"
                                                        value={nuevoProveedor.email}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.email && <p className="error-texto">{errores.email}</p>}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Dirección:</label>
                                                    <input
                                                        name="direccion"
                                                        placeholder="Dirección *"
                                                        value={nuevoProveedor.direccion}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.direccion && <p className="error-texto">{errores.direccion}</p>}
                                                    {nuevoProveedor.direccion.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Cuidad:</label>
                                                    <input
                                                        name="ciudad"
                                                        placeholder="Ciudad *"
                                                        value={nuevoProveedor.ciudad}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto w-full"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.ciudad && <p className="error-texto">{errores.ciudad}</p>}
                                                    {nuevoProveedor.ciudad.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Nombres del representante:</label>
                                                    <input
                                                        name="nombre_representante"
                                                        placeholder="Nombres representante *"
                                                        value={nuevoProveedor.nombre_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 20) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.nombre_representante && <p className="error-texto">{errores.nombre_representante}</p>}
                                                    {nuevoProveedor.nombre_representante.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Apellidos del representante:</label>
                                                    <input
                                                        name="apellido_representante"
                                                        placeholder="Apellidos representante *"
                                                        value={nuevoProveedor.apellido_representante}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                            if (regex.test(value) && value.length <= 20) {
                                                                handleInputChange(e);
                                                            }
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={20}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.apellido_representante && <p className="error-texto">{errores.apellido_representante}</p>}
                                                    {nuevoProveedor.apellido_representante.length === 20 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Teléfono del representante:</label>
                                                    <input
                                                        name="telefono_representante"
                                                        placeholder="Tel. representante *"
                                                        value={nuevoProveedor.telefono_representante}
                                                        onChange={(e) => {
                                                            const onlyValid = e.target.value.replace(/[^\d+]/g, '');
                                                            handleInputChange({ target: { name: 'telefono_representante', value: onlyValid } });
                                                        }}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        maxLength={15}
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.telefono_representante && <p className="error-texto">{errores.telefono_representante}</p>}
                                                    {nuevoProveedor.telefono_representante.length === 15 && (
                                                        <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                                    )}
                                                </div>
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Correo del representante:</label>
                                                    <input
                                                        name="email_representante"
                                                        placeholder="Email representante *"
                                                        value={nuevoProveedor.email_representante}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        className="input-texto"
                                                        readOnly={modoVer}
                                                    />
                                                    {errores.email_representante && <p className="error-texto">{errores.email_representante}</p>}
                                                </div>
                                            </div>
                                            <div className="fila-formulario">
                                                <div className="campo">
                                                    <label className="subtitulo-editar-todos">Estado:</label>
                                                    <select
                                                        name="estado"
                                                        value={nuevoProveedor.estado}
                                                        onChange={handleInputChange}
                                                        className="input-texto"
                                                        onKeyDown={(e) => modoVer && e.preventDefault()}
                                                        style={{ pointerEvents: modoVer ? "none" : "auto", backgroundColor: "white" }}
                                                    >
                                                        <option value="Activo">Activo</option>
                                                        <option value="Inactivo">Inactivo</option>
                                                    </select>
                                                </div>
                                            </div>

                                        </>
                                    )}
                                <div className="button-container">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => {
                                            setMostrarModalEditar(false);
                                            setModoVer(false);
                                        }}
                                    >
                                        {modoVer ? "Volver" : "Cancelar"}
                                    </button>
                                    {!modoVer && (
                                        <button type="submit" className="btn-crear" disabled={loadingEditar}>
                                            {loadingEditar ? "Actualizando..." : "Actualizar"}
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
        </div>
    );
};

export default GestionProveedores;