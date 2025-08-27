import { useState, useEffect } from "react"
import { listar_marcas, crear_marca, editar_marca, eliminar_marca } from "../../../services/marcas_service"
import { listar_calificaciones } from "../../../services/calificaciones_service"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { Bell, User, Star, X } from "lucide-react"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { AiOutlineEye } from "react-icons/ai"
import { Link } from "react-router-dom"

const GestionMarcasRec = () => {
  const MySwal = withReactContent(Swal)
  const [marcas, setMarcas] = useState([])
  const [formulario, setFormulario] = useState({
    nombre: "",
  })
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingEditar, setLoadingEditar] = useState(false)
  const [tocado, setTocado] = useState({})
  const [mostrarCrear, setMostrarCrear] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [modoVer, setModoVer] = useState(false)
  const [marcaSeleccionado, setMarcaSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const marcasPorPagina = 4

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

    cargarMarcas()
    cargarCalificaciones()
  }, [])

  useEffect(() => {
    if (calificaciones.length > 0) {
      const vistasActuales = cargarCalificacionesVistas()
      setCalificacionesVistas(vistasActuales)
    }
  }, [calificaciones])

  const cargarMarcas = async () => {
    try {
      const data = await listar_marcas()
      setMarcas(data)
    } catch (error) {
      console.error("Error al cargar marcas:", error)
    }
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

  const validarCampo = (name, value) => {
    let error = ""
    if (!value.trim()) {
      error = "Campo obligatorio"
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

  const handle_crear_marca = async (e) => {
    e.preventDefault()
    setLoading(true)
    const nuevosErrores = {}
    if (!formulario.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
    setTocado({
      nombre: true,
    })
    setErrores(nuevosErrores)

    if (Object.keys(nuevosErrores).length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      setLoading(false)
      return
    }

    try {
      const respuestaApi = await crear_marca(formulario.nombre)
      if (respuestaApi.errores) {
        setErrores(respuestaApi.errores)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo crear la marca. Revisa los campos.",
          customClass: { popup: "swal-rosado" },
        })
        return
      }

      setMarcas((prev) => [...prev, respuestaApi])
      setFormulario({ nombre: "" })
      setErrores({})
      setTocado({})
      setMostrarCrear(false)
      Swal.fire({
        icon: "success",
        title: "Marca creada",
        text: "La marca fue registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      console.error("Error al crear la marca: ", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la marca.",
        customClass: { popup: "swal-rosado" },
      })
    } finally {
      setLoading(false)
    }
  }

  const abrirEditar = (marca) => {
    const marcaConId = { ...marca }
    setMarcaSeleccionado(marcaConId)
    setMostrarEditar(true)
  }

  const handleEditar = async () => {
    setLoadingEditar(true)
    if (!marcaSeleccionado) return

    const { nombre } = marcaSeleccionado
    const erroresNuevo = {}
    if (!nombre?.trim()) erroresNuevo.nombre = "El nombre es obligatorio"
    setErrores(erroresNuevo)

    if (Object.keys(erroresNuevo).length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      setLoadingEditar(false)
      return
    }

    try {
      const actualizado = await editar_marca(marcaSeleccionado.id, { nombre })
      setMarcas((prev) => prev.map((c) => (c.id === marcaSeleccionado.id ? actualizado : c)))
      setMostrarEditar(false)
      setErrores({})
      Swal.fire({
        icon: "success",
        title: "Marca actualizada",
        text: "Los datos de la marca fueron actualizados correctamente.",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "swal-rosado" },
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar la marca.",
        customClass: {
          popup: "swal-rosado",
        },
      })
    } finally {
      setLoadingEditar(false)
    }
  }

  useEffect(() => {
    if (!mostrarEditar) {
      setErrores({})
    }
  }, [mostrarEditar])

  const handleBuscar = (e) => {
    setBusqueda(e.target.value.toLowerCase())
    setPaginaActual(1)
  }

  const marcasFiltrados = marcas.filter((c) =>
    Object.values(c).some((val) => String(val).toLowerCase().includes(busqueda)),
  )

  const handleEliminarMarca = async (id) => {
    const confirm = await MySwal.fire({
      title: "¿Eliminar marca?",
      text: "Esta acción no se puede deshacer.",
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

    if (confirm.isConfirmed) {
      const res = await eliminar_marca(id)
      if (res.eliminado) {
        setMarcas((prev) => prev.filter((m) => m.id !== id))
        Swal.fire({
          title: "Eliminado",
          text: "La marca fue eliminada.",
          icon: "success",
          customClass: {
            popup: "swal-rosado",
          },
        })
      } else {
        Swal.fire({
          title: "Error",
          text: res.message || "No se pudo eliminar la marca.",
          icon: "error",
          customClass: {
            popup: "swal-rosado",
          },
        })
      }
    }
  }

  useEffect(() => {
    if (!mostrarCrear) {
      setErrores({})
      setTocado({})
      setFormulario({ nombre: "" })
    }
  }, [mostrarCrear])

  const totalPaginas = Math.ceil(marcasFiltrados.length / marcasPorPagina)
  const indiceInicio = (paginaActual - 1) * marcasPorPagina
  const indiceFin = indiceInicio + marcasPorPagina
  const marcasActuales = marcasFiltrados.slice(indiceInicio, indiceFin)

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
        <h1 className="titulo">Gestión de marcas</h1>
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
          Crear marca
        </button>
        <input
          type="text"
          placeholder="Buscar marca..."
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcasActuales.length > 0 ? (
              marcasActuales.map((marca) => (
                <tr key={marca.id}>
                  <td>{marca.nombre}</td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => {
                        setMarcaSeleccionado(marca)
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
                        abrirEditar(marca)
                        setModoVer(false)
                        setMostrarEditar(true)
                      }}
                      className="acciones-btn editar-btn p-2"
                      title="Editar marca"
                    >
                      <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => handleEliminarMarca(marca.id)}
                      className="acciones-btn eliminar-btn p-2"
                      title="Eliminar marca"
                    >
                      <FiTrash2 size={16} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No se encontraron marcas
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
              <h2 className="text-xl font-semibold mb-4">Crear marca</h2>
              <form onSubmit={handle_crear_marca} className="space-y-3">
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre *"
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
                </div>
                <div className="button-container">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarCrear(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-crear" disabled={loading}>
                    {loading ? "Creando marca..." : "Crear marca"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(mostrarEditar || modoVer) && marcaSeleccionado && (
        <div
          className="overlay-popup"
          onClick={() => {
            setMostrarEditar(false)
            setModoVer(false)
          }}
        >
          <div className="ventana-popup" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2">
              <h2 className="text-xl font-semibold mb-4">{modoVer ? "Detalles de la marca" : "Editar marca"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!modoVer) handleEditar()
                }}
                className="space-y-3"
              >
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className="input-texto"
                      maxLength={40}
                      placeholder="Nombre *"
                      value={marcaSeleccionado.nombre}
                      readOnly={modoVer}
                      onChange={(e) => {
                        if (modoVer) return
                        const value = e.target.value
                        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/
                        if (regex.test(value)) {
                          setMarcaSeleccionado({ ...marcaSeleccionado, nombre: value })
                        }
                      }}
                    />
                    {!modoVer && errores.nombre && <p className="error-texto">{errores.nombre}</p>}
                    {!modoVer && marcaSeleccionado.nombre?.length === 40 && (
                      <p className="error-texto">Has alcanzado el máximo de 40 caracteres.</p>
                    )}
                  </div>
                </div>
                <div className="button-container">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setMostrarEditar(false)
                      setModoVer(false)
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
  )
}

export default GestionMarcasRec
