import React, { useState, useEffect } from "react"
import "../../../css/gestionar.css"
import { useTheme } from "../../tema/ThemeContext"
import {
    listar_manicuristas,
    crear_manicurista,
    actualizar_manicurista,
    actualizar_estado_manicurista,
    eliminar_manicurista,
} from "../../../services/manicuristas_services"
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { Link } from "react-router-dom"
import { AiOutlineEye } from "react-icons/ai"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const GestionManicurista = () => {
    const { darkMode } = useTheme()
    const MySwal = withReactContent(Swal)

    const [loading, setLoading] = useState(true)
    const [modoVer, setModoVer] = useState(false)
    const [error, setError] = useState(null)
    const [tocado, setTocado] = useState({})
    const [busqueda, setBusqueda] = useState("")
    const [paginaActual, setPaginaActual] = useState(1)

    const [manicuristas, setManicuristas] = useState([])
    const manicuristasPorPagina = 4

    const [formulario, setFormulario] = useState({
        username: "",
        password: "",
        passwordConfirm: "",

        nombre: "",
        apellido: "",
        tipo_documento: "",
        numero_documento: "",
        correo: "",
        celular: "",
        fecha_nacimiento: "",
        fecha_contratacion: "",
        contraseña: "",
        confirmar_contraseña: "",
        estado: "activo",
    })

    const valoresIniciales = {
        username: "",
        password: "",
        passwordConfirm: "",
        nombre: "",
        apellido: "",
        tipo_documento: "",
        numero_documento: "",
        correo: "",
        celular: "",
        fecha_nacimiento: "",
        fecha_contratacion: "",
    }

    const [mostrarModalCrear, setMostrarModalCrear] = useState(false)
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false)

    const [errores, setErrores] = useState({})
    const [valores, setValores] = useState({})
    const [manicuristaSeleccionado, setManicuristaSeleccionado] = useState(null)

    const [loadingCrear, setLoadingCrear] = useState(false)
    const [loadingActualizar, setLoadingActualizar] = useState(false)

    const validarCampos = (datos, esEdicion = false) => {
        console.log("Validando estos datos:", datos)

        const dominiosPermitidos = ["@gmail.com", "@outlook.com", "@yahoo.es"]
        const nuevosErrores = {}

        for (const [campo, valor] of Object.entries(datos)) {
            const valorTrim = typeof valor === "string" ? valor.trim() : valor

            const esPassword = campo === "password" || campo === "confirmar_contraseña" || campo === "passwordConfirm"
            const campoVacio = !valorTrim

            if (esPassword && esEdicion && campoVacio) {
                // En edición se permite dejar password y confirmar vacíos
                continue
            }

            if (campoVacio) {
                switch (campo) {
                    case "username":
                        nuevosErrores[campo] = "El nombre de usuario es obligatorio."
                        break
                    case "password":
                        nuevosErrores[campo] = "La contraseña es obligatoria."
                        break
                    case "confirmar_contraseña":
                    case "passwordConfirm":
                        nuevosErrores[campo] = "La confirmación de la contraseña es obligatoria."
                        break
                    case "nombre":
                        nuevosErrores[campo] = "El nombre es obligatorio."
                        break
                    case "apellido":
                        nuevosErrores[campo] = "El apellido es obligatorio."
                        break
                    case "tipo_documento":
                        nuevosErrores[campo] = "El tipo de documento es obligatorio."
                        break
                    case "numero_documento":
                        nuevosErrores[campo] = "El número de documento es obligatorio."
                        break
                    case "correo":
                        nuevosErrores[campo] = "El correo electrónico es obligatorio."
                        break
                    case "celular":
                        nuevosErrores[campo] = "El número de celular es obligatorio."
                        break
                    case "fecha_nacimiento":
                        nuevosErrores[campo] = "La fecha de nacimiento es obligatoria."
                        break
                    case "fecha_contratacion":
                        nuevosErrores[campo] = "La fecha de contratación es obligatoria."
                        break
                    default:
                        nuevosErrores[campo] = `El campo ${campo} es obligatorio.`
                }
                continue
            }

            if (campo === "correo") {
                const incluyeDominio = dominiosPermitidos.some((dom) => valor.endsWith(dom))
                if (!valor.includes("@") || !/\S+@\S+\.\S+/.test(valor) || !incluyeDominio) {
                    nuevosErrores[campo] = "Correo inválido. Usa @gmail.com, @outlook.com o @yahoo.es"
                }
            }

            if (campo === "password") {
                if (valor.length < 6) {
                    nuevosErrores[campo] = "La contraseña debe tener al menos 6 caracteres."
                } else if (!/\d/.test(valor)) {
                    nuevosErrores[campo] = "La contraseña debe contener al menos un número."
                } else if (!/[^a-zA-Z0-9\s]/.test(valor)) {
                    nuevosErrores[campo] = "La contraseña debe contener al menos un carácter especial."
                }
            }

            if (campo === "confirmar_contraseña" || campo === "passwordConfirm") {
                if (datos.password !== valor) {
                    nuevosErrores[campo] = "Las contraseñas no coinciden."
                }
            }

            if (campo === "numero_documento" && valor.length > 15) {
                nuevosErrores[campo] = "Máximo 15 caracteres."
            }

            if ((campo === "nombre" || campo === "apellido") && valor.length > 30) {
                nuevosErrores[campo] = "Máximo 30 caracteres."
            }

            if (campo === "fecha_nacimiento") {
                const nacimiento = new Date(valor)
                const hoy = new Date()
                const edad = hoy.getFullYear() - nacimiento.getFullYear()
                const mes = hoy.getMonth() - nacimiento.getMonth()
                const dia = hoy.getDate() - nacimiento.getDate()
                const esMenor = edad < 18 || (edad === 18 && (mes < 0 || (mes === 0 && dia < 0)))

                if (isNaN(nacimiento.getTime())) {
                    nuevosErrores[campo] = "Fecha de nacimiento inválida."
                } else if (esMenor) {
                    nuevosErrores[campo] = "Debe ser mayor de edad (mínimo 18 años)."
                }
            }

            if (campo === "fecha_contratacion" && datos.fecha_nacimiento) {
                const nacimiento = new Date(datos.fecha_nacimiento)
                const contratacion = new Date(valor)
                const diferenciaAnios = contratacion.getFullYear() - nacimiento.getFullYear()
                const mes = contratacion.getMonth() - nacimiento.getMonth()
                const dia = contratacion.getDate() - nacimiento.getDate()
                const esMenor = diferenciaAnios < 18 || (diferenciaAnios === 18 && (mes < 0 || (mes === 0 && dia < 0)))

                if (isNaN(contratacion.getTime())) {
                    nuevosErrores[campo] = "Fecha de contratación inválida."
                } else if (esMenor) {
                    nuevosErrores[campo] = "Debe ser al menos 18 años después de la fecha de nacimiento."
                }
            }
        }

        return nuevosErrores
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormulario((prev) => ({ ...prev, [name]: value }))

        if (name === "password" || name === "passwordConfirm") {
            const nuevosErrores = validarCampos({ ...formulario, [name]: value })
            setErrores((prev) => ({ ...prev, ...nuevosErrores }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTocado((prev) => ({ ...prev, [name]: true }))

        const nuevosErrores = validarCampos({ ...formulario, [name]: value })
        if (nuevosErrores[name]) {
            setErrores((prev) => ({ ...prev, [name]: nuevosErrores[name] }))
        } else {
            setErrores((prev) => {
                const copia = { ...prev }
                delete copia[name]
                return copia
            })
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormulario({ ...formulario, [name]: value })

        if (errores[name]) {
            validarCampos(name, value)
        }
    }

    const handleInputChangeEditar = (e) => {
        const { name, value } = e.target
        setNuevoManicurista((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePaste = (e) => {
        e.preventDefault()
        MySwal.fire({
            title: "Acción no permitida",
            text: "No puedes copiar y pegar en este campo.",
            icon: "warning",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
        })
    }

    const renderPlaceholder = (label, name) => {
        return `${label} *`
    }

    const inputClass = (name) => (errores[name] ? "input-texto input-error" : "input-texto")

    useEffect(() => {
        if (manicuristaSeleccionado) {
            setNuevoManicurista({
                username_out: manicuristaSeleccionado.username_out || "",
                nombre: manicuristaSeleccionado.nombre || "",
                apellido: manicuristaSeleccionado.apellido || "",
                tipo_documento: manicuristaSeleccionado.tipo_documento || "",
                numero_documento: manicuristaSeleccionado.numero_documento || "",
                correo: manicuristaSeleccionado.correo || "",
                celular: manicuristaSeleccionado.celular || "",
                fecha_nacimiento: manicuristaSeleccionado.fecha_nacimiento || "",
                fecha_contratacion: manicuristaSeleccionado.fecha_contratacion || "",
                password: "",
                passwordConfirm: "",
                estado: manicuristaSeleccionado.estado || "activo",
            })
            setErrores({})
        }
    }, [manicuristaSeleccionado])

    const handleEditarManicurista = async () => {
        setLoadingActualizar(true)
        const erroresValidacion = validarCampos(nuevoManicurista, true)

        if (Object.keys(erroresValidacion).length > 0) {
            setErrores(erroresValidacion)
            Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "Por favor completa todos los campos requeridos.",
                customClass: { popup: "swal-rosado" },
            })
            setLoadingActualizar(false)
            return
        }

        const dataFormateada = {
            username_out: nuevoManicurista.username_out,
            nombre: nuevoManicurista.nombre,
            apellido: nuevoManicurista.apellido,
            tipo_documento: nuevoManicurista.tipo_documento,
            numero_documento: nuevoManicurista.numero_documento,
            correo: nuevoManicurista.correo,
            celular: nuevoManicurista.celular,
            fecha_nacimiento: nuevoManicurista.fecha_nacimiento,
            fecha_contratacion: nuevoManicurista.fecha_contratacion,
            estado: nuevoManicurista.estado,
        }

        if ((nuevoManicurista.password || "").trim() !== "") {
            dataFormateada.password = nuevoManicurista.password
            dataFormateada.passwordConfirm = nuevoManicurista.passwordConfirm
        }

        try {
            const respuesta = await actualizar_manicurista(manicuristaSeleccionado.usuario_id, dataFormateada)

            setManicuristas((prev) => prev.map((m) => (m.usuario_id === manicuristaSeleccionado.usuario_id ? respuesta : m)))

            setMostrarModalEditar(false)
            setMostrarModalCrear(false)
            setManicuristaSeleccionado(null)
            setNuevoManicurista({ ...valoresIniciales, estado: "activo", username_out: "" })
            setErrores({})

            Swal.fire({
                icon: "success",
                title: "Manicurista actualizada",
                text: "Los datos fueron actualizados correctamente.",
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: "swal-rosado" },
            })
            setLoadingActualizar(false)
        } catch (error) {
            if (error.name === "ValidationError" && error.data && typeof error.data === "object") {
                setErrores(error.data)
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Corrige los errores indicados en el formulario..",
                    customClass: { popup: "swal-rosado" },
                })
            } else {
                console.error("Error inesperado:", error)
                Swal.fire({
                    icon: "error",
                    title: "Error inesperado",
                    text: "Ocurrió un error al actualizar la manicurista.",
                    customClass: { popup: "swal-rosado" },
                })
            }
            setLoadingActualizar(false)
        }
    }

    const openCrearModal = () => {
        setMostrarModalCrear(true)
    }

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
        const fetchManicuristas = async () => {
            setLoading(true)
            try {
                const data = await listar_manicuristas()
                setManicuristas(data || [])
            } catch (err) {
                console.error("Error al cargar manicuristas:", err)
                setError("No se pudo cargar la lista de manicuristas")
            } finally {
                setLoading(false)
            }
        }
        fetchManicuristas()
    }, [])

    useEffect(() => {
        if (manicuristaSeleccionado) {
            setNuevoManicurista(manicuristaSeleccionado)
        }
    }, [manicuristaSeleccionado])

    useEffect(() => {
        if (!mostrarModalCrear && !mostrarModalEditar) {
            setValores(valoresIniciales)
            setErrores({})
            setManicuristaSeleccionado(null)
        }
    }, [mostrarModalCrear, mostrarModalEditar])

    const handleBuscar = (e) => {
        setBusqueda(e.target.value.toLowerCase())
        setPaginaActual(1)
    }

    const cambiarPagina = (numero) => {
        if (numero < 1 || numero > totalPaginas) return
        setPaginaActual(numero)
    }

    const handleToggleEstado = async (manicurista) => {
        try {
            await actualizar_estado_manicurista(manicurista.usuario_id)

            const manicuristaActual = manicuristas.find((c) => c.usuario_id === manicurista.usuario_id)
            const nuevoEstado = manicuristaActual.estado === "Activo" ? "Inactivo" : "Activo"

            setManicuristas((prevManicuristas) =>
                prevManicuristas.map((c) => (c.usuario_id === manicurista.usuario_id ? { ...c, estado: nuevoEstado } : c)),
            )

            Swal.fire({
                icon: "success",
                title: "Estado actualizado",
                text: `La manicurista ahora está ${nuevoEstado}.`,
                timer: 2000,
                showConfirmButton: false,
                customClass: { popup: "swal-rosado" },
            })
        } catch (error) {
            console.error("Error al cambiar el estado del manicurista: ", error)
            Swal.fire({
                title: "Error",
                text: error.message || "No se pudo cambiar el estado del manicurista",
                icon: "error",
                confirmButtonColor: "#7e2952",
                customClass: { popup: "swal-rosado" },
            })
        }
    }

    const manicuristasFiltrados = manicuristas.filter((m) =>
        Object.values(m).some((valor) => String(valor).toLowerCase().includes(busqueda)),
    )

    const handleEliminarManicurista = async (manicurista) => {
        const resultado = await MySwal.fire({
            title: "Eliminar Manicurista",
            html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar a <strong>${manicurista.nombre} ${manicurista.apellido}</strong>?</p>`,
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
                const respuestaApi = await eliminar_manicurista(manicurista.usuario_id)
                let swalConfig = {}

                if (respuestaApi?.message === "Manicurista y usuario asociado desactivado correctamente") {
                    swalConfig = {
                        title: "Manicurista desactivado",
                        text: "La manicurista ha sido desactivado exitosamente.",
                        icon: "success",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                    }
                } else if (respuestaApi?.message === "El usuario y manicurista fueron eliminados correctamente") {
                    swalConfig = {
                        title: "Manicurista eliminado",
                        text: "La manicurista y su usuario han sido eliminados permanentemente.",
                        icon: "success",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                    }
                } else if (
                    respuestaApi?.message === "No se puede eliminar la manicurista porque tiene citas en proceso o pendientes."
                ) {
                    swalConfig = {
                        title: "No se puede eliminar",
                        text: "La manicurista tiene citas activas o pendientes. Finaliza o cancela esas citas antes de intentar eliminarla.",
                        icon: "warning",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                    }
                } else if (respuestaApi?.message) {
                    swalConfig = {
                        title: "Aviso",
                        text: respuestaApi.message,
                        icon: "info",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                    }
                } else {
                    swalConfig = {
                        title: "Manicurista eliminado",
                        text: "La manicurista y su usuario han sido eliminados permanentemente.",
                        icon: "success",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                    }
                }

                await MySwal.fire(swalConfig).then(() => {
                    if (
                        respuestaApi?.message === "El usuario y manicurista fueron eliminados correctamente" ||
                        respuestaApi?.message === "Manicurista y usuario asociado desactivado correctamente"
                    ) {
                        setManicuristas((prev) => {
                            const actualizados =
                                respuestaApi?.message === "El usuario y manicurista fueron eliminados correctamente"
                                    ? prev.filter((m) => m.id !== manicurista.id)
                                    : prev.map((m) => (m.usuario_id === manicurista.usuario_id ? { ...m, estado: "Inactivo" } : m))

                            const totalFiltrados = actualizados.filter((m) =>
                                Object.values(m).some((valor) => String(valor).toLowerCase().includes(busqueda.toLowerCase())),
                            ).length

                            const nuevaTotalPaginas = Math.ceil(totalFiltrados / manicuristasPorPagina)

                            if (paginaActual > nuevaTotalPaginas) {
                                setPaginaActual(nuevaTotalPaginas || 1)
                            }

                            return actualizados
                        })
                    }
                })
            } catch (error) {
                console.error("Error al eliminar manicurista:", error)
                MySwal.fire({
                    title: "Error",
                    text: error.message || "No se pudo eliminar la manicurista.",
                    icon: "error",
                    confirmButtonColor: "#7e2952",
                    customClass: { popup: "swal-rosado" },
                })
            }
        }
    }

    const totalPaginasRaw = Math.ceil(manicuristasFiltrados.length / manicuristasPorPagina)
    const totalPaginas = totalPaginasRaw > 0 ? totalPaginasRaw : 1
    const indiceInicio = (paginaActual - 1) * manicuristasPorPagina
    const indiceFin = indiceInicio + manicuristasPorPagina
    const manicuristasActuales = manicuristasFiltrados.slice(indiceInicio, indiceFin)

    const [manicuristaVisualizado, setManicuristaVisualizado] = useState(null)
    const [mostrarModalVer, setMostrarModalVer] = useState(false)

    const [showFechaNacimientoInput, setShowFechaNacimientoInput] = React.useState(false)
    const [fecha_nacimiento, setFecha_nacimiento] = React.useState("")
    const [errorFechaNacimiento, setErrorFechaNacimiento] = React.useState("")

    const [showFechaContratacionInput, setShowFechaContratacionInput] = React.useState(false)
    const [fecha_contratacion, setFecha_contratacion] = React.useState("")
    const [errorFechaContratacion, setErrorFechaContratacion] = React.useState("")
    const closeCrearModal = () => {
        setMostrarModalCrear(false)

        setFormulario({
            username: "",
            password: "",
            passwordConfirm: "",
            nombre: "",
            apellido: "",
            tipo_documento: "",
            numero_documento: "",
            correo: "",
            celular: "",
            fecha_nacimiento: "",
            fecha_contratacion: "",
            contraseña: "",
            confirmar_contraseña: "",
        })

        setErrores({})
        setTocado({})
        setShowFechaNacimientoInput(false)
        setShowFechaContratacionInput(false)
        setLoadingCrear(false)
    }

    const handleCrearManicurista = async (e) => {
        e.preventDefault()
        setLoadingCrear(true)

        const errores = validarCampos(formulario)
        const nuevosErrores = {}

        if (!formulario.tipo_documento.trim()) nuevosErrores.tipo_documento = "El tipo de documento es obligatorio"
        if (!formulario.numero_documento.trim()) nuevosErrores.numero_documento = "El número de documento es obligatorio"
        if (!formulario.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
        if (!formulario.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio"
        if (!formulario.username.trim()) nuevosErrores.username = "El nombre de usuario es obligatorio"
        if (!formulario.correo.trim()) nuevosErrores.correo = "El correo es obligatorio"
        if (!formulario.celular.trim()) nuevosErrores.celular = "El número del celular es obligatorio"
        if (!formulario.fecha_nacimiento.trim()) nuevosErrores.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
        if (!formulario.fecha_contratacion.trim())
            nuevosErrores.fecha_contratacion = "La fecha de contratación es obligatoria"

        setErrores(nuevosErrores)

        if (Object.keys(nuevosErrores).length > 0) {
            MySwal.fire({
                title: "Campos obligatorios",
                text: "Por favor completa los campos requeridos",
                icon: "warning",
                confirmButtonColor: "#7e2952",
                customClass: { popup: "swal-rosado" },
            })
            return
        }

        try {
            const respuestaApi = await crear_manicurista(
                formulario.username,
                formulario.nombre,
                formulario.apellido,
                formulario.correo,
                formulario.celular,
                formulario.tipo_documento,
                formulario.numero_documento,
                formulario.fecha_nacimiento,
                formulario.fecha_contratacion,
            )

            if (respuestaApi) {
                setNuevoManicurista(valoresIniciales)
                setFormulario(valoresIniciales)
                setErrores({})
                setManicuristas((prev) => [...prev, respuestaApi])

                MySwal.fire({
                    title: "Manicurista creada",
                    text: respuestaApi.message || "Manicurista creada exitosamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: "swal-rosado" },
                })

                closeCrearModal()
                setLoadingCrear(false)
            }
        } catch (error) {
            if (error.data && typeof error.data === "object") {
                setErrores(error.data)
                return
            }

            MySwal.fire({
                title: "Error",
                text: error.message || "No se pudo crear el Manicurista.",
                icon: "error",
                confirmButtonColor: "#7e2952",
                customClass: { popup: "swal-rosado" },
            })
            setLoadingCrear(false)
        }
    }

    const hoy = new Date()
    const anioActual = hoy.getFullYear()
    const sumarAnios = (fecha, anios) => {
        const nuevaFecha = new Date(fecha)
        nuevaFecha.setFullYear(nuevaFecha.getFullYear() + anios)
        return nuevaFecha.toISOString().split("T")[0]
    }

    const fechaActualStr = new Date().toISOString().split("T")[0]

    const [nuevoManicurista, setNuevoManicurista] = useState({
        tipo_documento: "",
        numero_documento: "",
        nombre: "",
        apellido: "",
        username_out: "",
        correo: "",
        celular: "",
        fecha_nacimiento: "",
        fecha_contratacion: "",
        password: "",
        passwordConfirm: "",
        estado: "Activo",
    })

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
    if (error) return <p className="error">{error}</p>

    return (
        <div className={`roles-container ${darkMode ? "dark" : ""}`}>
            <div className="fila-formulario">
                <h1 className="titulo">Gestión de manicuristas</h1>

                <div className="iconos-perfil-2">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <button onClick={openCrearModal} className="crear-btn mt-4">
                    Crear manicurista
                </button>

                <input
                    type="text"
                    placeholder="Buscar manicurista..."
                    value={busqueda}
                    onChange={handleBuscar}
                    className="busqueda-input"
                />
            </div>

            <div className="overflow-hidden">
                <table className="roles-table">
                    <thead>
                        <tr>
                            <th>Nombre completo</th>
                            <th>Número documento</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {manicuristasActuales.length > 0 ? (
                            manicuristasActuales.map((manicurista) => (
                                <tr key={manicurista.usuario_id}>
                                    <td>
                                        {manicurista.nombre} {manicurista.apellido}
                                    </td>
                                    <td>{manicurista.numero_documento}</td>
                                    <td>{manicurista.celular}</td>
                                    <td>{manicurista.correo}</td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleEstado(manicurista)}
                                            className={`estado-btn ${manicurista.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                                        >
                                            {manicurista.estado}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="acciones-btn ver-btn flex items-center justify-center p-2"
                                            title="Ver detalles de la manicurista"
                                            onClick={() => {
                                                setModoVer(true) // ← Activamos el modo de solo lectura
                                                setManicuristaSeleccionado(manicurista)
                                                setFormulario({
                                                    username_out: manicurista.username_out || "",
                                                    password: "",
                                                    passwordConfirm: "",
                                                    nombre: manicurista.nombre || "",
                                                    apellido: manicurista.apellido || "",
                                                    tipo_documento: manicurista.tipo_documento || "",
                                                    numero_documento: manicurista.numero_documento || "",
                                                    correo: manicurista.correo || "",
                                                    celular: manicurista.celular || "",
                                                    fecha_nacimiento: manicurista.fecha_nacimiento || "",
                                                    fecha_contratacion: manicurista.fecha_contratacion || "",
                                                    estado: manicurista.estado || "activo",
                                                })
                                                setMostrarModalEditar(true)
                                            }}
                                        >
                                            <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                                        </button>
                                        <button
                                            className="acciones-btn editar-btn flex items-center justify-center p-2"
                                            title="Editar la manicurista"
                                            onClick={() => {
                                                setModoVer(false)
                                                setManicuristaSeleccionado(manicurista)
                                                setFormulario({
                                                    username_out: manicurista.username_out || "",
                                                    password: "",
                                                    passwordConfirm: "",
                                                    nombre: manicurista.nombre || "",
                                                    apellido: manicurista.apellido || "",
                                                    tipo_documento: manicurista.tipo_documento || "",
                                                    numero_documento: manicurista.numero_documento || "",
                                                    correo: manicurista.correo || "",
                                                    celular: manicurista.celular || "",
                                                    fecha_nacimiento: manicurista.fecha_nacimiento || "",
                                                    fecha_contratacion: manicurista.fecha_contratacion || "",
                                                    estado: manicurista.estado || "activo",
                                                })
                                                setMostrarModalEditar(true)
                                            }}
                                        >
                                            <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                                        </button>

                                        <button
                                            onClick={() => handleEliminarManicurista(manicurista)}
                                            className="acciones-btn eliminar-btn p-2"
                                            title="Eliminar cliente"
                                        >
                                            <FiTrash2 size={16} className="text-red-500 hover:text-red-700" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No se encontraron manicuristas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
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
                <div className="overlay-popup" onClick={closeCrearModal}>
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">Crear manicurista</h2>
                            <form onSubmit={handleCrearManicurista} className="form-crear-manicurista">
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de documento:</label>
                                        <select
                                            name="tipo_documento"
                                            value={formulario.tipo_documento}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                        >
                                            <option value="">Tipo de documento *</option>
                                            <option value="CC">Cédula</option>
                                            <option value="CE">Cédula extranjería</option>
                                        </select>
                                        {errores.tipo_documento && <p className="error-texto">{errores.tipo_documento}</p>}
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Número de documento:</label>
                                        <input
                                            name="numero_documento"
                                            placeholder="Número de documento *"
                                            value={formulario.numero_documento}
                                            onChange={(e) => {
                                                const onlyNumbers = e.target.value.replace(/\D/g, "")
                                                handleInputChange({ target: { name: "numero_documento", value: onlyNumbers } })
                                            }}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            maxLength={15}
                                        />
                                        {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                        {formulario.numero_documento.length === 15 && (
                                            <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombre:</label>
                                        <input
                                            name="nombre"
                                            placeholder="Nombre *"
                                            value={formulario.nombre}
                                            className="input-texto"
                                            maxLength={40}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                                if (regex.test(value) && value.length <= 40) {
                                                    handleInputChange(e)
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {errores.nombre && <p className="error-texto">{errores.nombre}</p>}

                                        {formulario.nombre.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 40 caracteres.
                                            </p>
                                        )}
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Apellido:</label>
                                        <input
                                            name="apellido"
                                            placeholder="Apellido *"
                                            value={formulario.apellido}
                                            className="input-texto"
                                            maxLength={40}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                                if (regex.test(value) && value.length <= 40) {
                                                    handleInputChange(e)
                                                }
                                            }}
                                            onBlur={handleBlur}
                                        />
                                        {errores.apellido && <p className="error-texto">{errores.apellido}</p>}
                                        {formulario.apellido.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 40 caracteres.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombre de usuario:</label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Nombre de Usuario *"
                                            className="input-texto"
                                            value={formulario.username}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                        />
                                        {tocado.username && errores.username && <p className="error-texto">{errores.username}</p>}
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Correo:</label>
                                        <input
                                            name="correo"
                                            placeholder="Correo *"
                                            value={formulario.correo}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                        />
                                        {errores.correo && <p className="error-texto">{errores.correo}</p>}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha de nacimiento:</label>
                                        {showFechaNacimientoInput || fecha_nacimiento ? (
                                            <input
                                                type="date"
                                                id="fecha_nacimiento"
                                                name="fecha_nacimiento"
                                                className="input-texto"
                                                value={formulario.fecha_nacimiento}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                max={fechaActualStr}
                                            />
                                        ) : (
                                            <div onClick={() => setShowFechaNacimientoInput(true)} className="input-fecha-placeholder">
                                                Fecha de nacimiento *
                                            </div>
                                        )}
                                        {errores.fecha_nacimiento && <p className="error-texto">{errores.fecha_nacimiento}</p>}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha de contratación:</label>
                                        {showFechaContratacionInput || fecha_contratacion ? (
                                            <input
                                                type="date"
                                                id="fecha_contratacion"
                                                name="fecha_contratacion"
                                                className="input-texto"
                                                value={formulario.fecha_contratacion}
                                                min={formulario.fecha_nacimiento ? sumarAnios(formulario.fecha_nacimiento, 18) : undefined}
                                                max={fechaActualStr}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                            />
                                        ) : (
                                            <div onClick={() => setShowFechaContratacionInput(true)} className="input-fecha-placeholder">
                                                Fecha de contratación *
                                            </div>
                                        )}
                                        {errores.fecha_contratacion && <p className="error-texto">{errores.fecha_contratacion}</p>}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Celular:</label>
                                        <input
                                            name="celular"
                                            placeholder="Celular *"
                                            value={formulario.celular}
                                            onChange={(e) => {
                                                const onlyValid = e.target.value.replace(/[^\d+]/g, "")
                                                handleInputChange({ target: { name: "celular", value: onlyValid } })
                                            }}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            maxLength={15}
                                        />
                                        {errores.celular && <p className="error-texto">{errores.celular}</p>}
                                        {formulario.celular.length === 15 && (
                                            <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="button-container">
                                    <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-crear" disabled={loadingCrear}>
                                        {loadingCrear ? "Creando manicurista..." : "Crear manicurista"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {(mostrarModalEditar || modoVer) && manicuristaSeleccionado && (
                <div
                    className="overlay-popup"
                    onClick={() => {
                        if (!modoVer) setMostrarModalEditar(false)
                    }}
                >
                    <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="contenido-popup2">
                            <h2 className="text-xl font-semibold mb-4">
                                {modoVer ? "Detalles de la manicurista" : "Editar Manicurista"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    if (!modoVer) handleEditarManicurista()
                                }}
                                className="form-crear-usuario"
                            >
                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Tipo de documento:</label>
                                        <select
                                            name="tipo_documento"
                                            value={nuevoManicurista.tipo_documento || ""}
                                            onChange={handleInputChangeEditar}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                        >
                                            <option value="">Selecciona una opción</option>
                                            <option value="CC">Cédula</option>
                                            <option value="CE">Cédula extranjería</option>
                                        </select>
                                        {errores.tipo_documento && <p className="error-texto">{errores.tipo_documento}</p>}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Número de documento:</label>
                                        <input
                                            name="numero_documento"
                                            placeholder="Número de documento *"
                                            value={nuevoManicurista.numero_documento || ""}
                                            onChange={(e) => {
                                                if (!modoVer) {
                                                    const onlyNumbers = e.target.value.replace(/\D/g, "")
                                                    handleInputChangeEditar({ target: { name: "numero_documento", value: onlyNumbers } })
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            maxLength={15}
                                            readOnly={modoVer}
                                        />
                                        {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                                        {nuevoManicurista.numero_documento?.length === 15 && (
                                            <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombres:</label>
                                        <input
                                            name="nombre"
                                            placeholder="Nombres *"
                                            value={nuevoManicurista.nombre || ""}
                                            className="input-texto"
                                            maxLength={40}
                                            onChange={(e) => {
                                                if (!modoVer) {
                                                    const value = e.target.value
                                                    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                                    if (regex.test(value) && value.length <= 40) {
                                                        handleInputChangeEditar(e)
                                                    }
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                        />
                                        {errores.nombre && <p className="error-texto">{errores.nombre}</p>}
                                        {nuevoManicurista.nombre?.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 40 caracteres.
                                            </p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Apellidos:</label>
                                        <input
                                            name="apellido"
                                            placeholder="Apellidos *"
                                            value={nuevoManicurista.apellido || ""}
                                            className="input-texto"
                                            maxLength={40}
                                            onChange={(e) => {
                                                if (!modoVer) {
                                                    const value = e.target.value
                                                    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                                                    if (regex.test(value) && value.length <= 40) {
                                                        handleInputChangeEditar(e)
                                                    }
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                        />
                                        {errores.apellido && <p className="error-texto">{errores.apellido}</p>}
                                        {nuevoManicurista.apellido?.length === 40 && (
                                            <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                                                Has alcanzado el máximo de 40 caracteres.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Nombre de usuario:</label>
                                        <input
                                            name="username_out"
                                            placeholder="Nombre de usuario *"
                                            value={nuevoManicurista.username_out || ""}
                                            className="input-texto"
                                            maxLength={20}
                                            onChange={(e) => {
                                                if (!modoVer) handleEditarCambio(e)
                                            }}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                        />
                                        {errores.username_out && <p className="error-texto">{errores.username_out}</p>}
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Correo:</label>
                                        <input
                                            name="correo"
                                            placeholder="Correo *"
                                            value={nuevoManicurista.correo || ""}
                                            className="input-texto"
                                            onChange={handleInputChangeEditar}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                        />
                                        {errores.correo && <p className="error-texto">{errores.correo}</p>}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Celular:</label>
                                        <input
                                            name="celular"
                                            placeholder="Celular *"
                                            value={nuevoManicurista.celular || ""}
                                            onChange={(e) => {
                                                if (!modoVer) {
                                                    const onlyValid = e.target.value.replace(/[^\d+]/g, "")
                                                    handleInputChangeEditar({ target: { name: "celular", value: onlyValid } })
                                                }
                                            }}
                                            onBlur={handleBlur}
                                            className="input-texto"
                                            maxLength={15}
                                            readOnly={modoVer}
                                        />
                                        {errores.celular && <p className="error-texto">{errores.celular}</p>}
                                        {nuevoManicurista.celular?.length === 15 && (
                                            <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                                        )}
                                    </div>

                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha de nacimiento:</label>
                                        <input
                                            type="date"
                                            name="fecha_nacimiento"
                                            value={nuevoManicurista.fecha_nacimiento || ""}
                                            className="input-texto"
                                            onChange={handleInputChangeEditar}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                            max={fechaActualStr}
                                        />
                                        {errores.fecha_nacimiento && <p className="error-texto">{errores.fecha_nacimiento}</p>}
                                    </div>
                                </div>

                                <div className="fila-formulario">
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Fecha de contratación:</label>
                                        <input
                                            type="date"
                                            name="fecha_contratacion"
                                            value={nuevoManicurista.fecha_contratacion || ""}
                                            className="input-texto"
                                            onChange={handleInputChangeEditar}
                                            onBlur={handleBlur}
                                            readOnly={modoVer}
                                            min={
                                                nuevoManicurista.fecha_nacimiento
                                                    ? sumarAnios(nuevoManicurista.fecha_nacimiento, 18)
                                                    : undefined
                                            }
                                            max={fechaActualStr}
                                        />
                                        {errores.fecha_contratacion && <p className="error-texto">{errores.fecha_contratacion}</p>}
                                    </div>
                                    <div className="campo">
                                        <label className="subtitulo-editar-todos">Estado:</label>
                                        <select
                                            name="estado"
                                            value={nuevoManicurista.estado || "Activo"}
                                            onChange={handleInputChangeEditar}
                                            onKeyDown={(e) => modoVer && e.preventDefault()}
                                            style={{ pointerEvents: modoVer ? "none" : "auto" }}
                                            className="input-texto"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="button-container">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMostrarModalEditar(false)
                                            setModoVer(false)
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
        </div>
    )
}

export default GestionManicurista
