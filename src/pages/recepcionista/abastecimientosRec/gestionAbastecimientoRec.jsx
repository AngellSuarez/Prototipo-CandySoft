import { useState } from "react"
import { AiOutlineEye, AiOutlineCheck } from "react-icons/ai"
import { FiTrash2 } from "react-icons/fi"
import "../../../css/gestionar.css"
import "../../../css/abastecimientos.css"
import "../../../css/liquidaciones.css"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useTheme } from "../../tema/ThemeContext"
import { Link } from "react-router-dom"
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { useCallback } from "react"

import { useEffect } from "react"
import {
  getAbastecimiento,
  getAbastecimientos,
  eliminarAbastecimiento,
  getInsumosDisponibles,
  crearAbastecimiento,
  agregarInsumosAAbastecimiento,
  reportarInsumos,
} from "../../../services/abastecimientos_service"
import { listar_manicursitas_activas } from "../../../services/manicuristas_services"

const GestionAbastecimientosRec = () => {
  //variables a utilizar, manicuristas, abastecimientos , insumos
  const [manicuristas, setManicuristas] = useState([])
  const [manicuristaSeleccionada, setManicuristaSeleccionada] = useState("")
  const [abastecimientos, setAbastecimientos] = useState([])
  const [insumos, setInsumos] = useState([])
  const [insumosDisponibles, setInsumosDisponibles] = useState([])
  const [indiceEditando, setIndiceEditando] = useState(null)
  const [indiceEditandoItem, setIndiceEditandoItem] = useState(null)
  const [editandoDesdeItems, setEditandoDesdeItems] = useState(false)
  const [items, setItems] = useState([])
  const [sugerenciasInsumo, setSugerenciasInsumo] = useState([])

  const { darkMode } = useTheme()

  const [abastecimientoSeleccionado, setAbastecimientoSeleccionado] = useState(null)

  const [loadingCrear, setLoadingCrear] = useState(false)
  const [loadingCompletar, setLoadingCompletar] = useState(false)

  //parte encargada de los errores de los campos
  const [errorManicurista, setErrorManicurista] = useState("")
  const [errorFechaAbastecimiento, setErrorFechaAbastecimiento] = useState("")
  const [errorInsumos, setErrorInsumos] = useState("")
  const [tocoValidar, setTocoValidar] = useState(false)
  const [errorInsumoSeleccionado, setErrorInsumoSeleccionado] = useState("")
  const [tocoValidarInsumo, setTocoValidarInsumo] = useState(false)
  const [errorCantidad, setErrorCantidad] = useState("")
  const [tocoValidarCantidad, setTocoValidarCantidad] = useState(false)

  const [erroresEstado, setErroresEstado] = useState({})

  //efects para cargar los datos necesarios al inicio, manicuristas, insumos
  const fetchAbastecimientos = useCallback(async () => {
    try {
      const data = await getAbastecimientos()
      console.log("Abastecimientos obtenidos:", data)

      // Sort by ID in descending order
      const ordenadas = [...(data || [])].sort((a, b) => b.id - a.id)
      setAbastecimientos(ordenadas)
    } catch (error) {
      console.error("Error al obtener los abastecimientos: ", error)
      setAbastecimientos([])
    }
  }, [])

  useEffect(() => {
    fetchAbastecimientos()
  }, [fetchAbastecimientos])

  useEffect(() => {
    const fetchManicuristas = async () => {
      try {
        const data = await listar_manicursitas_activas()
        console.log("Manicuristas obtenidas:", data)
        setManicuristas(data)
      } catch (error) {
        console.error("Error al obtener las manicuristas: ", error)
        setManicuristas([])
      }
    }
    fetchManicuristas()
  }, [])

  useEffect(() => {
    const fetchInsumosDisponibles = async () => {
      try {
        const data = await getInsumosDisponibles()
        console.log("Insumos disponibles:", data)
        setInsumosDisponibles(data)
      } catch (error) {
        console.error("Error al obtener los insumos disponibles: ", error)
        setInsumosDisponibles([])
      }
    }
    fetchInsumosDisponibles()
  }, [])

  //parte de crear abastecimiento
  const [isCrearModalOpen, setCrearModalOpen] = useState(false)
  const openCrearModal = () => setCrearModalOpen(true)

  const closeCrearModal = () => {
    setCrearModalOpen(false)

    setErrorManicurista("")
    setErrorInsumos("")
    setErrorFechaAbastecimiento("")

    setManicuristaSeleccionada("")
    setInsumos([])
    setAbastecimientoDate("")
    setLoadingCrear(false)
  }

  const handleCrearAbastecimiento = async (e = null) => {
    if (e) e.preventDefault()

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Vas a crear un abastecimiento con los datos e insumos ingresados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, crear abastecimiento",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: { popup: "swal-rosado" },
    })

    if (!confirmacion.isConfirmed) return

    setLoadingCrear(true)

    try {
      const nuevoAbastecimiento = await crearAbastecimiento(manicuristaSeleccionada)
      console.log(manicuristaSeleccionada)
      console.log("Abastecimiento creado:", nuevoAbastecimiento)

      const insumosFormateados = insumosEnModal.map((ins) => {
        const insumo = insumosDisponibles.find((i) => i.nombre === ins.nombre)
        return {
          insumo_id: insumo.id,
          cantidad: ins.cantidad,
        }
      })

      const respuestaInsumos = await agregarInsumosAAbastecimiento(nuevoAbastecimiento.id, insumosFormateados)
      console.log("Insumos agregados:", respuestaInsumos)

      MySwal.fire({
        title: "Abastecimiento creado",
        text: "El abastecimiento ha sido creado exitosamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "swal-rosado",
        },
      })
      setCrearModalOpen(false)
      fetchAbastecimientos()
      setInsumos([])
      setInsumosEnModal([])
      setManicuristaSeleccionada("")
      setAbastecimientoDate("")
      setPasoActual(1)
      setTocoValidar(false)
      setLoadingCrear(false)
    } catch (error) {
      console.error("Error en el proceso de creación:", error)
      MySwal.fire({
        title: "Error creando abastecimiento",
        text: error.message || "No se pudo crear el abastecimiento.",
        icon: "error",
        showConfirmButton: false,
        customClass: {
          popup: "swal-rosado",
        },
      })
      setLoadingCrear(false)
    }
  }

  //parte de ver abasteciminento
  useEffect(() => {
    if (abastecimientoSeleccionado) {
      console.log("Abastecimiento seleccionado (después de la actualización de estado): ", abastecimientoSeleccionado)
    }
  }, [abastecimientoSeleccionado])
  const [isVerModalOpen, setVerModalOpen] = useState(false)
  const openVerModal = async (abastecimiento) => {
    try {
      const data = await getAbastecimiento(abastecimiento.id)
      console.log("Abastecimiento obtenido: ", data)
      setAbastecimientoSeleccionado(data)
      console.log("Abastecimiento seleccionado: ", abastecimientoSeleccionado)
      setVerModalOpen(true)
    } catch (error) {
      MySwal.fire({
        title: "Error al obtener el abastecimiento",
        text: error ? error : "No se pudo cargar el abastecimiento seleccionado.",
        icon: "error",
        confirmButtonColor: "#7e2952",
        customClass: {
          popup: "swal-rosado",
        },
      })
    }
  }
  const closeVerModal = () => {
    setAbastecimientoSeleccionado(null)
    setVerModalOpen(false)
  }

  //parte de eliminar abastecimiento
  const handleEliminarAbastecimiento = (abastecimiento) => {
    MySwal.fire({
      title: "Eliminar el abastecimiento",
      html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar el abastecimiento de la manicurista <strong>${abastecimiento.manicurista_nombre}</strong>?</p>`,
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
          await eliminarAbastecimiento(abastecimiento.id)
          MySwal.fire({
            title: "Abastecimiento eliminado",
            text: `El abastecimiento de la manicurista ${abastecimiento.manicurista_nombre} ha sido eliminado correctamente.`,
            icon: "success",
            confirmButtonColor: "#7e2952",
            customClass: {
              popup: "swal-rosado",
            },
          }).then(() => {
            fetchAbastecimientos()
          })
        } catch (error) {
          MySwal.fire({
            title: "Error al eliminar el abastecimiento",
            text: error ? error : "No se pudo eliminar el abastecimiento seleccionado.",
            icon: "error",
            confirmButtonColor: "#7e2952",
            customClass: {
              popup: "swal-rosado",
            },
          })
        }
      }
    })
  }

  //parte de reportar insumos
  const [isReportarModalOpen, setReportarModalOpen] = useState(false)
  const [insumosParaReporte, setInsumosParaReporte] = useState([])

  // Funciones del modal
  const openReportarModal = () => setReportarModalOpen(true)
  const closeReportarModal = () => {
    setReportarModalOpen(false)
    setInsumosParaReporte([])
    setErroresEstado({}) // Clear validation errors
  }

  //parte de buscar abastecimiento en la barra de busqueda
  const [busqueda, setBusqueda] = useState("")
  const handleBuscar = (e) => {
    const valorBusqueda = e.target.value.toLowerCase()
    setBusqueda(valorBusqueda)
    setPaginaActual(1)
  }
  const abastecimientosFiltrados = abastecimientos.filter((abastecimiento) =>
    Object.values(abastecimiento).some((valor) => String(valor).toLowerCase().includes(busqueda)),
  )

  //parte de la paginacion
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 3
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= Math.ceil(abastecimientosFiltrados.length / itemsPorPagina)) {
      setPaginaActual(nuevaPagina)
    }
  }
  const indexUltima = paginaActual * itemsPorPagina
  const indexPrimera = indexUltima - itemsPorPagina
  const abastecimientosActuales = abastecimientosFiltrados.slice(indexPrimera, indexUltima)
  const totalPaginas = Math.ceil(abastecimientosFiltrados.length / itemsPorPagina)

  const MySwal = withReactContent(Swal)

  const completarAbastecimiento = async (abastecimiento) => {
    if (abastecimiento.estado !== "Sin reportar") {
      console.warn('El abastecimiento no está en estado "Sin reportar"')
      return
    }

    try {
      const data = await getAbastecimiento(abastecimiento.id)
      setAbastecimientoSeleccionado(data)

      const insumosFormateados =
        data.insumos?.map((ins) => ({
          id: ins.id,
          nombre: ins.insumo_nombre,
          estado: ins.estado,
          comentario: ins.comentario || "",
        })) || []

      setInsumosParaReporte(insumosFormateados)
      setErroresEstado({})
      openReportarModal()
    } catch (error) {
      console.error("Error al obtener el detalle del abastecimiento:", error)
      MySwal.fire({
        title: "Error al obtener detalles",
        text: error.message || "No se pudo cargar el abastecimiento seleccionado.",
        icon: "error",
        confirmButtonColor: "#7e2952",
        customClass: {
          popup: "swal-rosado",
        },
      })
    }
  }

  const actualizarInsumo = (index, campo, valor) => {
    const nuevosInsumos = [...insumosParaReporte]
    nuevosInsumos[index][campo] = valor
    setInsumosParaReporte(nuevosInsumos)

    if (campo === "estado" && valor) {
      const nuevosErrores = { ...erroresEstado }
      delete nuevosErrores[index]
      setErroresEstado(nuevosErrores)
    }
  }

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

  const [showAbastecimientoDateInput, setShowAbastecimientoDateInput] = useState(false)
  const [abastecimientoDate, setAbastecimientoDate] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [insumoSeleccionado, setInsumoSeleccionado] = useState("")
  const [precioUnitario, setPrecioUnitario] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [insumosEnModal, setInsumosEnModal] = useState([])

  const agregarInsumoAlModal = () => {
    let hayError = false

    if (!insumoSeleccionado) {
      setErrorInsumoSeleccionado("Debes seleccionar un insumo")
      setTocoValidarInsumo(true)
      hayError = true
    } else {
      setErrorInsumoSeleccionado("")
    }

    if (!cantidad || cantidad < 1) {
      setErrorCantidad("Debes ingresar una cantidad válida")
      setTocoValidarCantidad(true)
      hayError = true
    } else {
      setErrorCantidad("")
    }

    if (hayError) {
      alert("Debes llenar correctamente los campos de insumo.")
      return
    }

    const nuevoInsumo = {
      nombre: insumoSeleccionado,
      precioUnitario,
      cantidad,
    }

    setInsumosEnModal([...insumosEnModal, nuevoInsumo])

    setInsumoSeleccionado("")
    setPrecioUnitario(0)
    setCantidad(1)
    setTocoValidarInsumo(false)
    setTocoValidarCantidad(false)
  }

  const guardarInsumosDelModal = () => {
    if (insumosEnModal.length === 0) {
      alert("Debes agregar al menos un insumo antes de guardar.")
      return
    }
    setInsumos([...insumos, ...insumosEnModal])
    setInsumosEnModal([])
    setShowModal(false)
  }

  const cancelarModal = () => {
    setShowModal(false)

    setInsumoSeleccionado("")
    setCantidad("")
    setPrecioUnitario(null)
    setInsumosEnModal([])

    setErrorInsumoSeleccionado("")
    setErrorCantidad("")
    setTocoValidarInsumo(false)
    setTocoValidarCantidad(false)
    setSugerenciasInsumo([])
  }

  const [pasoActual, setPasoActual] = useState(1)
  const [inputInsumoNombre, setInputInsumoNombre] = useState("")
  const [modoEdicionIndex, setModoEdicionIndex] = useState(null)

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

  return (
    <div className={`roles-container ${darkMode ? "dark" : ""}`}>
      <div className="fila-formulario">
        <h1 className="titulo">Gestión abastecimientos</h1>

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
        <button onClick={openCrearModal} className="crear-btn">
          Crear abastecimiento
        </button>

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
              const esEditable = abastecimiento.estado != "Reportado"

              return (
                <tr key={abastecimiento.id}>
                  <td>{abastecimiento.fecha_creacion}</td>
                  <td>{abastecimiento.manicurista_nombre}</td>
                  <td>{abastecimiento.fecha_reporte ? abastecimiento.fecha_reporte : "no reportado"}</td>
                  <td>
                    <span
                      className={`estado-texto ${abastecimiento.estado === "Reportado"
                        ? "estado-reportada"
                        : abastecimiento.estado === "Sin reportar"
                          ? "estado-sin-reportar"
                          : "estado-texto"
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
                    {abastecimiento.estado !== "Reportado" && (
                      <button
                        onClick={() => esEditable && completarAbastecimiento(abastecimiento)}
                        className={`acciones-btn ver-btn flex items-center justify-center p-2 rounded transition-all duration-200 ${!esEditable ? "opacity-50 cursor-not-allowed" : "hover:bg-green-50 hover:scale-105"
                          }`}
                        disabled={!esEditable}
                        title={!esEditable ? "No se puede completar el abastecimiento" : "Completar el abastecimiento"}
                        aria-label="Completar abastecimiento"
                      >
                        <AiOutlineCheck
                          size={18}
                          className={`text-green-500 transition-colors duration-200 ${esEditable ? "hover:text-green-700" : ""
                            }`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => esEditable && handleEliminarAbastecimiento(abastecimiento)}
                      className="acciones-btn eliminar-btn flex items-center justify-center p-2"
                      disabled={!esEditable}
                      title="Eliminar el abastecimiento"
                    >
                      <FiTrash2 size={18} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={7} className="text-center p-4">
                No se encontraron abastecimientos
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
            <div className="contenido-popup3">
              <h2 className="titulo-usuario">{pasoActual === 1 ? "Crear abastecimiento" : "Agregar insumos"}</h2>

              {pasoActual === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()

                    const errores = {}

                    if (!manicuristaSeleccionada) {
                      errores.manicurista = "Debes seleccionar la manicurista"
                    }
                    if (!abastecimientoDate) {
                      errores.fecha = "El campo de fecha es obligatorio"
                    }

                    if (Object.keys(errores).length > 0) {
                      setErrorManicurista(errores.manicurista || "")
                      setErrorFechaAbastecimiento(errores.fecha || "")

                      Swal.fire({
                        icon: "warning",
                        title: "Campos incompletos",
                        text: "Por favor completa todos los campos obligatorios antes de continuar.",
                        confirmButtonColor: "#d33",
                        confirmButtonText: "Entendido",
                      })

                      return
                    }

                    const abastecimientosSinReportar = abastecimientos.filter(
                      (abast) =>
                        abast.manicurista_id === Number.parseInt(manicuristaSeleccionada) &&
                        abast.estado === "Sin reportar",
                    )

                    if (abastecimientosSinReportar.length > 0) {
                      Swal.fire({
                        icon: "warning",
                        title: "Abastecimiento Pendiente",
                        html: `
                                                        <div style="text-align: left; padding: 10px;">
                                                            <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                                                                <strong>No se puede crear un nuevo abastecimiento:</strong>
                                                            </p>
                                                            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                                                <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                                                                    La manicurista seleccionada tiene un abastecimiento sin reportar. 
                                                                    Debe completar el reporte pendiente antes de crear uno nuevo.
                                                                </p>
                                                            </div>
                                                            <p style="color: #666; font-size: 13px; margin-top: 15px;">
                                                                💡 <em>Completa el abastecimiento pendiente y luego podrás crear uno nuevo.</em>
                                                            </p>
                                                        </div>
                                                    `,
                        confirmButtonText: "Entendido",
                        confirmButtonColor: "#7e2952",
                        customClass: { popup: "swal-rosado" },
                        width: "500px",
                      })
                      return
                    }

                    setPasoActual(2)
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Manicurista</label>
                        <select
                          id="seleccionarManicurista"
                          className="input-select w-full"
                          value={manicuristaSeleccionada}
                          onChange={(e) => {
                            setManicuristaSeleccionada(e.target.value)
                            setErrorManicurista("")
                          }}
                          onBlur={() => {
                            if (!manicuristaSeleccionada) {
                              setErrorManicurista("Debes seleccionar la manicurista")
                            }
                          }}
                        >
                          <option value="" disabled>
                            Seleccione una manicurista
                          </option>
                          {manicuristas.map((m) => (
                            <option key={m.usuario_id} value={m.usuario_id}>
                              {m.nombre} {m.apellido}
                            </option>
                          ))}
                        </select>
                        {errorManicurista && <p className="error-texto">{errorManicurista}</p>}
                      </div>

                      <div className="campo">
                        <div className="mb-4">
                          <label className="subtitulo-editar-todos">Fecha de abastecimiento</label>
                          {showAbastecimientoDateInput || abastecimientoDate ? (
                            <input
                              type="date"
                              id="fechaAbastecimiento"
                              name="fechaAbastecimiento"
                              className="input-fecha-activo-abastecimiento"
                              value={abastecimientoDate}
                              min={new Date().toISOString().split("T")[0]}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                setAbastecimientoDate(e.target.value)
                                setErrorFechaAbastecimiento("")
                              }}
                              onBlur={() => {
                                if (!abastecimientoDate) {
                                  setErrorFechaAbastecimiento("El campo de fecha es obligatorio")
                                }
                                setShowAbastecimientoDateInput(false)
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => setShowAbastecimientoDateInput(true)}
                              className="input-fecha-placeholder-abastecimiento"
                            >
                              Fecha de abastecimiento *
                            </div>
                          )}
                          {errorFechaAbastecimiento && <p className="error-texto">{errorFechaAbastecimiento}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="button-container">
                    <button type="button" className="btn-cancelar" onClick={closeCrearModal}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-crear">
                      Continuar
                    </button>
                  </div>
                </form>
              )}

              {pasoActual === 2 && (
                <>
                  <div className="modal-form-row">
                    <div className="campo">
                      <label className="subtitulo-editar-todos">Insumo:</label>
                      <input
                        type="text"
                        name="buscarInsumo"
                        className="input-texto modal-input"
                        placeholder="Buscar insumo..."
                        value={insumoSeleccionado}
                        onChange={(e) => {
                          const texto = e.target.value
                          setInsumoSeleccionado(texto)

                          const resultados = insumosDisponibles.filter((ins) =>
                            ins.nombre.toLowerCase().includes(texto.toLowerCase()),
                          )
                          setSugerenciasInsumo(resultados)
                          setErrorInsumoSeleccionado("")
                        }}
                        onBlur={() => {
                          setTocoValidarInsumo(true)
                          if (!insumoSeleccionado) {
                            setErrorInsumoSeleccionado("Debes seleccionar un insumo")
                          }
                          setTimeout(() => setSugerenciasInsumo([]), 100)
                        }}
                      />

                      {sugerenciasInsumo.length > 0 && (
                        <ul className="resultado-lista">
                          {sugerenciasInsumo.map((ins, index) => (
                            <li
                              key={index}
                              className="resultado-item cursor-pointer"
                              onClick={() => {
                                setInsumoSeleccionado(ins.nombre)
                                setErrorInsumoSeleccionado("")
                                setSugerenciasInsumo([])
                              }}
                            >
                              {ins.nombre} - stock: {ins.stock}
                            </li>
                          ))}
                        </ul>
                      )}

                      {errorInsumoSeleccionado && tocoValidarInsumo && (
                        <p className="error-texto">{errorInsumoSeleccionado}</p>
                      )}
                    </div>

                    <div className="campo">
                      <label className="subtitulo-editar-todos">Cantidad:</label>
                      <input
                        type="number"
                        name="cantidad-insumo"
                        className="input-texto modal-input"
                        value={cantidad}
                        placeholder="Cantidad"
                        onChange={(e) => {
                          const valor = Number.parseInt(e.target.value)
                          setCantidad(valor)
                          if (valor >= 1) {
                            setErrorCantidad("")
                          }
                        }}
                        onBlur={() => {
                          setTocoValidarCantidad(true)
                          if (!cantidad || cantidad < 1) {
                            setErrorCantidad("Debes ingresar una cantidad válida")
                          }
                        }}
                      />
                      {errorCantidad && tocoValidarCantidad && <p className="error-texto">{errorCantidad}</p>}
                    </div>
                  </div>

                  <div className="modal-botones">
                    <button
                      onClick={() => {
                        const insumo = insumosDisponibles.find((ins) => ins.nombre === insumoSeleccionado)
                        if (!insumo) {
                          setErrorInsumoSeleccionado("Debes seleccionar un insumo válido")
                          return
                        }
                        if (!cantidad || cantidad < 1) {
                          setErrorCantidad("Debes ingresar una cantidad válida")
                          return
                        }

                        const nuevoInsumo = {
                          nombre: insumo.nombre,
                          cantidad: cantidad,
                          precioUnitario: insumo.precioUnitario,
                        }

                        if (indiceEditando !== null) {
                          const nuevos = [...insumosEnModal]
                          nuevos[indiceEditando] = nuevoInsumo
                          setInsumosEnModal(nuevos)
                          setIndiceEditando(null)
                        } else {
                          setInsumosEnModal([...insumosEnModal, nuevoInsumo])
                        }

                        setInsumoSeleccionado("")
                        setCantidad("")
                        setTocoValidarCantidad(false)
                        setTocoValidarInsumo(false)
                      }}
                      className="btn-agregar"
                    >
                      {indiceEditando !== null ? "Guardar cambios" : "Agregar insumo"}
                    </button>
                  </div>

                  <div className="insumos-agregados-modal">
                    <h4>Insumos agregados:</h4>
                    {insumosEnModal.length === 0 ? (
                      <p>No has agregado insumos aún.</p>
                    ) : (
                      <div className="grid-insumos-modal">
                        {insumosEnModal.map((ins, index) => (
                          <div key={index} className="insumo-item-modal">
                            {ins.nombre} x {ins.cantidad}
                            <div className="insumo-item-actions">
                              <button
                                className="btn-editar-insumo-agregar"
                                onClick={() => {
                                  setInsumoSeleccionado(ins.nombre)
                                  setCantidad(ins.cantidad)
                                  setIndiceEditando(index)
                                }}
                              >
                                ✎
                              </button>
                              <button
                                className="btn-eliminar-insumo-agregar"
                                onClick={() => {
                                  const nuevos = insumosEnModal.filter((_, i) => i !== index)
                                  setInsumosEnModal(nuevos)
                                  if (indiceEditando === index) {
                                    setIndiceEditando(null)
                                    setInsumoSeleccionado("")
                                    setCantidad("")
                                  }
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="button-container">
                    <button type="button" className="btn-cancelar" onClick={() => setPasoActual(1)}>
                      Volver
                    </button>
                    <button
                      type="button"
                      className="btn-crear"
                      disabled={loadingCrear}
                      onClick={() => {
                        if (insumosEnModal.length === 0) {
                          setErrorInsumos("Debes agregar al menos un insumo")
                          return
                        }

                        setInsumos([...insumosEnModal])

                        handleCrearAbastecimiento()
                      }}
                    >
                      {loadingCrear ? "Creando abastecimiento..." : "Crear abastecimiento"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                    <label className="subtitulo-editar-todos">Estado:</label>
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
                      <input type="text" className="input-select" readOnly value="Sin reportar" />
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

              {/* Header with warning message */}
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  padding: "12px",
                  margin: "15px 0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#856404",
                    fontSize: "14px",
                    margin: "0",
                    fontWeight: "bold",
                  }}
                >
                  ⚠️ Debe seleccionar el estado para TODOS los insumos antes de completar
                </p>
              </div>

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
                    <label className="subtitulo-editar-todos">Estado:</label>
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
                        <th>Estado *</th>
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
                  <button type="button" className="btn-cancelar" onClick={closeReportarModal}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-crear"
                    disabled={loadingCompletar}
                    onClick={handleCompletarAbastecimiento}
                    style={{
                      cursor: loadingCompletar ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingCompletar ? "Completando..." : "Completar abastecimiento"}
                  </button>
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

export default GestionAbastecimientosRec
