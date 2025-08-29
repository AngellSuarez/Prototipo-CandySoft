import { useState, useEffect } from "react"
import { AiOutlineEye } from "react-icons/ai"
import { FiTrash2 } from 'react-icons/fi';
import "../../../css/gestionar.css"
import "../../../css/liquidaciones.css"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useTheme } from "../../tema/ThemeContext"
import { Link } from "react-router-dom"
import { User, Star, X } from "lucide-react"
import { listar_calificaciones } from "../../../services/calificaciones_service"
import {
  listar_liquidaciones,
  fechas_ultimas_liquidaciones,
  listar_citas_completadas,
  crear_liquidacion,
  eliminar_liquidacion,
} from "../../../services/liquidaciones_service.js"

import { listar_manicursitas_activas } from "../../../services/manicuristas_services.js"

const GestionLiquidacionesRec = () => {
  const [liquidaciones, setLiquidaciones] = useState([])
  const [liqAnteriores, setFechasLiquidaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cargandoCrearLiquidacion, setCargandoCrearLiquidacion] = useState(false)

  const MySwal = withReactContent(Swal)

  const handleEliminarLiq = (liq) => {
    MySwal.fire({
      title: `Eliminar la liquidación`,
      html: `
                                <p class="texto-blanco">¿Estás seguro de que deseas eliminar la liquidación de la manicurista <strong>${liq.manicurista_nombre}</strong>?</p>
                                `,
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminar_liquidacion(liq.id)
          setLiquidaciones((prevLiquidaciones) => prevLiquidaciones.filter((liquidacion) => liquidacion.id !== liq.id))
          MySwal.fire({
            title: "Eliminado",
            text: `La liquidación del día ${liq.FechaFinal}, para el manicurista ${liq.manicurista_nombre} ha sido eliminada.`,
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          })
        } catch (error) {
          MySwal.fire({
            title: "Error",
            text: error.message || "No se pudo eliminar la liquidacion.",
            icon: "error",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          })
        }
      }
    })
  }

  //listar fechas ultima liquidacion
  useEffect(() => {
    const fecthFechasLiquidacion = async () => {
      try {
        const data = await fechas_ultimas_liquidaciones()
        setFechasLiquidaciones(data || [])
      } catch (err) {
        console.error("Error al conseguir las ultimas fechas: ", err)
        setError("No se ha podido cargar las ultimas fechas")
      }
    }
    fecthFechasLiquidacion()
  }, [])

  //listar liquidaciones
  useEffect(() => {
    const fetchLiquidaciones = async () => {
      setLoading(true)
      try {
        const data = await listar_liquidaciones()
        console.log("Liquidaciones:", data)

        const ordenadas = [...(data || [])].sort((a, b) => b.id - a.id)

        setLiquidaciones(ordenadas)
      } catch (err) {
        console.error("Error al cargar las liquidaciones: ", err)
        setError("No se ha podido cargar la lista de liquidaciones")
      } finally {
        setLoading(false)
      }
    }
    fetchLiquidaciones()
  }, [])

  const [busqueda, setBusqueda] = useState("")
  const [liquidacionSeleccionado, setLiquidacionSeleccionado] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 4

  const [isCrearModalOpen, setCrearModalOpen] = useState(false)

  const [errorMani, setErrorMani] = useState("")

  const [errorCitas, setErrorCitas] = useState("")

  const [tocoValidar, setTocoValidar] = useState(false)

  const handleCrearLiquidacion = async () => {
    if (!manicuristaSeleccionada) {
      setTocoValidar(true)
      setErrorMani("Debes de seleccionar una manicurista")
      setErrorCitas("Selecciona una manicurista para ver sus citas")
      Swal.fire({
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos",
        icon: "warning",
        confirmButtonColor: "#7e2952",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    if (citasFiltradas.length === 0) {
      setErrorCitas("No hay citas en el rango seleccionado")
      Swal.fire({
        title: "Sin citas",
        text: "No hay citas en el rango de fechas seleccionado para crear la liquidación.",
        icon: "warning",
        confirmButtonColor: "#7e2952",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    setCargandoCrearLiquidacion(true)

    try {
      const response = await crear_liquidacion(Number.parseInt(manicuristaSeleccionada), fechaInicio, fechaFinal)

      if (response) {
        Swal.fire({
          title: "Liquidación creada",
          text: "La liquidación fue registrada exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-rosado" },
        })
        closeCrearModal()
        const data = await listar_liquidaciones()
        setLiquidaciones(data || [])
      } else {
        Swal.fire({
          title: "Error al crear",
          text: "No se pudo crear la liquidación. Intenta nuevamente.",
          icon: "error",
          showConfirmButton: false,
          customClass: { popup: "swal-rosado" },
        })
      }
    } catch (error) {
      console.error("Hubo un error al crear la liquidación:", error)
      Swal.fire({
        title: "Error",
        text: error.message || "Ocurrió un error al guardar la información de la liquidación.",
        icon: "error",
        confirmButtonColor: "#7e2952",
        customClass: { popup: "swal-rosado" },
      })
    } finally {
      setCargandoCrearLiquidacion(false)
    }
  }

  const openCrearModal = () => setCrearModalOpen(true)
  const closeCrearModal = () => {
    setCrearModalOpen(false)
    setManicuristaSeleccionada("")
    setErrorMani("")
    setFechaInicio("")
    setFechaFinal("")
    setCitasFiltradas([])
    setErrorCitas("")
    setTocoValidar(false)
    setCargandoCrearLiquidacion(false)
  }

  const [isVerModalOpen, setVerModalOpen] = useState(false)

  const openVerModal = async (liquidacion) => {
    if (!liquidacion || !liquidacion.manicurista_id || !liquidacion.FechaInicial || !liquidacion.FechaFinal) {
      console.error("Liquidación o sus propiedades necesarias están incompletas:", liquidacion)
      return
    }

    const citas = await handleBuscarCitas_modal(
      liquidacion.manicurista_id,
      liquidacion.FechaInicial,
      liquidacion.FechaFinal,
    )

    console.log("Citas recibidas en openVerModal:", citas)

    const liquidacionConCitas = {
      ...liquidacion,
      citas: citas,
    }

    setLiquidacionSeleccionado(liquidacionConCitas)
    setVerModalOpen(true)
  }

  const closeVerModal = () => {
    setLiquidacionSeleccionado(null)
    setVerModalOpen(false)
  }

  const handleBuscar = (e) => {
    const valorBusqueda = e.target.value.toLowerCase()
    setBusqueda(valorBusqueda)
    setPaginaActual(1)
  }

  const liquidacionesFiltradas = liquidaciones.filter((liquidacion) =>
    Object.values(liquidacion).some((valor) => String(valor).toLowerCase().includes(busqueda)),
  )

  const indexUltima = paginaActual * itemsPorPagina
  const indexPrimera = indexUltima - itemsPorPagina
  const liquidacionesActuales = liquidacionesFiltradas.slice(indexPrimera, indexUltima)
  const totalPaginas = Math.ceil(liquidacionesFiltradas.length / itemsPorPagina)

  const [manicuristaSeleccionada, setManicuristaSeleccionada] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [citasFiltradas, setCitasFiltradas] = useState([])
  const [totalServicios, setTotalServicios] = useState(0)
  const [comision, setComision] = useState(0)

  //conseguir y almacenar las manicuristas activas
  const [manicuristas, setManicuristas] = useState([])

  useEffect(() => {
    const fetchManicuristas = async () => {
      try {
        const data = await listar_manicursitas_activas()
        setManicuristas(data || [])
      } catch (err) {
        console.error("Error al cargar las liquidaciones: ", err)
        setError("No se ha podido cargar la lista de liquidaciones")
      }
    }

    fetchManicuristas()
  }, [])

  const obtenerFechaHoy = () => {
    const hoy = new Date()
    return hoy.toISOString().split("T")[0]
  }

  const obtenerFechaHaceCincoDias = () => {
    const hoy = new Date()
    const cincoDiasAtras = new Date(hoy)
    cincoDiasAtras.setDate(hoy.getDate() - 5)
    return cincoDiasAtras.toISOString().split("T")[0]
  }

  const fechaHoy = obtenerFechaHoy()
  const fechaCincoDiasAtras = obtenerFechaHaceCincoDias()

  useEffect(() => {
    if (manicuristaSeleccionada) {
      const manicuristaId = Number.parseInt(manicuristaSeleccionada)
      const ultimaLiquidacion = liqAnteriores.find((l) => l.manicurista_id === manicuristaId)

      let fechaMinima = fechaCincoDiasAtras

      if (ultimaLiquidacion) {
        const fechaUltima = ultimaLiquidacion.ultima_fecha

        const fechaUltimaObj = new Date(fechaUltima)
        const fechaCincoAtrasObj = new Date(fechaCincoDiasAtras)

        fechaUltimaObj.setDate(fechaUltimaObj.getDate())
        const diaSiguiente = fechaUltimaObj.toISOString().split("T")[0]

        fechaMinima = new Date(diaSiguiente) > fechaCincoAtrasObj ? diaSiguiente : fechaCincoDiasAtras
      }

      setFechaInicio(fechaMinima)
      setFechaFinal(fechaHoy)
      setErrorCitas("")
    } else {
      if (tocoValidar) {
        setErrorCitas("No hay citas, por lo tanto, no se puede crear la liquidación.")
      }
    }
  }, [manicuristaSeleccionada, tocoValidar])

  const handleBuscarCitas = async () => {
    if (!manicuristaSeleccionada || !fechaInicio || !fechaFinal) {
      setErrorCitas("Selecciona una manicurista y un rango de fechas válido")
      return
    }

    try {
      const response = await listar_citas_completadas(manicuristaSeleccionada, fechaFinal, fechaInicio)

      if (!response || !response.detalle) {
        setErrorCitas("No se pudo obtener la información de citas")
        setCitasFiltradas([])
        return
      }

      const citasMapeadas = response.detalle.map((cita) => ({
        fecha: cita.Fecha,
        total: cita.Total,
        servicio: "No especificado",
      }))

      setCitasFiltradas(citasMapeadas)
      setTotalServicios(response.resumen?.total_general || 0)
      setComision((response.resumen?.total_general || 0) / 2)
      setErrorCitas(citasMapeadas.length === 0 ? "No hay citas en el rango seleccionado" : "")
    } catch (error) {
      console.error("Error al cargar citas:", error)
      setErrorCitas("Error al cargar las citas")
      setCitasFiltradas([])
    }
  }

  const cambiarPagina = (numero) => {
    if (numero < 1 || numero > totalPaginas) return
    setPaginaActual(numero)
  }

  const handleBuscarCitas_modal = async (manicuristaId, fechaInicial, fechaFinal) => {
    try {
      const response = await listar_citas_completadas(manicuristaId, fechaFinal, fechaInicial)

      if (!response || !response.detalle) {
        console.warn("No se pudo obtener la información de citas o detalle vacío.")
        return []
      }

      const citasMapeadas = response.detalle.map((cita) => ({
        fecha: cita.Fecha,
        total: cita.Total,
        servicio: "No especificado",
      }))
      return citasMapeadas
    } catch (error) {
      console.error("Error al cargar citas en handleBuscarCitas:", error)
      return []
    }
  }

  const handleChangeFechaInicio = (e) => {
    const nuevaFechaInicio = e.target.value
    setFechaInicio(nuevaFechaInicio)
  }

  const { darkMode } = useTheme()

  const [calificaciones, setCalificaciones] = useState([])
  const [calificacionesVistas, setCalificacionesVistas] = useState(new Set())
  const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabActiva, setTabActiva] = useState("calificaciones")

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

  if (loading) return null
  if (error) return <p className="error">{error}</p>

  return (
    <div className={`roles-container ${darkMode ? "dark" : ""}`}>
      <div className="fila-formulario">
        <h1 className="titulo">Gestión liquidaciones</h1>

        <div className="iconos-perfil-2">
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
        <button onClick={openCrearModal} className="crear-btn">
          Crear liquidación
        </button>

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
                  <td>$ {Number.parseFloat(liq.TotalGenerado).toLocaleString("es-CO")}</td>
                  <td>$ {Number.parseFloat(liq.Comision).toLocaleString("es-CO")}</td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => openVerModal(liq)}
                      className="acciones-btn ver-btn"
                      title="Ver detalles de la liquidación"
                    >
                      <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => handleEliminarLiq(liq)}
                      className="acciones-btn eliminar-btn"
                      title="Eliminar la liquidación"
                    >
                      <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No se encontraron liquidaciones
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
        <div className="overlay-popup-liquidacion" onClick={closeCrearModal}>
          <div className="ventana-popup-liquidacion overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup2-liquidacion">
              <h2 className="text-xl font-semibold mb-4">Crear liquidación</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCrearLiquidacion()
                  setTocoValidar(true)
                }}
                className="space-y-3"
              >
                <div className="fila-formulario">
                  <div className="campo">
                    <label className="subtitulo-editar-todos">Manicurista</label>
                    <select
                      id="seleccionarManicurista"
                      className="input-select"
                      onChange={(e) => {
                        setManicuristaSeleccionada(e.target.value)
                        setErrorMani("")
                      }}
                      onBlur={() => {
                        setTocoValidar(true)
                        if (!manicuristaSeleccionada) {
                          setErrorMani("Debes de seleccionar una manicurista")
                        }
                      }}
                      value={manicuristaSeleccionada}
                    >
                      <option value="" disabled>
                        Selecciona una manicurista
                      </option>
                      {manicuristas.map((m) => (
                        <option key={m.usuario_id} value={m.usuario_id}>
                          {m.nombre} {m.apellido}
                        </option>
                      ))}
                    </select>
                    {errorMani && <p className="error-texto">{errorMani}</p>}
                  </div>

                  <div className="campo">
                    <label className="subtitulo-editar-todos">Fecha inicial</label>
                    <input
                      type="date"
                      id="fechaInicial"
                      className="input-fecha-activo-liq"
                      value={fechaInicio}
                      min={fechaInicio}
                      max={fechaHoy}
                      onChange={handleChangeFechaInicio}
                      disabled={!manicuristaSeleccionada}
                    />
                  </div>

                  <div className="campo">
                    <label className="subtitulo-editar-todos">Fecha final</label>
                    <input
                      type="date"
                      id="fechaFinal"
                      className="input-fecha-activo-liq"
                      value={fechaFinal}
                      min={fechaInicio}
                      max={fechaHoy}
                      onChange={(e) => setFechaFinal(e.target.value)}
                      disabled={!manicuristaSeleccionada}
                    />
                  </div>

                  <div className="campo ">
                    <label className="subtitulo-editar-todos">Consultar</label>
                    <button
                      type="button"
                      className="btn-buscar"
                      onClick={handleBuscarCitas}
                      disabled={!manicuristaSeleccionada || !fechaInicio || !fechaFinal}
                    >
                      Consultar citas
                    </button>
                  </div>
                </div>

                {/* Tabla de citas */}
                <div className="mb-6">
                  <h3 className="cita-periodo">Citas en el período seleccionado</h3>
                  {manicuristaSeleccionada ? (
                    citasFiltradas.length > 0 ? (
                      <div className="tabla-liq">
                        <table className="roles-table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {citasFiltradas.map((cita, index) => (
                              <tr key={index}>
                                <td>{cita.fecha}</td>
                                <td>$ {cita.total.toLocaleString("es-CO")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="rangos">No hay citas en el rango de fechas seleccionado.</p>
                    )
                  ) : (
                    <>
                      <p className="rangos">Selecciona una manicurista para ver sus citas.</p>
                      {errorCitas && tocoValidar && <p className="error-texto">{errorCitas}</p>}
                    </>
                  )}
                </div>

                {/* Totales */}
                {manicuristaSeleccionada && citasFiltradas.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded mb-6">
                    <div className="fila-totales">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Total Generado:</label>
                        <input
                          className="input-select"
                          value={`$ ${totalServicios.toLocaleString("es-CO")}`}
                          readOnly
                        />
                      </div>
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Comisión Manicurista:</label>
                        <input className="input-select" value={`$ ${comision.toLocaleString("es-CO")}`} readOnly />
                      </div>
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Comisión Local:</label>
                        <input className="input-select" value={`$ ${comision.toLocaleString("es-CO")}`} readOnly />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="button-container">
                  <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-crear" disabled={cargandoCrearLiquidacion}>
                    {cargandoCrearLiquidacion ? "Creando liquidación..." : "Crear liquidación"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                      <input className="input-select" value={liquidacionSeleccionado.manicurista_nombre} readOnly />
                    </div>
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Fecha de inicio:</label>
                      <input className="input-select" value={liquidacionSeleccionado.FechaInicial} readOnly />
                    </div>
                  </div>
                  <div className="fila-formulario">
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Fecha final:</label>
                      <input className="input-select" value={liquidacionSeleccionado.FechaFinal} readOnly />
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
              <div className="button-container">
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

export default GestionLiquidacionesRec
