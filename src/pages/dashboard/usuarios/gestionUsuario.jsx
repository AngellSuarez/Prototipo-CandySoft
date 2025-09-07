import { useEffect, useState } from "react"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import "../../../css/gestionar.css"
import { AiOutlineEye } from "react-icons/ai"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useTheme } from "../../tema/ThemeContext"
import { Link } from "react-router-dom"
import { User, Star, X } from "lucide-react"
import { listar_calificaciones } from "../../../services/calificaciones_service"
import {
  cambiar_estado_usuario,
  eliminar_usuario,
  crear_usuario,
  editar_usuario,
  listar_usuarios_administrativos,
} from "../../../services/usuarios_service"
import { listar_roles } from "../../../services/roles_service"

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingEditar, setLoadingEditar] = useState(false)

  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const usuarioPorPagina = 4

  const initialFormData = {
    tipo_documento: "",
    numero_documento: "",
    nombre: "",
    apellido: "",
    correo: "",
    username: "",
    rol_id: "",
  }

  const [isCrearModalOpen, setCrearModalOpen] = useState(false)
  const openCrearModal = () => setCrearModalOpen(true)
  const closeCrearModal = () => {
    setCrearModalOpen(false)
    setFormData(initialFormData)
    setErrores({})
  }

  const [modoVerUsuario, setModoVerUsuario] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    nombre: "",
    apellido: "",
    correo: "",
    rol_id: "",
    tipo_documento: "",
    numero_documento: "",
  })

  const handle_crear_usuario = async (e) => {
    e.preventDefault()
    setLoading(true)
    const nuevosErrores = {}

    if (!formData.tipo_documento.trim()) nuevosErrores.tipo_documento = "El tipo de documento es obligatorio"
    if (!formData.numero_documento.trim()) nuevosErrores.numero_documento = "El número de documento es obligatorio"
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio"
    if (!formData.correo.trim()) nuevosErrores.correo = "El correo es obligatorio"
    if (!formData.username.trim()) nuevosErrores.username = "El nombre de usuario es obligatorio"
    if (!formData.rol_id) nuevosErrores.rol = "Debe seleccionar un rol"

    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      MySwal.fire({
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        icon: "warning",
        confirmButtonColor: "#7e2952",
        customClass: { popup: "swal-rosado" },
      })
      setLoading(false)
      return
    }

    try {
      const respuestaApi = await crear_usuario(
        formData.username,
        formData.nombre,
        formData.apellido,
        formData.correo,
        formData.rol_id,
        formData.tipo_documento,
        formData.numero_documento,
      )

      if (respuestaApi.ok) {
        const user = respuestaApi.data
        MySwal.fire({
          title: "Usuario Creado",
          text: "El usuario fue registrado exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-rosado" },
        }).then(() => {
          setUsuarios((prev) => [...prev, user])
          setFormData({
            nombre: "",
            apellido: "",
            correo: "",
            username: "",
            rol_id: "",
            tipo_documento: "",
            numero_documento: "",
          })
          setErrores({})
          closeCrearModal()
        })
      } else {
        const erroresBackend = respuestaApi.errores
        const nuevosErrores = {}

        if (erroresBackend.username) nuevosErrores.username = erroresBackend.username[0]
        if (erroresBackend.correo) nuevosErrores.correo = erroresBackend.correo[0]
        if (erroresBackend.numero_documento) nuevosErrores.numero_documento = erroresBackend.numero_documento[0]
        if (erroresBackend.nombre) nuevosErrores.nombre = erroresBackend.nombre[0]
        if (erroresBackend.apellido) nuevosErrores.apellido = erroresBackend.apellido[0]

        setErrores(nuevosErrores)

        MySwal.fire({
          title: "Error al crear usuario",
          text: "Corrige los errores indicados en el formulario.",
          icon: "error",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    } catch (error) {
      console.error("Error al crear el usuario: ", error)
      MySwal.fire({
        title: "Error",
        text: error.message || "No se pudo crear el usuario.",
        icon: "error",
        confirmButtonColor: "#7e2952",
        customClass: { popup: "swal-rosado" },
      })
    } finally {
      setLoading(false)
    }
  }

  const [errores, setErrores] = useState({})
  const [rolSeleccionado, setRolSeleccionado] = useState(null)

  const validarCampo = (name, value) => {
    let error = ""

    if (!value.trim()) {
      switch (name) {
        case "username":
          error = "el nombre de usuario es obligatorio"
          break
        case "nombre":
          error = "El nombre es obligatorio"
          break
        case "apellido":
          error = "El apellido es obligatorio"
          break
        case "correo":
          error = "El correo electrónico es obligatorio"
          break
        case "rol_id":
          error = "El rol es obligatorio"
          break
      }
    } else {
      if (name === "correo") {
        if (!value.includes("@") || !/\S+@\S+\.\S+/.test(value)) {
          error = "Correo electrónico inválido."
        }
      }
    }

    setErrores({ ...errores, [name]: error })
  }

  const MySwal = withReactContent(Swal)

  const handleEliminarUsuario = async (usuario) => {
    const resultado = await MySwal.fire({
      title: `Eliminar al usuario`,
      html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar a <strong>${usuario.nombre} ${usuario.apellido}</strong>?</p>`,
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
        const respuestaApi = await eliminar_usuario(usuario.id)
        let swalConfig = {}

        if (respuestaApi?.message === "Usuario inactivado correctamente") {
          setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, estado: "Inactivo" } : u)))

          swalConfig = {
            title: "Usuario inactivado",
            text: "El usuario ha sido inactivado exitosamente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        } else if (respuestaApi?.message === "Usuario y sus asociados eliminados permanentemente") {
          setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id))

          swalConfig = {
            title: "Usuario Eliminado",
            text: "El usuario y sus datos asociados han sido eliminados permanentemente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        } else if (respuestaApi?.message) {
          setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, estado: "Inactivo" } : u)))

          swalConfig = {
            title: "Usuario inactivado",
            text: respuestaApi.message,
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        } else {
          setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id))

          swalConfig = {
            title: "Usuario Eliminado",
            text: "El usuario y sus datos asociados han sido eliminados permanentemente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        }

        setUsuarios((prev) => {
          const totalFiltrados = prev.filter((u) =>
            Object.values(u).some((valor) => String(valor).toLowerCase().includes(busqueda.toLowerCase())),
          ).length

          const nuevaTotalPaginas = Math.ceil(totalFiltrados / usuarioPorPagina)
          if (paginaActual > nuevaTotalPaginas) {
            setPaginaActual(nuevaTotalPaginas || 1)
          }

          return prev
        })

        MySwal.fire(swalConfig)
      } catch (error) {
        MySwal.fire({
          title: "Error",
          text: `Ocurrió un error al eliminar el usuario: ${error.message}`,
          icon: "error",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errores[name]) {
      validarCampo(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    validarCampo(name, value)
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

  const inputClass = (name) => (errores[name] ? "input-texto input-error" : "input-texto")

  const selectClass = (name) => (errores[name] ? "input-select input-error" : "input-select")

  const renderPlaceholder = (label, name) => {
    return `${label} *`
  }

  const [isEditarModalOpen, setEditarModalOpen] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)

  const openEditarModal = (usuario) => {
    setUsuarioEditando(usuario)
    setModoVerUsuario(false)
    setEditarModalOpen(true)
  }

  const closeEditarModal = () => {
    setUsuarioEditando(null)
    setEditarModalOpen(false)
    setErroresEditar({})
    setModoVerUsuario(false)
  }

  const cambiarPagina = (numero) => {
    if (numero < 1 || numero > totalPaginas) return
    setPaginaActual(numero)
  }

  const handleEditarUsuario = (id) => {
    const usuario = usuarios.find((u) => u.id === id)
    if (usuario) {
      openEditarModal(usuario)
    }
  }

  const [erroresEditar, setErroresEditar] = useState({})

  const handleEditarCambio = (e) => {
    const { name, value } = e.target

    setUsuarioEditando((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (erroresEditar[name]) {
      validarCampo(name, value)
    }
  }

  const openVerModal = (usuario) => {
    setUsuarioEditando(usuario)
    setModoVerUsuario(true)
    setEditarModalOpen(true)
  }

  const handleBuscar = (e) => {
    const valorBusqueda = e.target.value.toLowerCase()
    setBusqueda(valorBusqueda)
    setPaginaActual(1)
  }

  const usuariosFiltrados = (usuarios ?? []).filter((usuario) =>
    Object.values(usuario ?? {}).some((valor) => String(valor).toLowerCase().includes(busqueda.toLowerCase())),
  )

  const indexUltimoUsuario = paginaActual * usuarioPorPagina
  const indexPrimerUsuario = indexUltimoUsuario - usuarioPorPagina
  const usuariosActuales = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario)
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuarioPorPagina)

  const { darkMode } = useTheme()

  const [calificaciones, setCalificaciones] = useState([])
  const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabActiva, setTabActiva] = useState("notificaciones")
  const [notificaciones, setNotificaciones] = useState([])

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
    if (tabActiva === "notificaciones") {
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
    const obtener_usuarios = async () => {
      try {
        const data = await listar_usuarios_administrativos()
        setUsuarios(data)
        console.log(data)
      } catch (error) {
        console.error("Error al llamar los usuarios: ", error)
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudieron cargar los usuarios",
          icon: "error",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    }

    obtener_usuarios()
  }, [])

  useEffect(() => {
    const obtener_roles = async () => {
      try {
        const data = await listar_roles()
        const filteredRoles = data.filter((rol) => rol.nombre != "Manicurista" && rol.nombre != "Cliente")
        setRoles(filteredRoles)
        console.log(filteredRoles)
      } catch (error) {
        console.error("Error al llamar los módulos: ", error)
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudieron cargar los módulos.",
          icon: "error",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    }

    obtener_roles()
  }, [])

  const handleToggleEstado = async (id) => {
    try {
      await cambiar_estado_usuario(id)

      const usuarioActual = usuarios.find((usuario) => usuario.id === id)
      const nuevoEstado = usuarioActual.estado === "Activo" ? "Inactivo" : "Activo"

      setUsuarios((prevUsuarios) => 
        prevUsuarios.map((usuario) => (usuario.id === id ? { ...usuario, estado: nuevoEstado } : usuario)),
      )

      Swal.fire({
        title: "Estado actualizado",
        text: `El usuario ahora está ${nuevoEstado}.`,
        icon: "success",
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      console.error("Error al cambiar el estado del usuario: ", error)
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo cambiar el estado del usuario",
        icon: "error",
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    }
  }

  useEffect(() => {
    if (!isCrearModalOpen && !isEditarModalOpen) {
      setErrores({
        username: "",
        nombre: "",
        apellido: "",
        descripcion: "",
        tipo_documento: "",
        numero_documento: "",
        estado: "Activo",
      })
      setErrores({})
      setRolSeleccionado(null)
    }
  }, [isCrearModalOpen, isEditarModalOpen])

  return (
    <div className={`roles-container ${darkMode ? "dark" : ""}`}>
      <div className="fila-formulario">
        <h1 className="titulo">Gestión de usuarios</h1>

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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={openCrearModal} className="crear-btn mt-4">
          Crear usuario
        </button>

        <input
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={handleBuscar}
          className="busqueda-input"
        />
      </div>

      <div className="overflow-hidden">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Nombre Apellido</th>
              <th>Número documento</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosActuales.length > 0 ? (
              usuariosActuales.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    {usuario.nombre} {usuario.apellido}
                  </td>
                  <td>{usuario.numero_documento}</td>
                  <td>{usuario.rol_id_out}</td>
                  <td>
                    <button
                      onClick={() => handleToggleEstado(usuario.id)}
                      className={`estado-btn ${usuario.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                    >
                      {usuario.estado}
                    </button>
                  </td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => openVerModal(usuario)}
                      className="acciones-btn ver-btn flex items-center justify-center p-2"
                      title="Ver detalles del usuario"
                    >
                      <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => handleEditarUsuario(usuario.id)}
                      className="acciones-btn editar-btn flex items-center justify-center p-2"
                      title="Editar el usuario"
                    >
                      <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => handleEliminarUsuario(usuario)}
                      className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                      title="Eliminar el usuario"
                    >
                      <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No se encontraron usuarios
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

      {isCrearModalOpen && (
        <div className="overlay-popup" onClick={closeCrearModal}>
          <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
              <h2 className="text-xl font-semibold mb-4">Crear usuario</h2>
              <form onSubmit={handle_crear_usuario} className="form-crear-usuario">
                <div className="fila-formulario">
                  <div className="campo relative">
                    <label htmlFor="tipo_documento" className="subtitulo-editar-todos">
                      Tipo de documento:
                    </label>
                    <select
                      name="tipo_documento"
                      id="tipo_documento"
                      className={selectClass("rol")}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={formData.tipo_documento}
                    >
                      <option value="">Seleccionar</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PA">Pasaporte</option>
                    </select>
                    {errores.tipo_documento && <p className="error-texto">{errores.tipo_documento}</p>}
                  </div>
                  <div className="campo relative">
                    <label htmlFor="apellido" className="subtitulo-editar-todos">
                      Número de documento:
                    </label>
                    <input
                      type="text"
                      name="numero_documento"
                      placeholder={renderPlaceholder("Numero Documento", "numero documento")}
                      className={inputClass("nombre")}
                      value={formData.numero_documento}
                      maxLength={15}
                      onChange={(e) => {
                        const value = e.target.value
                        const regex = /^[0-9]*$/ // Solo números
                        if (regex.test(value) && value.length <= 15) {
                          handleChange(e)
                        }
                      }}
                    />
                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                  </div>
                </div>

                <div className="fila-formulario">
                  <div className="campo relative">
                    <label htmlFor="nombre" className="subtitulo-editar-todos">
                      Nombres:
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder={renderPlaceholder("Nombres", "nombre")}
                      className={inputClass("nombre")}
                      value={formData.nombre}
                      maxLength={40}
                      onChange={(e) => {
                        const value = e.target.value
                        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                        if (regex.test(value) && value.length <= 40) {
                          handleChange(e)
                        }
                      }}
                      onBlur={handleBlur}
                    />
                    {errores.nombre && (
                      <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                        {errores.nombre}
                      </p>
                    )}
                    {formData.nombre.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>

                  <div className="campo relative">
                    <label htmlFor="apellido" className="subtitulo-editar-todos">
                      Apellidos:
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      placeholder={renderPlaceholder("Apellidos", "apellido")}
                      className={inputClass("apellido")}
                      value={formData.apellido}
                      maxLength={40}
                      onChange={(e) => {
                        const value = e.target.value
                        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                        if (regex.test(value) && value.length <= 40) {
                          handleChange(e)
                        }
                      }}
                      onBlur={handleBlur}
                    />
                    {errores.apellido && <p className="error-texto">{errores.apellido}</p>}
                    {formData.apellido.length === 40 && (
                      <p className="error-texto"> Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>
                </div>

                <div className="fila-formulario">
                  <div className="campo">
                    <label htmlFor="correo" className="subtitulo-editar-todos">
                      Correo:
                    </label>
                    <input
                      type="email"
                      name="correo"
                      placeholder={renderPlaceholder("Correo Electrónico", "correo")}
                      className={inputClass("correo")}
                      value={formData.correo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errores.correo && <p className="error-texto">{errores.correo}</p>}
                  </div>

                  <div className="campo relative">
                    <label htmlFor="username" className="subtitulo-editar-todos">
                      Nombre de usuario:
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder={renderPlaceholder("Nombre usuario", "username")}
                      className={inputClass("username")}
                      value={formData.username}
                      maxLength={20}
                      onChange={(e) => {
                        if (e.target.value.length <= 20) handleChange(e)
                      }}
                      onBlur={handleBlur}
                    />
                    {errores.username && <p className="error-texto">{errores.username}</p>}
                    {formData.username.length === 20 && (
                      <p className="error-texto"> Has alcanzado el máximo de 20 caracteres.</p>
                    )}
                  </div>
                </div>

                <div className="fila-formulario">
                  <div className="campo">
                    <label htmlFor="rol_id" className="subtitulo-editar-todos">
                      Rol:
                    </label>
                    <select
                      name="rol_id"
                      className={selectClass("rol")}
                      value={formData.rol_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Seleccionar Rol *</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.id}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.rol && <p className="error-texto">{errores.rol}</p>}
                  </div>
                </div>

                <div className="button-container">
                  <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-crear" disabled={loading}>
                    {loading ? "Creando usuario..." : "Crear usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditarModalOpen && usuarioEditando && (
        <div className="overlay-popup" onClick={closeEditarModal}>
          <div className="ventana-popup max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
              <h2 className="text-xl font-semibold mb-4">
                {modoVerUsuario ? "Detalle del usuario" : "Editar usuario"}
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setLoadingEditar(true)
                  if (modoVerUsuario) return

                  const errores = {}
                  let isValid = true

                  // Validación frontend
                  Object.keys(usuarioEditando).forEach((key) => {
                    if (
                      key !== "estado" &&
                      key !== "password" &&
                      key !== "passwordConfirm" &&
                      typeof usuarioEditando[key] === "string" &&
                      usuarioEditando[key].trim() === ""
                    ) {
                      errores[key] = "Este campo es obligatorio"
                      isValid = false
                    }
                  })

                  // Validar contraseñas solo si alguna fue modificada
                  if (usuarioEditando.password || usuarioEditando.passwordConfirm) {
                    if (usuarioEditando.password !== usuarioEditando.passwordConfirm) {
                      errores.passwordConfirm = "Las contraseñas no coinciden"
                      isValid = false
                    }
                  }

                  if (!isValid) {
                    setErroresEditar(errores)
                    Swal.fire({
                      icon: "warning",
                      title: "Campos obligatorios",
                      text: "Por favor completa todos los campos requeridos.",
                      customClass: { popup: "swal-rosado" },
                    })
                    setLoadingEditar(false)
                    return
                  }

                  if (usuarioEditando.estado === "Activo") {
                    const rolAsociado = roles.find(r => r.id === usuarioEditando.rol_id);
                    if (rolAsociado?.estado === "Inactivo") {
                      Swal.fire({
                        icon: "warning",
                        title: "Rol inactivo",
                        text: `No puedes activar al usuario porque su rol "${rolAsociado.nombre}" está inactivo.`,
                        customClass: { popup: "swal-rosado" }
                      });
                      setLoadingEditar(false);
                      return;
                    }
                  }

                  try {
                    const respuesta = await editar_usuario(
                      usuarioEditando.id,
                      usuarioEditando.username,
                      usuarioEditando.password,
                      usuarioEditando.nombre,
                      usuarioEditando.apellido,
                      usuarioEditando.correo,
                      usuarioEditando.rol_id,
                      usuarioEditando.tipo_documento,
                      usuarioEditando.numero_documento,
                      usuarioEditando.estado,
                    )

                    if (respuesta?.errores) {
                      const erroresBackend = {}

                      if (respuesta.errores.username) erroresBackend.username = respuesta.errores.username[0]

                      if (respuesta.errores.correo) erroresBackend.correo = respuesta.errores.correo[0]

                      if (respuesta.errores.numero_documento)
                        erroresBackend.numero_documento = respuesta.errores.numero_documento[0]

                      if (respuesta.errores.password) erroresBackend.password = respuesta.errores.password[0]

                      if (respuesta.errores.nombre) erroresBackend.nombre = respuesta.errores.nombre[0]

                      if (respuesta.errores.apellido) erroresBackend.apellido = respuesta.errores.apellido[0]

                      if (respuesta.errores.tipo_documento)
                        erroresBackend.tipo_documento = respuesta.errores.tipo_documento[0]

                      if (respuesta.errores.rol_id) erroresBackend.rol_id = respuesta.errores.rol_id[0]

                      setErroresEditar(erroresBackend)

                      Swal.fire({
                        icon: "error",
                        title: "Error al actualizar",
                        text: "Corrige los errores indicados en el formulario.",
                        customClass: { popup: "swal-rosado" },
                      })

                      return
                    }

                    // Actualización exitosa
                    setUsuarios((prev) => prev.map((u) => (u.id === usuarioEditando.id ? usuarioEditando : u)))

                    closeEditarModal()

                    Swal.fire({
                      icon: "success",
                      title: "Usuario actualizado",
                      text: "Los datos del usuario fueron actualizados correctamente.",
                      timer: 2000,
                      showConfirmButton: false,
                      customClass: { popup: "swal-rosado" },
                    })

                    setErroresEditar({})
                  } catch (error) {
                    console.error("Error al editar el usuario:", error)
                    Swal.fire({
                      icon: "error",
                      title: "Error inesperado",
                      text: "No se pudo actualizar el usuario. Intenta nuevamente.",
                      customClass: { popup: "swal-rosado" },
                    })
                  } finally {
                    setLoadingEditar(false)
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="fila-formulario">
                    <div className="campo relative">
                      <label htmlFor="tipo_documento" className="subtitulo-editar-todos">
                        Tipo de documento:
                      </label>
                      <select
                        name="tipo_documento"
                        id="tipo_documento"
                        className={selectClass("rol")}
                        onChange={handleEditarCambio}
                        onBlur={handleBlur}
                        value={usuarioEditando.tipo_documento || ""}
                        style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                      >
                        <option value="">Seleccionar</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PA">Pasaporte</option>
                      </select>
                    </div>
                    <div className="campo relative">
                      <label htmlFor="numero_documento" className="subtitulo-editar-todos">
                        Número de documento:
                      </label>
                      <input
                        type="text"
                        name="numero_documento"
                        placeholder="Numero Documento"
                        className={inputClass("nombre")}
                        value={usuarioEditando.numero_documento || ""}
                        maxLength={15}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[0-9]*$/
                          if (regex.test(value) && value.length <= 15) {
                            handleEditarCambio(e)
                          }
                        }}
                        readOnly={modoVerUsuario}
                      />
                      {erroresEditar.numero_documento && !modoVerUsuario && (
                        <p className="error-mensaje">{erroresEditar.numero_documento}</p>
                      )}
                      {usuarioEditando.numero_documento?.length === 15 && (
                        <p className="error-mensaje">Has alcanzado el máximo de 15 caracteres.</p>
                      )}
                    </div>
                  </div>
                  <div className="fila-formulario">
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Nombres:</label>
                      <input
                        type="text"
                        name="nombre"
                        value={usuarioEditando.nombre}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                          if (regex.test(value) && value.length <= 40) {
                            handleEditarCambio(e)
                          }
                        }}
                        placeholder="Nombres"
                        className="input-texto"
                        readOnly={modoVerUsuario}
                        style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                      />
                      {erroresEditar.nombre && !modoVerUsuario && (
                        <p className="error-mensaje">{erroresEditar.nombre}</p>
                      )}
                      {usuarioEditando.nombre.length === 40 && !modoVerUsuario && (
                        <p className="error-mensaje">Has alcanzado el máximo de 40 caracteres.</p>
                      )}
                    </div>

                    <div className="campo">
                      <label className="subtitulo-editar-todos">Apellidos:</label>
                      <input
                        type="text"
                        name="apellido"
                        value={usuarioEditando.apellido}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                          if (regex.test(value) && value.length <= 40) {
                            handleEditarCambio(e)
                          }
                        }}
                        placeholder="Apellidos"
                        className="input-texto"
                        readOnly={modoVerUsuario}
                        style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                      />
                      {erroresEditar.apellido && !modoVerUsuario && (
                        <p className="error-mensaje">{erroresEditar.apellido}</p>
                      )}
                      {usuarioEditando.apellido.length === 40 && !modoVerUsuario && (
                        <p className="error-mensaje">Has alcanzado el máximo de 40 caracteres.</p>
                      )}
                    </div>
                  </div>

                  <div className="fila-formulario">
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Correo:</label>
                      <input
                        type="email"
                        name="correo"
                        value={usuarioEditando.correo}
                        onChange={handleEditarCambio}
                        placeholder="Correo Electrónico"
                        className="input-texto"
                        readOnly={modoVerUsuario}
                        style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                      />
                      {erroresEditar.correo && !modoVerUsuario && (
                        <p className="error-mensaje">{erroresEditar.correo}</p>
                      )}
                    </div>

                    <div className="campo">
                      <label className="subtitulo-editar-todos">Nombre de usuario:</label>
                      <input
                        type="text"
                        name="username"
                        value={usuarioEditando.username}
                        onChange={(e) => {
                          if (e.target.value.length <= 20) handleEditarCambio(e)
                        }}
                        placeholder="Username"
                        className="input-texto"
                        readOnly={modoVerUsuario}
                        style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                      />
                      {erroresEditar.username && !modoVerUsuario && (
                        <p className="error-mensaje">{erroresEditar.username}</p>
                      )}
                      {usuarioEditando.username.length === 20 && !modoVerUsuario && (
                        <p className="error-mensaje">Has alcanzado el máximo de 20 caracteres.</p>
                      )}
                    </div>
                  </div>

                  <div className="fila-formulario">
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Rol:</label>
                      <div className="campo">
                        <select
                          name="rol_id"
                          className={selectClass("rol")}
                          value={usuarioEditando.rol_id}
                          onChange={handleEditarCambio}
                          style={{ pointerEvents: modoVerUsuario ? "none" : "auto" }}
                        >
                          <option value="">Seleccionar Rol *</option>
                          {roles.map((rol) => (
                            <option key={rol.id} value={rol.id}>
                              {rol.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Estado:</label>
                      <div className="campo">
                        <select
                          name="estado"
                          className={selectClass("rol")}
                          value={usuarioEditando.estado}
                          onChange={handleEditarCambio}
                          style={{
                            pointerEvents: modoVerUsuario ? "none" : "auto"
                          }}
                        >
                          <option value="">Selecciona el estado</option>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>

                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="button-container">
                    <button type="button" className="btn-cancelar" onClick={closeEditarModal}>
                      {modoVerUsuario ? "Volver" : "Cancelar"}
                    </button>
                    {!modoVerUsuario && (
                      <button type="submit" className="btn-crear" disabled={loadingEditar}>
                        {loadingEditar ? "Actualizando..." : "Actualizar"}
                      </button>
                    )}
                  </div>
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

export default GestionUsuarios
