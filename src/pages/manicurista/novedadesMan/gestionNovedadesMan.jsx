import { useState, useEffect } from "react"
import { FiEdit, FiTrash2 } from "react-icons/fi"
import { AiOutlineEye } from "react-icons/ai"
import { Link } from "react-router-dom"
import { Bell, User, X } from "lucide-react"
import "../../../css/gestionar.css"
import "../../../css/horarios.css"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { listar_novedades, crear_novedad, actualizar_novedad } from "../../../services/novedades_service"
import { useTheme } from "../../tema/ThemeContext"

const GestionNovedadesMan = () => {
  const [loading, setLoading] = useState(true)
  const [showHireDateInput, setShowHireDateInput] = useState(false)
  const [hireDate, setHireDate] = useState("")
  const MySwal = withReactContent(Swal)
  const [novedadSeleccionado, setNovedadSeleccionado] = useState({
    manicurista: "",
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    motivo: "",
  })
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [modoVer, setModoVer] = useState(false)
  const [showHoraEntradaInput, setShowHoraEntradaInput] = useState(false)
  const [showHoraSalidaInput, setShowHoraSalidaInput] = useState(false)
  const [novedades, setNovedades] = useState([])
  const [manicuristas, setManicuristas] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const novedadPorPagina = 4
  const [loadingCrear, setLoadingCrear] = useState(false)
  const [loadingActualizar, setLoadingActualizar] = useState(false)

  const novedadesFiltrados = novedades.filter((p) =>
    Object.values(p).some((valor) => String(valor).toLowerCase().includes(busqueda)),
  )
  const [isCrearModalOpen, setCrearModalOpen] = useState(false)
  const totalPaginasRaw = Math.ceil(novedadesFiltrados.length / novedadPorPagina)
  const totalPaginas = totalPaginasRaw > 0 ? totalPaginasRaw : 1
  const indiceInicio = (paginaActual - 1) * novedadPorPagina
  const indiceFin = indiceInicio + novedadPorPagina
  const novedadesActuales = novedadesFiltrados.slice(indiceInicio, indiceFin)

  const [formData, setFormData] = useState({
    manicurista: "",
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    motivo: "",
  })
  const [nuevoNovedad, setNuevoNovedad] = useState({
    manicurista: "",
    manicurista_id: "",
    fecha: "",
    horaEntrada: "",
    horaSalida: "",
    motivo: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoNovedad({ ...nuevoNovedad, [name]: value })
  }
  const [errores, setErrores] = useState({})

  useEffect(() => {
    const fetchNovedades = async () => {
      try {
        const data = await listar_novedades()
        const userId = localStorage.getItem("user_id")

        // Filtrar solo las novedades de la manicurista logueada
        const novedadesFiltradas = data?.filter((novedad) => novedad.manicurista_id === Number.parseInt(userId))

        setNovedades(novedadesFiltradas || [])
      } catch (err) {
        console.error("Error al cargar novedades:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchNovedades()
  }, [])

  const validarCampo = (name, value) => {
    let error = ""

    if (!value.trim()) {
      switch (name) {
        case "manicurista":
          error = "El nombre de la manicurista es obligatorio"
          break
        case "fecha":
          error = "La fecha es obligatoria"
          break
        case "horaEntrada":
          error = "La hora de entrada es obligatoria"
          break
        case "horaSalida":
          error = "La hora de salida es obligatoria"
          break
        case "motivo":
          error = "El motivo es obligatorio"
          break
        default:
          error = "Campo obligatorio"
      }
    }

    setErrores((prev) => ({ ...prev, [name]: error }))
  }

  const validarCamposNovedad = (novedad) => {
    const errores = {}

    if (!novedad.manicurista?.trim()) {
      errores.manicurista = "El nombre de la manicurista es obligatorio"
    }

    if (!novedad.fecha?.trim()) {
      errores.fecha = "La fecha es obligatoria"
    }

    if (!novedad.motivo?.trim()) {
      errores.motivo = "El motivo es obligatorio"
    }

    if (!novedad.horaEntrada?.trim()) {
      errores.horaEntrada = "La hora de entrada es obligatoria"
    } else {
      const hora = Number.parseInt(novedad.horaEntrada.split(":")[0])
      if (hora < 8) {
        errores.horaEntrada = "La hora de entrada debe ser desde las 8:00 AM"
      }
    }

    if (!novedad.horaSalida?.trim()) {
      errores.horaSalida = "La hora de salida es obligatoria"
    } else {
      const hora = Number.parseInt(novedad.horaSalida.split(":")[0])
      if (hora > 18) {
        errores.horaSalida = "La hora de salida debe ser hasta las 6:00 PM"
      }
    }

    return errores
  }

  const handleCrearNovedad = async (e) => {
    e.preventDefault()
    setLoadingCrear(true)

    const novedadCompleta = {
      manicurista: `${localStorage.getItem("nombre")} ${localStorage.getItem("apellido")}`,
      fecha: formData.fecha,
      motivo: formData.motivo,
      horaEntrada: novedadSeleccionado.horaEntrada,
      horaSalida: novedadSeleccionado.horaSalida,
    }

    const erroresValidacion = validarCamposNovedad(novedadCompleta)

    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      setLoadingCrear(false)
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    const datos = {
      ...novedadCompleta,
      Fecha: formData.fecha,
      Motivo: formData.motivo,
      manicurista_id: Number.parseInt(localStorage.getItem("user_id")),
      HoraEntrada: novedadSeleccionado.horaEntrada,
      HoraSalida: novedadSeleccionado.horaSalida,
    }

    // Función para limpiar y mejorar mensajes de error
    const mejorarMensajeError = (mensaje) => {
      const mapeoMensajes = {
        "This field is required.": "Este campo es obligatorio.",
        "This field may not be blank.": "Este campo no puede estar vacío.",
        "Enter a valid date.": "Ingresa una fecha válida.",
        "Enter a valid time.": "Ingresa una hora válida.",
        "Ensure this field has no more than": "Este campo no puede tener más de",
        "characters.": "caracteres.",
      }

      let mensajeMejorado = mensaje

      Object.keys(mapeoMensajes).forEach((clave) => {
        if (mensajeMejorado.includes(clave)) {
          mensajeMejorado = mensajeMejorado.replace(clave, mapeoMensajes[clave])
        }
      })

      return mensajeMejorado
    }

    // Función para formatear errores de campos específicos
    const formatearErroresCampos = (errores) => {
      const camposAmigables = {
        manicurista_id: "Manicurista",
        Fecha: "Fecha",
        HoraEntrada: "Hora de entrada",
        HoraSalida: "Hora de salida",
        Motivo: "Motivo",
      }

      const mensajesFormateados = []

      Object.keys(errores).forEach((campo) => {
        const nombreCampo = camposAmigables[campo] || campo
        const erroresCampo = errores[campo]

        if (Array.isArray(erroresCampo)) {
          erroresCampo.forEach((error) => {
            mensajesFormateados.push(`<strong>${nombreCampo}:</strong> ${mejorarMensajeError(error)}`)
          })
        } else if (typeof erroresCampo === "string") {
          mensajesFormateados.push(`<strong>${nombreCampo}:</strong> ${mejorarMensajeError(erroresCampo)}`)
        }
      })

      return mensajesFormateados
    }

    try {
      const respuesta = await crear_novedad(datos)

      if (respuesta && respuesta.errores) {
        setErrores(respuesta.errores)
        setLoadingCrear(false)

        // Manejar errores generales (conflictos de horarios)
        if (respuesta.errores.general && Array.isArray(respuesta.errores.general)) {
          const errorGeneral = respuesta.errores.general[0]

          if (
            errorGeneral.includes("se solapa") ||
            errorGeneral.includes("engloba") ||
            errorGeneral.includes("ya existe una novedad") ||
            errorGeneral.includes("cubre este horario")
          ) {
            Swal.fire({
              icon: "warning",
              title: "⚠️ Conflicto de Horarios",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                                    <strong>No se puede crear la novedad:</strong>
                                </p>
                                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                    <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                                        ${errorGeneral}
                                    </p>
                                </div>
                                <p style="color: #666; font-size: 13px; margin-top: 15px;">
                                    💡 <em>Revisa tus horarios existentes y selecciona un rango de tiempo disponible.</em>
                                </p>
                            </div>
                        `,
              confirmButtonText: "Entendido",
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
              width: "500px",
            })
          } else {
            Swal.fire({
              icon: "error",
              title: "Error de Validación",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 14px; line-height: 1.5;">
                                    ${mejorarMensajeError(errorGeneral)}
                                </p>
                            </div>
                        `,
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
            })
          }
        }
        // Manejar errores non_field_errors de Django
        else if (respuesta.errores.non_field_errors && Array.isArray(respuesta.errores.non_field_errors)) {
          const errorGeneral = respuesta.errores.non_field_errors[0]

          if (
            errorGeneral.includes("se solapa") ||
            errorGeneral.includes("engloba") ||
            errorGeneral.includes("ya existe una novedad") ||
            errorGeneral.includes("cubre este horario")
          ) {
            Swal.fire({
              icon: "warning",
              title: "⚠️ Conflicto de Horarios",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                                    <strong>No se puede crear la novedad:</strong>
                                </p>
                                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                    <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                                        ${errorGeneral}
                                    </p>
                                </div>
                                <p style="color: #666; font-size: 13px; margin-top: 15px;">
                                    💡 <em>Revisa tus horarios existentes y selecciona un rango de tiempo disponible.</em>
                                </p>
                            </div>
                        `,
              confirmButtonText: "Entendido",
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
              width: "500px",
            })
          } else {
            Swal.fire({
              icon: "error",
              title: "Error de Validación",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 14px; line-height: 1.5;">
                                    ${mejorarMensajeError(errorGeneral)}
                                </p>
                            </div>
                        `,
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
            })
          }
        }
        // Manejar errores de campos específicos
        else {
          const mensajesFormateados = formatearErroresCampos(respuesta.errores)

          if (mensajesFormateados.length > 0) {
            Swal.fire({
              icon: "error",
              title: "📝 Errores en el Formulario",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                                    Por favor corrige los siguientes errores:
                                </p>
                                <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px;">
                                    ${mensajesFormateados
                  .map(
                    (msg) => `
                                        <div style="margin-bottom: 8px; color: #721c24; font-size: 14px;">
                                            • ${msg}
                                        </div>
                                    `,
                  )
                  .join("")}
                                </div>
                            </div>
                        `,
              confirmButtonText: "Corregir",
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
              width: "500px",
            })
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error inesperado, intentanlo de nuevo.",
              customClass: { popup: "swal-rosado" },
            })
          }
        }
        return
      }

      // Si la creación fue exitosa
      if (respuesta && !respuesta.errores) {
        setNovedades((prev) => [...prev, respuesta])

        // Limpiar formulario
        setFormData({
          fecha: "",
          horaEntrada: "",
          horaSalida: "",
          motivo: "",
        })
        setNovedadSeleccionado({
          fecha: "",
          horaEntrada: "",
          horaSalida: "",
          motivo: "",
        })
        setErrores({})
        closeCrearModal()

        Swal.fire({
          icon: "success",
          title: "Novedad creada",
          text: "La novedad fue registrada exitosamente.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-rosado" },
        })
      }
    } catch (error) {
      console.error("Error al crear novedad:", error)

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la novedad.",
        customClass: { popup: "swal-rosado" },
      })
    } finally {
      setLoadingCrear(false)
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

  const openCrearModal = () => setCrearModalOpen(true)
  const closeCrearModal = () => {
    setCrearModalOpen(false)
    setLoadingCrear(false)
    setErrores({})
  }

  const handleEditarNovedad = async (e) => {
    e.preventDefault()
    setLoadingActualizar(true)

    const erroresEditarTemp = {}
    if (!nuevoNovedad.Motivo?.trim()) {
      erroresEditarTemp["motivo"] = "El motivo es obligatorio"
    }
    if (!nuevoNovedad.Fecha?.trim()) {
      erroresEditarTemp["fecha"] = "La fecha es obligatoria"
    }
    if (!nuevoNovedad.HoraEntrada?.trim()) {
      erroresEditarTemp["horaEntrada"] = "La hora de entrada es obligatoria"
    }
    if (!nuevoNovedad.HoraSalida?.trim()) {
      erroresEditarTemp["horaSalida"] = "La hora de salida es obligatoria"
    }

    if (Object.keys(erroresEditarTemp).length > 0) {
      setErrores(erroresEditarTemp)
      setLoadingActualizar(false)
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "Por favor completa todos los campos requeridos.",
        customClass: { popup: "swal-rosado" },
      })
      return
    }

    try {
      const respuesta = await actualizar_novedad(novedadSeleccionado.id, nuevoNovedad)

      if (respuesta?.errores) {
        setErrores(respuesta.errores)
        setLoadingActualizar(false)

        // Manejar errores de solapamiento en edición
        if (respuesta.errores.general && Array.isArray(respuesta.errores.general)) {
          const errorGeneral = respuesta.errores.general[0]

          if (
            errorGeneral.includes("se solapa") ||
            errorGeneral.includes("engloba") ||
            errorGeneral.includes("ya existe una novedad") ||
            errorGeneral.includes("cubre este horario")
          ) {
            Swal.fire({
              icon: "warning",
              title: "⚠️ Conflicto de Horarios",
              html: `
                            <div style="text-align: left; padding: 10px;">
                                <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
                                    <strong>No se puede actualizar la novedad:</strong>
                                </p>
                                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                    <p style="color: #856404; font-size: 14px; line-height: 1.5; margin: 0;">
                                        ${errorGeneral}
                                    </p>
                                </div>
                                <p style="color: #666; font-size: 13px; margin-top: 15px;">
                                    💡 <em>Revisa tus horarios existentes y selecciona un rango de tiempo disponible.</em>
                                </p>
                            </div>
                        `,
              confirmButtonText: "Entendido",
              confirmButtonColor: "#7e2952",
              customClass: { popup: "swal-rosado" },
              width: "500px",
            })
          } else {
            Swal.fire({
              icon: "error",
              title: "Error de validación",
              text: errorGeneral,
              customClass: { popup: "swal-rosado" },
            })
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo actualizar la novedad. Revisa los campos.",
            customClass: { popup: "swal-rosado" },
          })
        }
        return
      }

      if (respuesta) {
        setNovedades((prev) => prev.map((prov) => (prov.id === novedadSeleccionado.id ? respuesta : prov)))
        setMostrarModalEditar(false)
        setNovedadSeleccionado({
          manicurista: "",
          manicurista_id: "",
          fecha: "",
          horaEntrada: "",
          horaSalida: "",
          motivo: "",
        })
        setLoadingActualizar(false)
        Swal.fire({
          icon: "success",
          title: "Novedad actualizada",
          text: "Los datos de la novedad fueron actualizados correctamente.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-rosado" },
        })
        setNuevoNovedad({
          manicurista: "",
          manicurista_id: "",
          fecha: "",
          horaEntrada: "",
          horaSalida: "",
          motivo: "",
        })
        setErrores({})
      }
    } catch (error) {
      console.error("Error al actualizar novedad:", error)
      Swal.fire({
        icon: "error",
        title: "Error del servidor",
        text: "No se pudo conectar con el servidor. Intenta nuevamente.",
        customClass: { popup: "swal-rosado" },
      })
      setLoadingActualizar(false)
    }
  }

  const closeEditarModal = () => {
    setMostrarModalEditar(false)
    setNovedadSeleccionado({
      manicurista: "",
      fecha: "",
      horaEntrada: "",
      horaSalida: "",
      motivo: "",
    })
  }

  const handleEliminarNovedad = async (novedad, onSuccess) => {
    const result = await MySwal.fire({
      title: `Eliminar novedad`,
      html: `<p class="texto-blanco">¿Estás seguro de que deseas eliminar esta novedad del <strong>${novedad.Fecha}</strong>?</p>`,
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

    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/manicurista/novedades/${novedad.id}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          await MySwal.fire({
            icon: "success",
            title: "Novedad eliminada",
            text: "La novedad fue eliminada correctamente.",
            confirmButtonColor: "#7e2952",
            customClass: { popup: "swal-rosado" },
          })
          if (onSuccess) onSuccess()
        } else {
          throw new Error("No se pudo eliminar la novedad")
        }
      } catch (error) {
        console.error("Error al eliminar novedad:", error)
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo eliminar la novedad. Intenta nuevamente.",
          confirmButtonColor: "#7e2952",
          customClass: { popup: "swal-rosado" },
        })
      }
    }
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina)
    }
  }

  const { darkMode } = useTheme()

  return (
    <div className={`roles-container ${darkMode ? "dark" : ""}`}>
      <div className="fila-formulario">
        <h1 className="titulo">Gestión de novedades</h1>
        <div className="iconos-perfil">
          <Link to="/manicurista/dashboard/perfil">
            <span title="Tu perfil">
              <User className="icon" />
            </span>
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={openCrearModal} className="crear-btn mt-4">
          Crear novedad
        </button>

        <input
          type="text"
          placeholder="Buscar novedades..."
          className="busqueda-input"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="overflow-hidden">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Manicurista</th>
              <th>Fecha</th>
              <th>Hora Entrada</th>
              <th>Hora Salida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {novedadesActuales.length > 0 ? (
              novedadesActuales.map((novedad) => (
                <tr key={novedad.id}>
                  <td>{novedad.manicurista_nombre}</td>
                  <td>{novedad.Fecha}</td>
                  <td>
                    {new Date(`1970-01-01T${novedad.HoraEntrada}`).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td>
                    {new Date(`1970-01-01T${novedad.HoraSalida}`).toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="text-center space-x-2">
                    <button
                      onClick={() => {
                        setNovedadSeleccionado(novedad)
                        setNuevoNovedad(novedad)
                        setModoVer(true)
                        setMostrarModalEditar(true)
                      }}
                      className="acciones-btn ver-btn"
                      title="Ver detalles de la novedad"
                    >
                      <AiOutlineEye size={18} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() => {
                        setNovedadSeleccionado(novedad)
                        setNuevoNovedad(novedad)
                        setModoVer(false)
                        setMostrarModalEditar(true)
                      }}
                      className="acciones-btn editar-btn"
                      title="Editar novedad"
                    >
                      <FiEdit size={16} className="text-pink-500 hover:text-pink-700" />
                    </button>
                    <button
                      onClick={() =>
                        handleEliminarNovedad(novedad, () => {
                          setNovedades((prev) => prev.filter((n) => n.id !== novedad.id))
                        })
                      }
                      className="acciones-btn eliminar-btn"
                      title="Eliminar novedad"
                    >
                      <FiTrash2 size={16} className="text-red-500 hover:text-red-700" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No se encontró esta novedad registrada
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

        {/* Modal Crear Novedad */}
        {isCrearModalOpen && (
          <div className="overlay-popup" onClick={closeCrearModal}>
            <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="contenido-popup2">
                <h2 className="text-xl font-semibold mb-4">Crear novedad</h2>
                <form onSubmit={handleCrearNovedad} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Manicurista:</label>
                        <input
                          type="text"
                          className="input-select bg-gray-100 cursor-not-allowed"
                          value={`${localStorage.getItem("nombre")} ${localStorage.getItem("apellido")}`}
                          readOnly
                          disabled
                        />
                        {errores.manicurista && <p className="error-texto">{errores.manicurista}</p>}
                      </div>
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Fecha de ingreso:</label>
                        {showHireDateInput || hireDate || errores.fecha ? (
                          <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            className={`input-texto ${errores.fecha ? "input-error" : ""}`}
                            value={formData.fecha}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={new Date().toISOString().split("T")[0]}
                            max={`${new Date().getFullYear()}-12-31`}
                          />
                        ) : (
                          <div onClick={() => setShowHireDateInput(true)} className="input-fecha-placeholder">
                            Fecha de ingreso *
                          </div>
                        )}
                        {errores.fecha && <p className="error-texto">{errores.fecha}</p>}
                      </div>
                    </div>

                    <div className="fila-formulario">
                      <div className="mb-4 campo">
                        <label className="subtitulo-editar-todos">Hora de entrada:</label>
                        {showHoraEntradaInput || novedadSeleccionado.horaEntrada ? (
                          <input
                            type="time"
                            name="horaEntrada"
                            id="horaEntrada"
                            className="input-fecha-activo-horario"
                            value={novedadSeleccionado.horaEntrada}
                            onChange={(e) => {
                              const value = e.target.value
                              setNovedadSeleccionado({ ...novedadSeleccionado, horaEntrada: value })
                              setErrores((prev) => ({
                                ...prev,
                                horaEntrada:
                                  value < "08:00" || value > "18:00" ? "Hora fuera de rango (8:00 - 6:00)" : "",
                              }))
                            }}
                            onBlur={() => {
                              const hora = novedadSeleccionado.horaEntrada.trim()
                              setErrores((prev) => ({
                                ...prev,
                                horaEntrada: !hora
                                  ? "Este campo es obligatorio"
                                  : hora < "08:00" || hora > "18:00"
                                    ? "Hora fuera de rango (8:00 - 6:00)"
                                    : "",
                              }))
                              setShowHoraEntradaInput(hora !== "")
                            }}
                            min="08:00"
                            max="18:00"
                          />
                        ) : (
                          <div
                            className="input-fecha-placeholder-horario"
                            onClick={() => setShowHoraEntradaInput(true)}
                          >
                            Hora de entrada *
                          </div>
                        )}
                        {errores.horaEntrada && <p className="error-texto">{errores.horaEntrada}</p>}
                      </div>

                      <div className="mb-4 campo">
                        <label className="subtitulo-editar-todos">Hora de salida:</label>
                        {showHoraSalidaInput || novedadSeleccionado.horaSalida ? (
                          <input
                            type="time"
                            name="horaSalida"
                            id="horaSalida"
                            className="input-fecha-activo-horario"
                            value={novedadSeleccionado.horaSalida}
                            onChange={(e) => {
                              const value = e.target.value
                              setNovedadSeleccionado({ ...novedadSeleccionado, horaSalida: value })
                              setErrores((prev) => ({
                                ...prev,
                                horaSalida:
                                  value < "08:00" || value > "18:00" ? "Hora fuera de rango (8:00 - 6:00)" : "",
                              }))
                            }}
                            onBlur={() => {
                              const hora = novedadSeleccionado.horaSalida.trim()
                              setErrores((prev) => ({
                                ...prev,
                                horaSalida: !hora
                                  ? "Este campo es obligatorio"
                                  : hora < "08:00" || hora > "18:00"
                                    ? "Hora fuera de rango (8:00 - 6:00)"
                                    : "",
                              }))
                              setShowHoraSalidaInput(hora !== "")
                            }}
                            min="08:00"
                            max="18:00"
                          />
                        ) : (
                          <div className="input-fecha-placeholder-horario" onClick={() => setShowHoraSalidaInput(true)}>
                            Hora de salida *
                          </div>
                        )}
                        {errores.horaSalida && <p className="error-texto">{errores.horaSalida}</p>}
                      </div>
                    </div>

                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Motivo:</label>
                        <input
                          type="text"
                          name="motivo"
                          className="input-texto"
                          placeholder="Motivo *"
                          value={formData.motivo}
                          onBlur={handleBlur}
                          maxLength={50}
                          onChange={(e) => {
                            if (e.target.value.length <= 50) {
                              handleChange(e)
                            }
                          }}
                        />
                        {errores.motivo && <p className="error-texto">{errores.motivo}</p>}
                        {formData.motivo.length === 50 && (
                          <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                            Has alcanzado el máximo de 50 caracteres.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="button-container">
                      <button
                        type="button"
                        className="btn-cancelar"
                        onClick={() => {
                          setFormData({
                            manicurista: "",
                            fecha: "",
                            horaEntrada: "",
                            horaSalida: "",
                            motivo: "",
                          })
                          setErrores({})
                          setNovedadSeleccionado({
                            manicurista: "",
                            fecha: "",
                            horaEntrada: "",
                            horaSalida: "",
                            motivo: "",
                          })
                          closeCrearModal()
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-crear" disabled={loadingCrear}>
                        {loadingCrear ? "Creando novedad..." : "Crear novedad"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar/Ver Novedad */}
        {(mostrarModalEditar || modoVer) && novedadSeleccionado && (
          <div
            className="overlay-popup"
            onClick={() => {
              setMostrarModalEditar(false)
              setModoVer(false)
            }}
          >
            <div className="ventana-popup max-h-[300vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="contenido-popup2">
                <h2 className="text-xl font-semibold mb-4">{modoVer ? "Detalles de la novedad" : "Editar novedad"}</h2>
                <form onSubmit={(e) => handleEditarNovedad(e)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Manicurista:</label>
                        <div className="campo">
                          <input
                            type="text"
                            className="input-select bg-gray-100 cursor-not-allowed"
                            value={`${localStorage.getItem("nombre")} ${localStorage.getItem("apellido")}`}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Fecha de ingreso:</label>
                        <input
                          type="date"
                          id="Fecha"
                          name="Fecha"
                          className={`input-texto ${errores.fecha ? "input-error" : ""}`}
                          value={nuevoNovedad.Fecha}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          readOnly={modoVer}
                          min={new Date().toISOString().split("T")[0]}
                          max={`${new Date().getFullYear()}-12-31`}
                        />
                        {errores.fecha && <p className="error-texto">{errores.fecha}</p>}
                      </div>
                    </div>

                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Hora de entrada:</label>
                        <input
                          type="time"
                          name="HoraEntrada"
                          id="HoraEntrada"
                          className="input-fecha-activo-horario"
                          value={nuevoNovedad.HoraEntrada}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const value = e.target.value
                            if (value && (value < "08:00" || value > "18:00")) {
                              setErrores((prev) => ({ ...prev, HoraEntrada: "Hora fuera de rango (08:00 - 6:00)" }))
                            } else {
                              setErrores((prev) => ({ ...prev, HoraEntrada: "" }))
                            }
                            handleBlur(e)
                          }}
                          min="08:00"
                          max="18:00"
                          readOnly={modoVer}
                        />
                      </div>
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Hora de salida:</label>
                        <input
                          type="time"
                          name="HoraSalida"
                          id="HoraSalida"
                          className="input-fecha-activo-horario"
                          value={nuevoNovedad.HoraSalida}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const value = e.target.value
                            if (value && (value < "08:00" || value > "18:00")) {
                              setErrores((prev) => ({ ...prev, HoraSalida: "Hora fuera de rango (08:00 - 6:00)" }))
                            } else {
                              setErrores((prev) => ({ ...prev, HoraSalida: "" }))
                            }
                            handleBlur(e)
                          }}
                          min="08:00"
                          max="18:00"
                          readOnly={modoVer}
                        />
                      </div>
                    </div>
                    <div className="fila-formulario">
                      <div className="campo">
                        <label className="subtitulo-editar-todos">Motivo:</label>
                        <input
                          type="text"
                          name="Motivo"
                          className="input-texto"
                          placeholder="Motivo *"
                          value={nuevoNovedad.Motivo}
                          onBlur={handleBlur}
                          maxLength={80}
                          readOnly={modoVer}
                          onChange={(e) => {
                            if (e.target.value.length <= 80) {
                              handleInputChange(e)
                            }
                          }}
                        />
                        {errores.motivo && <p className="error-texto">{errores.motivo}</p>}
                        {nuevoNovedad.Motivo && nuevoNovedad.Motivo.length === 80 && (
                          <p className="error-texto absolute left-0 top-1/2 -translate-y-1/2 text-left text-red-600">
                            Has alcanzado el máximo de 80 caracteres.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="button-container">
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={() => {
                        setMostrarModalEditar(false)
                        setModoVer(false)
                        setErrores({})
                      }}
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
      </div>
    </div>
  )
}

export default GestionNovedadesMan
