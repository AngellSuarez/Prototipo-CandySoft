import { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineEye } from "react-icons/ai";
import "../../../css/gestionar.css";
import "../../../css/rolesform.css";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTheme } from "../../tema/ThemeContext";
import { Link } from "react-router-dom";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import {
    listar_roles,
    listar_permisos,
    crear_rol,
    actualizar_rol_con_permisos,
    borrar_rol,
    cambiar_estado_rol,
    detalles_con_permisos,
    obtener_permisos_por_rol,
    asignar_permisos_rol
} from '../../../services/roles_service';

const GestionRoles = () => {

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const rolesPorPagina = 4;

    const [isCrearModalOpen, setCrearModalOpen] = useState(false);
    const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
    const [errores, setErrores] = useState({});

    const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
    const [modulosDisponibles, setModulos] = useState([]);

    const [isEditarModalOpen, setEditarModalOpen] = useState(false);
    const [modoVer, setModoVer] = useState(false);
    const [rolEditando, setRolEditando] = useState(null);
    const [erroresEditar, setErroresEditar] = useState({});

    const { darkMode } = useTheme();
    const MySwal = withReactContent(Swal);

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
        const obtener_roles = async () => {
            try {
                const data = await listar_roles();
                setRoles(data);
                console.log(data);
            } catch (error) {
                console.error("Error al llamar los roles: ", error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudieron cargar los roles.',
                    icon: 'error',
                    confirmButtonColor: '#7e2952',
                    customClass: { popup: 'swal-rosado' }
                });
            }
        };

        obtener_roles();
    }, []);

    useEffect(() => {
        const obtener_modulos = async () => {
            try {
                const data = await listar_permisos();
                setModulos(data);
                console.log(data);
            } catch (error) {
                console.error("Error al llamar los módulos: ", error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudieron cargar los módulos.',
                    icon: 'error',
                    confirmButtonColor: '#7e2952',
                    customClass: { popup: 'swal-rosado' }
                });
            }
        };

        obtener_modulos();
    }, []);

    const validarCampo = (name, value) => {
        let error = "";
        if (!value.trim()) {
            error = name === "nombre" ? "El nombre del rol es obligatorio" : "La descripción del rol es obligatoria";
        }
        setErrores((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errores[name]) validarCampo(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validarCampo(name, value);
    };

    const handleModuloChange = (modulo) => {
        setModulosSeleccionados((prev) =>
            prev.includes(modulo)
                ? prev.filter((m) => m !== modulo)
                : [...prev, modulo]
        );
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        setLoading(true);

        let nuevosErrores = {};

        if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre del rol es obligatorio";
        if (!formData.descripcion.trim()) nuevosErrores.descripcion = "La descripción del rol es obligatoria";
        if (modulosSeleccionados.length === 0) nuevosErrores.modulos = "Debe seleccionar al menos un módulo";

        const rolesExistentes = await listar_roles();
        const nombreExiste = rolesExistentes.some(
            (rol) => rol.nombre.toLowerCase() === formData.nombre.trim().toLowerCase()
        );
        if (nombreExiste) {
            nuevosErrores.nombre = "Ya existe un rol con ese nombre";
        }

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            Swal.fire({
                title: 'Campos obligatorios',
                text: 'Por favor completa todos los campos requeridos correctamente.',
                icon: 'warning',
                confirmButtonColor: '#7e2952',
                customClass: { popup: 'swal-rosado' }
            });
            setLoading(false);
            return;
        }

        try {
            const nuevoRol = await crear_rol(formData.nombre, formData.descripcion);
            await asignar_permisos_rol(nuevoRol.id, modulosSeleccionados.map(m => m.id));
            Swal.fire({
                title: 'Rol creado',
                text: 'El rol y sus permisos fue registrado exitosamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
            closeCrearModal();
            const dataActualizada = await listar_roles();
            setRoles(dataActualizada);
        } catch (error) {
            console.error("Error al crear el rol o asignando permisos: ", error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Ocurrió un error al guardar la información.',
                icon: 'error',
                confirmButtonColor: '#7e2952',
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditarChange = (e) => {
        const { name, value } = e.target;
        setRolEditando({ ...rolEditando, [name]: value });
        if (erroresEditar[name]) validarCampoEditar(name, value);
    };

    const handleEditarBlur = (e) => {
        const { name, value } = e.target;
        validarCampoEditar(name, value);
    };

    const validarCampoEditar = (name, value) => {
        let error = "";
        if (!value.trim()) {
            error = name === "nombre" ? "El nombre del rol es obligatorio" : "La descripción del rol es obligatoria";
        }
        setErroresEditar((prev) => ({ ...prev, [name]: error }));
    };

    const handleGuardarCambios = async (e) => {
        e.preventDefault();
        setLoadingEditar(true);

        const nuevosErrores = {};
        if (!rolEditando.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
        if (!rolEditando.descripcion.trim()) nuevosErrores.descripcion = "La descripción es obligatoria";
        if (modulosSeleccionados.length === 0) nuevosErrores.modulos = "Debe seleccionar al menos un módulo";

        const rolesExistentes = await listar_roles();
        const nombreDuplicado = rolesExistentes.some(
            (rol) =>
                rol.id !== rolEditando.id &&
                rol.nombre.toLowerCase().trim() === rolEditando.nombre.toLowerCase().trim()
        );
        if (nombreDuplicado) {
            nuevosErrores.nombre = "Ya existe otro rol con ese nombre";
        }

        setErroresEditar(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            Swal.fire({
                title: 'Campos obligatorios',
                text: 'Por favor completa todos los campos correctamente.',
                icon: 'warning',
                confirmButtonColor: '#7e2952',
                customClass: { popup: 'swal-rosado' }
            });
            setLoadingEditar(false);
            return;
        }

        try {
            await actualizar_rol_con_permisos(
                rolEditando.id,
                {
                    nombre: rolEditando.nombre,
                    descripcion: rolEditando.descripcion,
                    estado: rolEditando.estado
                },
                modulosSeleccionados.map(m => m.id)
            );
            Swal.fire({
                title: 'Rol actualizado',
                text: 'Los datos del rol fueron actualizados correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
            closeEditarModal();
            const dataActualizada = await listar_roles();
            setRoles(dataActualizada);
        } catch (error) {
            console.error("Error al actualizar el rol: ", error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Ocurrió un error al actualizar la información.',
                icon: 'error',
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
        } finally {
            setLoadingEditar(false);
        }
    };

    const openCrearModal = () => setCrearModalOpen(true);
    const closeCrearModal = () => {
        setCrearModalOpen(false);
        setFormData({ nombre: '', descripcion: '' });
        setErrores({});
        setModulosSeleccionados([]);
    };

    const openEditarModal = async (rol) => {
        setRolEditando(rol);
        setEditarModalOpen(true);
        try {
            const permisosRol = await obtener_permisos_por_rol(rol.id);
            const modulos = permisosRol
                .map(p => modulosDisponibles.find(m => m.id === p.permiso_id))
                .filter(Boolean);
            setModulosSeleccionados(modulos);
        } catch (error) {
            console.error("Error al cargar los permisos del rol: ", error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'Error al cargar los permisos para editar.',
                icon: 'error',
                confirmButtonColor: '#7e2952',
                customClass: { popup: 'swal-rosado' }
            });
        }
    };

    const closeEditarModal = () => {
        setRolEditando(null);
        setEditarModalOpen(false);
        setErroresEditar({}); // Limpiar errores al cerrar
        setModulosSeleccionados([]); // Resetear módulos seleccionados al cerrar
    };

    const handleEditarRol = (id) => {
        const rol = roles.find(u => u.id === id);
        openEditarModal(rol);
    };

    const openVerModal = (rolCompleto) => {
        console.log("ROL COMPLETO RECIBIDO:", rolCompleto);
        setModoVer(true);
        setRolEditando(rolCompleto.rol);  // parte .rol
        setModulosSeleccionados(rolCompleto.modulos);  // parte .modulos
        setEditarModalOpen(true);
    };

    const handleToggleEstado = async (id) => {
        try {
            await cambiar_estado_rol(id);

            const rolActual = roles.find(rol => rol.id === id);
            const nuevoEstado = rolActual.estado === 'Activo' ? 'Inactivo' : 'Activo';

            setRoles(prevRoles =>
                prevRoles.map(rol =>
                    rol.id === id ? { ...rol, estado: nuevoEstado } : rol
                )
            );

            Swal.fire({
                title: 'Estado actualizado',
                text: `El rol ahora está ${nuevoEstado}.`,
                icon: 'success',
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
        } catch (error) {
            console.error("Error al cambiar el estado del rol: ", error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo cambiar el estado del rol.',
                icon: 'error',
                showConfirmButton: false,
                customClass: { popup: 'swal-rosado' }
            });
        }
    };

    useEffect(() => {
        if (!isCrearModalOpen && !isEditarModalOpen) {
            setErrores({
                nombre: "",
                descripcion: "",
                modulos: "",
                estado: "Activo",
            });
            setErrores({});
            setRolSeleccionado(null);
        }
    }, [isCrearModalOpen, isEditarModalOpen]);

    const handleEliminarRol = (rol) => {
        if (rol.nombre.toLowerCase() === 'administrador') {
            MySwal.fire({
                title: 'Acción no permitida',
                text: 'El rol de Administrador no puede ser eliminado.',
                icon: 'error',
                confirmButtonColor: '#7e2952',
                confirmButtonText: 'Entendido',
                customClass: {
                    popup: 'swal-rosado'
                }
            });
            return;
        }

        MySwal.fire({
            title: `¿Eliminar el rol ${rol.nombre}?`,
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#7e2952',
            cancelButtonColor: '#d8d6d7',
            reverseButtons: true,
            customClass: {
                popup: 'swal-rosado'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await borrar_rol(rol.id);
                    MySwal.fire({
                        title: "Eliminado",
                        text: `El rol ${rol.nombre} ha sido eliminado.`,
                        icon: "success",
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }

                    });
                    const dataActualizada = await listar_roles();
                    setRoles(dataActualizada);
                } catch (error) {
                    MySwal.fire({
                        title: 'Error',
                        text: error.message || 'No se pudo eliminar el rol.',
                        icon: 'error',
                        confirmButtonColor: '#7e2952',
                        customClass: { popup: 'swal-rosado' }
                    });
                }
            }
        });
    };

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase());
        setPaginaActual(1);
    };

    const rolesFiltrados = roles.filter(rol => {
        const nombreMatch = rol.nombre.toLowerCase().includes(busqueda);
        const estadoMatch = (rol.estado ? 'Activo' : 'Inactivo').includes(busqueda);
        return nombreMatch || estadoMatch;
    });


    const indexUltimoRol = paginaActual * rolesPorPagina;
    const indexPrimerRol = indexUltimoRol - rolesPorPagina;
    const rolesActuales = rolesFiltrados.slice(indexPrimerRol, indexUltimoRol);
    const totalPaginas = Math.ceil(rolesFiltrados.length / rolesPorPagina);

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return;
        setPaginaActual(numero);
    };

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
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de roles</h1>

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
                <button onClick={openCrearModal} className="crear-btn">
                    Crear rol
                </button>

                <input
                    type="text"
                    placeholder="Buscar rol..."
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
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rolesActuales.length > 0 ? (
                            rolesActuales.map((rol) => {
                                const esAdministrador = rol.nombre === "Administrador";

                                return (
                                    <tr key={rol.id}>
                                        <td>{rol.nombre}</td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleEstado(rol.id)}
                                                className={`estado-btn ${rol.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                                                disabled={esAdministrador}
                                                style={esAdministrador ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                                                title={esAdministrador ? "No se puede cambiar el estado del Administrador" : ""}
                                            >
                                                {rol.estado}
                                            </button>
                                        </td>
                                        <td className="text-center space-x-2">
                                            <button
                                                onClick={async () => {
                                                    if (!esAdministrador) {
                                                        try {
                                                            const detalles = await detalles_con_permisos(rol.id); // { rol, modulos }
                                                            openVerModal(detalles);
                                                        } catch (error) {
                                                            Swal.fire({
                                                                title: 'Error',
                                                                text: error.message || 'No se pudo cargar el rol',
                                                                icon: 'error',
                                                                confirmButtonColor: '#7e2952',
                                                                customClass: { popup: 'swal-rosado' }
                                                            });
                                                        }
                                                    }
                                                }}
                                                className="acciones-btn ver-btn flex items-center justify-center p-2"
                                                title={esAdministrador ? "No se puede ver detalles del rol Administrador" : "Ver detalles del rol"}
                                                disabled={esAdministrador}
                                                style={esAdministrador ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                                            >
                                                <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!esAdministrador) {
                                                        setModoVer(false);
                                                        handleEditarRol(rol.id);
                                                    }
                                                }}
                                                className="acciones-btn editar-btn flex items-center justify-center p-2"
                                                title={esAdministrador ? "No se puede editar el rol Administrador" : "Editar el rol"}
                                                disabled={esAdministrador}
                                                style={esAdministrador ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                                            >
                                                <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!esAdministrador) {
                                                        handleEliminarRol(rol);
                                                    }
                                                }}
                                                className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                                                title={esAdministrador ? "No se puede eliminar el rol Administrador" : "Eliminar el rol"}
                                                disabled={esAdministrador}
                                                style={esAdministrador ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                                            >
                                                <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No se encontraron roles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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

            {isCrearModalOpen && (
                <div className="overlay-popup" onClick={closeCrearModal}>
                    <div className="ventana-popup " onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Crear rol</h2>
                            <form onSubmit={handleCrear} className="space-y-3">
                                <div className="fila-formulario">
                                    <div className="campo ">
                                        <label className="subtitulo-editar-todos">
                                            Nombre:
                                        </label>
                                        <input
                                            type="text"
                                            className="input-nombre"
                                            name="nombre"
                                            placeholder="Nombre del Rol *"
                                            value={formData.nombre}
                                            maxLength={20}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                if (regex.test(value) && value.length <= 20) {
                                                    handleChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {errores.nombre && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                {errores.nombre}
                                            </p>
                                        )}
                                        {formData.nombre.length === 20 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 20 caracteres.
                                            </p>
                                        )}
                                    </div>

                                    <div className="campo ">
                                        <label className="subtitulo-editar-todos">
                                            Descripción:
                                        </label>
                                        <input
                                            type="text"
                                            className="input-nombre"
                                            name="descripcion"
                                            placeholder="Descripción del Rol *"
                                            value={formData.descripcion}
                                            maxLength={80}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 80) {
                                                    handleChange(e);
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {errores.descripcion && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                {errores.descripcion}
                                            </p>
                                        )}
                                        {formData.descripcion.length === 80 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">Has alcanzado el máximo de 80 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid-roles-wrapper">
                                    <div className="campo ">
                                        <label className="subtitulo-editar-todos" style={{ marginTop: "10px" }}>
                                            Permisos:
                                        </label>
                                    </div>
                                    <div className="grid-roles">
                                        {[0, 1, 2].map((columna) => (
                                            <div key={columna} className="grid-column">
                                                {modulosDisponibles
                                                    .slice(columna * 4, columna === 2 ? 14 : (columna + 1) * 4)
                                                    .map((modulo) => (
                                                        <label
                                                            key={modulo.id}
                                                            className="border checkbox-label rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer"
                                                        >
                                                            <span className="permiso-info">{modulo.modulo}</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={modulosSeleccionados.includes(modulo)}
                                                                onChange={() => handleModuloChange(modulo)}
                                                                className="checkbox-input"
                                                            />
                                                        </label>
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {errores.modulos && <p className="error-texto text-red-600">{errores.modulos}</p>}
                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-crear"
                                        disabled={loading}
                                    >
                                        {loading ? "Creando rol..." : "Crear rol"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isEditarModalOpen && (
                <div className="overlay-popup" onClick={closeEditarModal}>
                    <div className="ventana-popup max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">{modoVer ? "Detalle del rol" : "Editar rol"}</h2>
                            <form
                                onSubmit={handleGuardarCambios}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="fila-formulario">
                                        <div className="campo relative">
                                            <label htmlFor="input-nombre" className="subtitulo-editar-todos">
                                                Nombre:
                                            </label>
                                            <input
                                                type="text"
                                                className="input-nombre"
                                                name="nombre"
                                                placeholder="Nombre del Rol *"
                                                value={rolEditando?.nombre || ""}
                                                readOnly={modoVer}
                                                onKeyDown={(e) => modoVer && e.preventDefault()}
                                                style={{
                                                    pointerEvents: modoVer ? "none" : "auto"
                                                }}
                                                maxLength={20}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
                                                    if (regex.test(value) && value.length <= 20) {
                                                        handleEditarChange(e);
                                                    }
                                                }}
                                                onBlur={handleEditarBlur}
                                            />
                                            {erroresEditar.nombre && !modoVer && (
                                                <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                    {erroresEditar.nombre}
                                                </p>
                                            )}
                                            {rolEditando?.nombre?.length === 20 && !modoVer && (
                                                <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                    Has alcanzado el máximo de 20 caracteres.
                                                </p>
                                            )}
                                        </div>

                                        <div className="campo relative">
                                            <label htmlFor="input-nombre" className="subtitulo-editar-todos">
                                                Descripción:
                                            </label>
                                            <input
                                                type="text"
                                                className="input-nombre"
                                                name="descripcion"
                                                placeholder="Descripción del Rol *"
                                                value={rolEditando?.descripcion || ""}
                                                readOnly={modoVer}
                                                onKeyDown={(e) => modoVer && e.preventDefault()}
                                                style={{
                                                    pointerEvents: modoVer ? "none" : "auto"
                                                }}
                                                maxLength={80}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 80) {
                                                        handleEditarChange(e);
                                                    }
                                                }}
                                                onBlur={handleEditarBlur}
                                            />
                                            {erroresEditar.descripcion && !modoVer && (
                                                <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                    {erroresEditar.descripcion}
                                                </p>
                                            )}
                                            {rolEditando?.descripcion?.length === 80 && !modoVer && (
                                                <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                    Has alcanzado el máximo de 80 caracteres.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="campo">
                                    <label htmlFor="input-nombre" className="subtitulo-editar-todos" style={{ marginTop: "10px" }}>
                                        Permisos:
                                    </label>
                                </div>
                                <div className="grid-roles">
                                    {[0, 1, 2].map((columna) => (
                                        <div key={columna} className="grid-column">
                                            {modulosDisponibles
                                                .slice(columna * 4, columna === 2 ? 14 : (columna + 1) * 4)
                                                .map((modulo) => (
                                                    <label
                                                        key={modulo.id}
                                                        className="border checkbox-label rounded-lg p-4 shadow-md flex items-center justify-between cursor-pointer"
                                                    >
                                                        <span className="permiso-info">{modulo.modulo}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={modulosSeleccionados.some((m) => m.id === modulo.id)}
                                                            onChange={() => {
                                                                if (!modoVer) handleModuloChange(modulo);
                                                            }}
                                                            className="checkbox-input"
                                                        />
                                                    </label>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                                {erroresEditar.modulos && !modoVer && (
                                    <div style={{ textAlign: "left" }}>
                                        <p className="error-mensaje-rol">{erroresEditar.modulos}</p>
                                    </div>
                                )}

                                <div className="campo">
                                    <label className="subtitulo-editar-todos">Estado:</label>
                                    <select
                                        name="estado"
                                        value={rolEditando?.estado || ""}
                                        onChange={handleEditarChange}
                                        onKeyDown={(e) => modoVer && e.preventDefault()}
                                        style={{
                                            pointerEvents: modoVer ? "none" : "auto"
                                        }}
                                        className="input-select"
                                    >
                                        <option value="">Selecciona el estado</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                    {erroresEditar.estado && !modoVer && <p className="error-mensaje">{erroresEditar.estado}</p>}
                                </div>

                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeEditarModal}>
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

export default GestionRoles;
