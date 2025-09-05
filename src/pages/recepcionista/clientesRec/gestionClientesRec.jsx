import { useState, useEffect } from "react"
import "../../../css/gestionar.css"
import {
  listar_clientes,
  crear_cliente,
  editar_cliente,
  eliminar_cliente,
  cambiar_estado_cliente,
} from "../../../services/clientes_service"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { User, Star, X } from "lucide-react"
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { AiOutlineEye } from "react-icons/ai"
import { Link } from "react-router-dom"

const GestionClientesRec = () => {
  const MySwal = withReactContent(Swal)
  const [clientes, setClientes] = useState([])

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
  })

  const [errores, setErrores] = useState({})
  const [tocado, setTocado] = useState({})
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [modoVer, setModoVer] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const clientesPorPagina = 4

  const [cargandoCrear, setCargandoCrear] = useState(false)
  const [cargandoActualizar, setCargandoActualizar] = useState(false)

  const [calificaciones, setCalificaciones] = useState([])
  const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabActiva, setTabActiva] = useState("calificaciones")
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
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const data = await listar_clientes()
      setClientes(data)
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  const validarCampo = (name, value) => {
    let error = ""
    const dominiosPermitidos = ["@gmail.com", "@outlook.com", "@yahoo.es", "@yopmail.com"]

    if (!value.trim()) {
      error = "Campo obligatorio"
    } else {
      if (name === "correo") {
        const incluyeDominio = dominiosPermitidos.some((dom) => value.endsWith(dom))
        if (!value.includes("@") || !incluyeDominio) {
          error = "Correo inválido. Usa @gmail.com, @outlook.com o @yahoo.es"
        }
      }

      if (name === "celular") {
        const soloNumeros = value.replace(/\D/g, "")
        if (soloNumeros.length < 10 || soloNumeros.length > 15) {
          error = "El celular debe tener entre 10 y 15 dígitos"
        }
      } else if (name === "password") {
        if (value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres."
        } else if (!/\d/.test(value)) {
          error = "La contraseña debe contener al menos un número."
        } else if (!/[^a-zA-Z0-9\s]/.test(value)) {
          error = "La contraseña debe contener al menos un carácter especial."
        }
      } else if (name === "passwordConfirm" && formulario.password !== value) {
        error = "Las contraseñas no coinciden."
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
    if (tocado[name]) {
      validarCampo(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTocado((prev) => ({ ...prev, [name]: true }))
    validarCampo(name, value)
  }

  const handle_crear_cliente = async (e) => {
    e.preventDefault()
    setCargandoCrear(true)

    const nuevosErrores = {}
    if (!formulario.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
    if (!formulario.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio"
    if (!formulario.tipo_documento.trim()) nuevosErrores.tipo_documento = "El tipo de documento es obligatorio"
    if (!formulario.numero_documento.trim()) nuevosErrores.numero_documento = "El número de documento es obligatorio"
    if (!formulario.correo.trim()) nuevosErrores.correo = "El correo es obligatorio"
    if (!formulario.username.trim()) nuevosErrores.username = "El nombre de usuario es obligatorio"
    if (!formulario.celular.trim()) nuevosErrores.celular = "El celular es obligatorio"

    setTocado({
      nombre: true,
      apellido: true,
      correo: true,
      username: true,
      tipo_documento: true,
      numero_documento: true,
      celular: true,
    })
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      setCargandoCrear(false)
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    try {
      const respuestaApi = await crear_cliente(
        formulario.username,
        formulario.nombre,
        formulario.apellido,
        formulario.correo,
        formulario.celular,
        formulario.tipo_documento,
        formulario.numero_documento,
      )

      if (respuestaApi.errores) {
        const erroresBackend = respuestaApi.errores
        const erroresAdaptados = {}

        for (const campo in erroresBackend) {
          if (Array.isArray(erroresBackend[campo])) {
            erroresAdaptados[campo] = erroresBackend[campo][0]
          } else {
            erroresAdaptados[campo] = erroresBackend[campo]
          }
        }

        setErrores(erroresAdaptados)
        setCargandoCrear(false)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Corrige los errores indicados en el formulario.",
          customClass: { popup: "swal-rosado" },
        })
        return
      }

      setClientes((prev) => [...prev, respuestaApi])

      // Limpiar formulario
      setFormulario({
        nombre: "",
        apellido: "",
        tipo_documento: "",
        numero_documento: "",
        correo: "",
        username: "",
        celular: "",
      })
      setErrores({})
      setTocado({})
      setMostrarCrear(false)
      setCargandoCrear(false)

      Swal.fire({
        icon: "success",
        title: "Cliente creado",
        text: "El cliente fue registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      setCargandoCrear(false)
      console.error("Error al crear el cliente: ", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el usuario.",
        customClass: { popup: "swal-rosado" },
      })
    }
  }

  const abrirEditar = (cliente) => {
    const clienteConId = {
      ...cliente,
      usuario_id: cliente.usuario_id || cliente.id || cliente.usuario,
    }
    setClienteSeleccionado(clienteConId)
    setMostrarEditar(true)
  }

  const handleEditar = async () => {
    if (!clienteSeleccionado) return
    setCargandoActualizar(true)

    const {
      usuario_id,
      nombre,
      apellido,
      username,
      correo,
      celular,
      estado,
      tipo_documento,
      numero_documento,
      password,
      passwordConfirm,
    } = clienteSeleccionado

    const erroresNuevo = {}

    if (!nombre?.trim()) erroresNuevo.nombre = "El nombre es obligatorio"
    if (!apellido?.trim()) erroresNuevo.apellido = "El apellido es obligatorio"
    if (!tipo_documento?.trim()) erroresNuevo.tipo_documento = "El tipo de documento es obligatorio"
    if (!numero_documento?.trim()) erroresNuevo.numero_documento = "El número de documento es obligatorio"
    if (!correo?.trim()) erroresNuevo.correo = "El correo es obligatorio"
    if (!celular?.trim()) erroresNuevo.celular = "El celular es obligatorio"
    if (!estado) erroresNuevo.estado = "El estado es obligatorio"

    if (password || passwordConfirm) {
      if (!password?.trim()) erroresNuevo.password = "La contraseña es obligatoria"
      if (!passwordConfirm?.trim()) {
        erroresNuevo.passwordConfirm = "Confirme la contraseña"
      } else if (password !== passwordConfirm) {
        erroresNuevo.passwordConfirm = "Las contraseñas no coinciden"
      }
    }

    setErrores(erroresNuevo)

    if (Object.keys(erroresNuevo).length > 0) {
      setCargandoActualizar(false)
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    try {
      const actualizado = await editar_cliente(usuario_id, {
        nombre,
        apellido,
        username,
        correo,
        celular,
        estado,
        tipo_documento,
        numero_documento,
        ...(password ? { password } : {}),
      })

      // Si la respuesta es un error estructurado del backend
      if (actualizado.errores) {
        const erroresBackend = actualizado.errores
        const erroresAdaptados = {}

        for (const campo in erroresBackend) {
          if (Array.isArray(erroresBackend[campo])) {
            erroresAdaptados[campo] = erroresBackend[campo][0]
          } else {
            erroresAdaptados[campo] = erroresBackend[campo]
          }
        }

        setErrores(erroresAdaptados)
        setCargandoActualizar(false)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Corrige los errores indicados en el formulario.",
          customClass: { popup: "swal-rosado" },
        })
        return
      }

      setClientes((prev) => prev.map((c) => (c.usuario_id === clienteSeleccionado.usuario_id ? actualizado : c)))

      setMostrarEditar(false)
      setErrores({})
      setCargandoActualizar(false)

      Swal.fire({
        icon: "success",
        title: "Cliente actualizado",
        text: "Los datos del cliente fueron actualizados correctamente.",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      setCargandoActualizar(false)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el cliente.",
        customClass: { popup: "swal-rosado" },
      })
    }
  }

  useEffect(() => {
    if (!mostrarEditar) {
      setErrores({})
      setCargandoActualizar(false)
    }
  }, [mostrarEditar])

  const handleEliminar = async (cliente) => {
    const resultado = await MySwal.fire({
      title: "Eliminar cliente",
      html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar a <strong>${cliente.nombre} ${cliente.apellido}</strong>?</p>`,
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
        const respuestaApi = await eliminar_cliente(cliente.usuario_id)

        let shouldUpdateState = false
        let isElimination = false
        let swalConfig = {}

        if (respuestaApi?.message === "Cliente y usuario asociado desactivado correctamente") {
          shouldUpdateState = true
          isElimination = false
          swalConfig = {
            title: "Cliente desactivado",
            text: "El cliente ha sido desactivado exitosamente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        } else if (respuestaApi?.message === "El usuario y cliente fueron eliminados correctamente") {
          shouldUpdateState = true
          isElimination = true
          swalConfig = {
            title: "Cliente eliminado",
            text: "El cliente y su usuario han sido eliminados permanentemente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        } else if (
          respuestaApi?.message === "No se puede eliminar la cliente porque tiene citas en proceso o pendientes."
        ) {
          swalConfig = {
            title: "No se puede eliminar",
            text: "El cliente tiene citas activas o pendientes. Finaliza o cancela esas citas antes de intentar eliminarla.",
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
          shouldUpdateState = true
          isElimination = true
          swalConfig = {
            title: "Cliente eliminado",
            text: "El cliente y su usuario han sido eliminados permanentemente.",
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          }
        }

        if (shouldUpdateState) {
          setClientes((prev) => {
            const actualizados = isElimination
              ? prev.filter((c) => c.usuario_id !== cliente.usuario_id) 
              : prev.map((c) => (c.usuario_id === cliente.usuario_id ? { ...c, estado: "Inactivo" } : c)) 

            const totalFiltrados = actualizados.filter((c) =>
              Object.values(c).some((valor) => String(valor).toLowerCase().includes(busqueda.toLowerCase())),
            ).length

            const nuevaTotalPaginas = Math.ceil(totalFiltrados / clientesPorPagina)

            if (paginaActual > nuevaTotalPaginas) {
              setPaginaActual(nuevaTotalPaginas || 1)
            }

            return actualizados
          })
        }

        await MySwal.fire(swalConfig)
      } catch (error) {
        console.error("Error al eliminar el cliente:", error)
        MySwal.fire({
          title: "Error",
          text: error.message || "No se pudo eliminar el cliente.",
          icon: "error",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    }
  }

  const handleCambiarEstado = async (cliente) => {
    try {
      await cambiar_estado_cliente(cliente.usuario_id)

      const clienteActual = clientes.find((c) => c.usuario_id === cliente.usuario_id)
      const nuevoEstado = clienteActual.estado === "Activo" ? "Inactivo" : "Activo"

      setClientes((prevClientes) =>
        prevClientes.map((c) => (c.usuario_id === cliente.usuario_id ? { ...c, estado: nuevoEstado } : c)),
      )

      Swal.fire({
        title: "Estado actualizado",
        text: `El cliente ahora está ${nuevoEstado}.`,
        icon: "success",
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      console.error("Error al cambiar el estado del cliente: ", error)
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo cambiar el estado del cliente",
        icon: "error",
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    }
  }

  const handleBuscar = (e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }

  const renderPlaceholder = (label, name) => {
    return `${label} *`
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario({ ...formulario, [name]: value })

    if (errores[name]) {
      validarCampo(name, value)
    }
  }

  const inputClass = (name) => (errores[name] ? "input-texto input-error" : "input-texto")

  const clientesFiltrados = clientes.filter((c) =>
    Object.values(c).some((val) => String(val).toLowerCase().includes(busqueda)),
  )

  useEffect(() => {
    if (!mostrarCrear) {
      setErrores({})
      setTocado({})
      setCargandoCrear(false)
      setFormulario({
        nombre: "",
        apellido: "",
        tipo_documento: "",
        numero_documento: "",
        correo: "",
        username: "",
        celular: "",
        password: "",
        passwordConfirm: "",
      })
    }
  }, [mostrarCrear])

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina)
  const indiceInicio = (paginaActual - 1) * clientesPorPagina
  const indiceFin = indiceInicio + clientesPorPagina
  const clientesActuales = clientesFiltrados.slice(indiceInicio, indiceFin)

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
        <h1 className="titulo">Gestión de Clientes</h1>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button className="crear-btn mt-4" onClick={() => setMostrarCrear(true)}>
          Crear Cliente
        </button>

        <input
          type="text"
          placeholder="Buscar cliente..."
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
              <th>Correo</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesActuales.length > 0 ? (
              clientesActuales.map((cliente) => (
                <tr key={cliente.usuario_id}>
                  <td>
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td>{cliente.numero_documento}</td>
                  <td>{cliente.correo}</td>
                  <td>{cliente.celular}</td>
                  <td>
                    <button
                      onClick={() => handleCambiarEstado(cliente)}
                      className={`estado-btn ${cliente.estado === "Activo" ? "estado-activo" : "estado-inactivo"}`}
                    >
                      {cliente.estado}
                    </button>
                  </td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => {
                        setClienteSeleccionado(cliente)
                        abrirEditar(cliente)
                        setModoVer(true)
                        setMostrarEditar(true)
                      }}
                      className="acciones-btn ver-btn p-2"
                      title="Ver detalles"
                    >
                      <AiOutlineEye size={16} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => {
                        setClienteSeleccionado(cliente)
                        abrirEditar(cliente)
                        setModoVer(false)
                        setMostrarEditar(true)
                      }}
                      className="acciones-btn editar-btn p-2"
                      title="Editar cliente"
                    >
                      <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => handleEliminar(cliente)}
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
                <td colSpan="7" className="text-center">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="paginacion-container">
        <div
          className={`flecha ${paginaActual === 1 ? "flecha-disabled" : ""}`}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >
          &#8592;
        </div>

        <span className="texto-paginacion">
          Página {paginaActual} de {totalPaginas}
        </span>

        <div
          className={`flecha ${paginaActual === totalPaginas ? "flecha-disabled" : ""}`}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >
          &#8594;
        </div>
      </div>

      {mostrarCrear && (
        <div className="overlay-popup" onClick={() => setMostrarCrear(false)}>
          <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
              <h2 className="text-xl font-semibold mb-4">Crear Cliente</h2>
              <form onSubmit={handle_crear_cliente} className="space-y-3">
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Tipo de documento:</label>
                    <select
                      name="tipo_documento"
                      className="input-select"
                      value={formulario.tipo_documento}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Tipo de documento *</option>
                      <option value="CC">Cédula</option>
                      <option value="CE">Cédula extranjería</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="RC">Registro civil</option>
                      <option value="PA">Pasaporte</option>
                    </select>
                    {tocado.tipo_documento && errores.tipo_documento && (
                      <p className="error-texto">{errores.tipo_documento}</p>
                    )}
                  </div>
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Número de documento:</label>
                    <input
                      type="text"
                      name="numero_documento"
                      placeholder="Documento *"
                      className="input-texto"
                      value={formulario.numero_documento}
                      maxLength={15}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        handleInputChange({ target: { name: "numero_documento", value: onlyNumbers } })
                      }}
                      onBlur={handleBlur}
                    />
                    {tocado.numero_documento && errores.numero_documento && (
                      <p className="error-texto">{errores.numero_documento}</p>
                    )}
                    {formulario.numero_documento.length === 15 && (
                      <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                    )}
                  </div>
                </div>
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Nombres:</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombres *"
                      className="input-texto"
                      value={formulario.nombre}
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
                    {tocado.nombre && errores.nombre && <p className="error-texto">{errores.nombre}</p>}
                    {formulario.nombre.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Apellidos:</label>
                    <input
                      type="text"
                      name="apellido"
                      placeholder="Apellidos *"
                      className="input-texto"
                      value={formulario.apellido}
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
                    {tocado.apellido && errores.apellido && <p className="error-texto">{errores.apellido}</p>}
                    {formulario.apellido.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
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
                      maxLength={20}
                      onChange={(e) => {
                        if (e.target.value.length <= 20) handleInputChange(e)
                      }}
                      onBlur={handleBlur}
                    />
                    {tocado.correo && errores.correo && <p className="error-texto">{errores.username}</p>}
                    {formulario.username.length === 20 && (
                      <p className="error-texto"> Has alcanzado el máximo de 20 caracteres.</p>
                    )}
                  </div>
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Correo:</label>
                    <input
                      type="email"
                      name="correo"
                      placeholder="Correo *"
                      className="input-texto"
                      value={formulario.correo}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                    />
                    {tocado.correo && errores.correo && <p className="error-texto">{errores.correo}</p>}
                  </div>
                </div>

                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Teléfono:</label>
                    <input
                      type="tel"
                      name="celular"
                      placeholder="Teléfono *"
                      className="input-texto"
                      value={formulario.celular}
                      maxLength={15}
                      onChange={(e) => {
                        const onlyValid = e.target.value.replace(/[^\d+]/g, "")
                        handleInputChange({ target: { name: "celular", value: onlyValid } })
                      }}
                      onBlur={handleBlur}
                    />
                    {tocado.celular && errores.celular && <p className="error-texto">{errores.celular}</p>}
                    {formulario.celular.length === 15 && (
                      <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                    )}
                  </div>
                </div>

                <div className="button-container">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarCrear(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-crear" disabled={cargandoCrear}>
                    {cargandoCrear ? "Creando cliente..." : "Crear cliente"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(mostrarEditar || modoVer) && clienteSeleccionado && (
        <div
          className="overlay-popup"
          onClick={() => {
            setMostrarEditar(false)
            setModoVer(false)
          }}
        >
          <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
              <h2 className="text-xl font-semibold mb-4">{modoVer ? "Detalles del cliente" : "Editar cliente"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleEditar()
                }}
                className="space-y-3"
              >
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Tipo de documento:</label>
                    <select
                      name="tipo_documento"
                      className="input-select"
                      value={clienteSeleccionado.tipo_documento}
                      style={{ pointerEvents: modoVer ? "none" : "auto" }}
                      onChange={(e) =>
                        setClienteSeleccionado({ ...clienteSeleccionado, tipo_documento: e.target.value })
                      }
                    >
                      <option value="">Tipo de documento *</option>
                      <option value="CC">Cédula</option>
                      <option value="CE">Cédula extranjería</option>
                      <option value="TI">Tarjeta de identidad</option>
                      <option value="RC">Registro civil</option>
                      <option value="PA">Pasaporte</option>
                    </select>
                    {errores.tipo_documento && <p className="error-texto">{errores.tipo_documento}</p>}
                  </div>

                  <div className="campo">
                    <label className="subtitulo-editar-todos">Número de documento:</label>
                    <input
                      type="text"
                      name="numero_documento"
                      className="input-texto"
                      maxLength={15}
                      readOnly={modoVer}
                      placeholder="Documento *"
                      value={clienteSeleccionado.numero_documento}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        setClienteSeleccionado({ ...clienteSeleccionado, numero_documento: onlyNumbers })
                      }}
                    />
                    {errores.numero_documento && <p className="error-texto">{errores.numero_documento}</p>}
                    {clienteSeleccionado.numero_documento?.length === 15 && (
                      <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                    )}
                  </div>
                </div>
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Nombre:</label>
                    <input
                      type="text"
                      name="nombre"
                      className="input-texto"
                      maxLength={40}
                      placeholder="Nombres *"
                      readOnly={modoVer}
                      value={clienteSeleccionado.nombre}
                      onChange={(e) => {
                        const value = e.target.value
                        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                        if (regex.test(value)) {
                          setClienteSeleccionado({ ...clienteSeleccionado, nombre: value })
                        }
                      }}
                    />
                    {errores.nombre && <p className="error-texto">{errores.nombre}</p>}
                    {clienteSeleccionado.nombre?.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>

                  <div className="campo">
                    <label className="subtitulo-editar-todos">Apellido:</label>
                    <input
                      type="text"
                      name="apellido"
                      className="input-texto"
                      maxLength={40}
                      readOnly={modoVer}
                      placeholder="Apellidos *"
                      value={clienteSeleccionado.apellido}
                      onChange={(e) => {
                        const value = e.target.value
                        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                        if (regex.test(value)) {
                          setClienteSeleccionado({ ...clienteSeleccionado, apellido: value })
                        }
                      }}
                    />
                    {errores.apellido && <p className="error-texto">{errores.apellido}</p>}
                    {clienteSeleccionado.apellido?.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>
                </div>
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Nombre de usuario:</label>
                    <input
                      type="text"
                      name="username"
                      className="input-texto"
                      maxLength={20}
                      readOnly={modoVer}
                      placeholder="Nombre de Usuario *"
                      value={clienteSeleccionado.username_out}
                      onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, username: e.target.value })}
                    />
                    {errores.username && <p className="error-texto">{errores.username}</p>}
                    {clienteSeleccionado.username?.length === 20 && (
                      <p className="error-texto">Has alcanzado el máximo de 20 caracteres.</p>
                    )}
                  </div>

                  <div className="campo">
                    <label className="subtitulo-editar-todos">Correo:</label>
                    <input
                      type="email"
                      name="correo"
                      className="input-texto"
                      placeholder="Correo *"
                      readOnly={modoVer}
                      value={clienteSeleccionado.correo}
                      onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, correo: e.target.value })}
                    />
                    {errores.correo && <p className="error-texto">{errores.correo}</p>}
                  </div>
                </div>
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Teléfono:</label>
                    <input
                      type="tel"
                      name="celular"
                      className="input-texto"
                      maxLength={15}
                      readOnly={modoVer}
                      placeholder="Celular *"
                      value={clienteSeleccionado.celular}
                      onChange={(e) => {
                        const onlyValid = e.target.value.replace(/[^\d+]/g, "")
                        setClienteSeleccionado({ ...clienteSeleccionado, celular: onlyValid })
                      }}
                    />
                    {errores.celular && <p className="error-texto">{errores.celular}</p>}
                    {clienteSeleccionado.celular?.length === 15 && (
                      <p className="error-texto">Has alcanzado el máximo de 15 caracteres.</p>
                    )}
                  </div>
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Estado:</label>
                    <select
                      name="estado"
                      className="input-select"
                      value={clienteSeleccionado.estado}
                      style={{ pointerEvents: modoVer ? "none" : "auto" }}
                      onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, estado: e.target.value })}
                    >
                      <option value="">Estado *</option>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                    {errores.estado && <p className="error-texto">{errores.estado}</p>}
                  </div>
                </div>
                <div className="button-container">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarEditar(false)
                      setModoVer(false)
                    }}
                    className="btn-cancelar"
                  >
                    {modoVer ? "Volver" : "Cancelar"}
                  </button>
                  {!modoVer && (
                    <button type="submit" className="btn-crear" disabled={cargandoActualizar}>
                      {cargandoActualizar ? "Actualizando..." : "Actualizar"}
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

export default GestionClientesRec
