import { useState, useEffect } from "react"
import "../../../css/citas.css"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../../../css/crearcita.css"
import { useSearchParams } from "react-router-dom"

const CrearCita = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const servicioIdFromUrl = searchParams.get("servicio")
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [paso, setPaso] = useState(1)
  const [manicuristaSeleccionada, setManicuristaSeleccionada] = useState(null)
  const [fechaReserva, setFechaReserva] = useState(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [servicios, setServicios] = useState({})
  const [manicuristas, setManicuristas] = useState([])
  const [horasDisponibles, setHorasDisponibles] = useState([])
  const [manicuristasDisponibles, setManicuristasDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHoras, setLoadingHoras] = useState(false)
  const [confirmandoCita, setConfirmandoCita] = useState(false)

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
        if (response.ok) {
          const data = await response.json()
          const serviciosActivos = data.filter((servicio) => servicio.estado === "Activo")

          const grouped = serviciosActivos.reduce((acc, servicio) => {
            if (!acc[servicio.tipo]) {
              acc[servicio.tipo] = []
            }
            acc[servicio.tipo].push(servicio)
            return acc
          }, {})

          setServicios(grouped)

          if (servicioIdFromUrl) {
            const servicioToSelect = serviciosActivos.find((s) => s.id.toString() === servicioIdFromUrl)
            if (servicioToSelect) {
              setServiciosSeleccionados([servicioToSelect])
              const categoriaIndex = Object.keys(grouped).findIndex((categoria) =>
                grouped[categoria].some((s) => s.id.toString() === servicioIdFromUrl),
              )
              if (categoriaIndex !== -1) {
                setCategoriaActiva(categoriaIndex)
              }
            }
          }
        } else {
          const errorMsg = `Error al cargar los servicios: ${response.statusText}`
          console.error(errorMsg)
          Swal.fire("Error", errorMsg, "error")
        }
      } catch (error) {
        console.error("Error fetching servicios:", error)
        Swal.fire("Error", "Error al cargar los servicios", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchServicios()
  }, [servicioIdFromUrl])

  useEffect(() => {
    const fetchManicuristas = async () => {
      try {
        const response = await fetch("https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas/activos/")
        if (response.ok) {
          const data = await response.json()
          const manicuristasActivas = data.filter((manicurista) => manicurista.estado === "Activo")
          setManicuristas(manicuristasActivas)
        } else {
          console.error("Error fetching manicuristas:", response.statusText)
          Swal.fire({
            title: "😔 Error de conexión",
            html: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 60px; margin-bottom: 15px;">👩‍🎨</div>
                <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                  No pudimos cargar la información de nuestras manicuristas
                </p>
                <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                  Verifica tu conexión e intenta nuevamente
                </p>
              </div>
            `,
            icon: "error",
            confirmButtonText: "Reintentar",
            confirmButtonColor: "#7e2952",
            background: "#fff0f6",
            customClass: {
              popup: "swal-cliente-popup",
              title: "swal-cliente-title",
              confirmButton: "swal-cliente-button",
            },
          })
        }
      } catch (error) {
        console.error("Error fetching manicuristas:", error)
        Swal.fire("Error", "No se pudieron cargar las manicuristas", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchManicuristas()
  }, [])

  useEffect(() => {
    const fetchHorasYManicuristas = async () => {
      if (!fechaReserva) {
        setHorasDisponibles([])
        setManicuristasDisponibles([])
        return
      }

      setLoadingHoras(true)
      try {
        const fechaFormatted = fechaReserva.toISOString().split("T")[0]

        if (manicuristaSeleccionada && manicuristaSeleccionada !== "Según la disponibilidad") {
          const response = await fetch(
            `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${manicuristaSeleccionada.usuario_id}&fecha=${fechaFormatted}`,
          )

          if (response.ok) {
            const data = await response.json()
            let horasDisponibles = data.horas_disponibles || []

            const today = new Date()
            const selectedDate = new Date(fechaReserva)

            if (selectedDate.toDateString() === today.toDateString()) {
              const currentHour = today.getHours()
              const currentMinutes = today.getMinutes()

              horasDisponibles = horasDisponibles.filter((hora) => {
                const [hours, minutes] = hora.split(":")
                const horaInt = Number.parseInt(hours)
                const minutosInt = Number.parseInt(minutes)

                if (horaInt > currentHour) {
                  return true
                } else if (horaInt === currentHour) {
                  return minutosInt > currentMinutes
                }

                return false
              })
            }

            setHorasDisponibles(horasDisponibles)
          }
        } else if (manicuristaSeleccionada === "Según la disponibilidad") {
          const allHorasSet = new Set()

          const horasPromises = manicuristas.map(async (manicurista) => {
            try {
              const response = await fetch(
                `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${manicurista.usuario_id}&fecha=${fechaFormatted}`,
              )

              if (response.ok) {
                const data = await response.json()
                const horas = data.horas_disponibles || []
                horas.forEach((hora) => allHorasSet.add(hora))
              }
            } catch (error) {
              console.error(`Error fetching hours for manicurist ${manicurista.usuario_id}:`, error)
            }
          })

          await Promise.all(horasPromises)

          let horasDisponibles = Array.from(allHorasSet).sort()

          const today = new Date()
          const selectedDate = new Date(fechaReserva)

          if (selectedDate.toDateString() === today.toDateString()) {
            const currentHour = today.getHours()
            const currentMinutes = today.getMinutes()

            horasDisponibles = horasDisponibles.filter((hora) => {
              const [hours, minutes] = hora.split(":")
              const horaInt = Number.parseInt(hours)
              const minutosInt = Number.parseInt(minutes)

              if (horaInt > currentHour) {
                return true
              } else if (horaInt === currentHour) {
                return minutosInt > currentMinutes
              }

              return false
            })
          }

          setHorasDisponibles(horasDisponibles)
        }
      } catch (error) {
        console.error("Error fetching horas disponibles:", error)
        Swal.fire({
          title: "🔄 Problema de conexión",
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 60px; margin-bottom: 15px;">📶</div>
              <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                Hubo un problema al consultar los horarios disponibles
              </p>
              <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                Verifica tu conexión a internet e intenta nuevamente
              </p>
              <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  🕒 <strong>Horario de atención:</strong> Lunes a Sábado 8:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          `,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Reintentar",
          cancelButtonText: "Elegir otra fecha",
          confirmButtonColor: "#7e2952",
          cancelButtonColor: "#6c757d",
          background: "#fff0f6",
          customClass: {
            popup: "swal-cliente-popup",
            title: "swal-cliente-title",
            confirmButton: "swal-cliente-button",
          },
        })
      } finally {
        setLoadingHoras(false)
      }
    }

    fetchHorasYManicuristas()
  }, [manicuristaSeleccionada, fechaReserva, manicuristas])

  useEffect(() => {
    const fetchManicuristasDisponibles = async () => {
      if (manicuristaSeleccionada === "Según la disponibilidad" && fechaReserva && horaSeleccionada) {
        try {
          const fechaFormatted = fechaReserva.toISOString().split("T")[0]
          const availableManicurists = []

          for (const manicurista of manicuristas) {
            try {
              const response = await fetch(
                `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/horas-disponibles/?manicurista_id=${manicurista.usuario_id}&fecha=${fechaFormatted}`,
              )

              if (response.ok) {
                const data = await response.json()
                const horas = data.horas_disponibles || []

                if (horas.includes(horaSeleccionada)) {
                  availableManicurists.push(manicurista)
                }
              }
            } catch (error) {
              console.error(`Error checking availability for manicurist ${manicurista.usuario_id}:`, error)
            }
          }

          setManicuristasDisponibles(availableManicurists)
        } catch (error) {
          console.error("Error fetching manicuristas disponibles:", error)
        }
      }
    }

    fetchManicuristasDisponibles()
  }, [manicuristaSeleccionada, fechaReserva, horaSeleccionada, manicuristas])

  const toggleCategoria = (index) => {
    setCategoriaActiva(categoriaActiva === index ? null : index)
  }

  const toggleServicio = (servicio) => {
    const existe = serviciosSeleccionados.find((s) => s.id === servicio.id)
    setServiciosSeleccionados(
      existe ? serviciosSeleccionados.filter((s) => s.id !== servicio.id) : [...serviciosSeleccionados, servicio],
    )
  }

  const total = serviciosSeleccionados.reduce((acc, item) => {
    const precio = typeof item.precio === "string" ? Number.parseFloat(item.precio) || 0 : item.precio || 0
    return acc + precio
  }, 0)

  const formatDuration = (duration) => {
    const [hours, minutes] = duration.split(":")
    const totalMinutes = Number.parseInt(hours) * 60 + Number.parseInt(minutes)
    return `${totalMinutes} min`
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleContinuar = () => {
    if (paso === 1 && serviciosSeleccionados.length === 0) {
      return Swal.fire({
        title: " ¡Selecciona tus servicios!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 60px; margin-bottom: 15px;">💅🏻</div>
            <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
              Para continuar necesitas elegir al menos un servicio de belleza
            </p>
            <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
              ¡Explora nuestras categorías y encuentra el servicio perfecto para ti!
            </p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#7e2952",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      })
    }

    if (paso === 2 && !manicuristaSeleccionada) {
      return Swal.fire({
        title: "👩‍🎨 ¡Elige tu manicurista!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 60px; margin-bottom: 15px;">✨</div>
            <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
              Selecciona la manicurista que prefieras para tu cita
            </p>
            <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
              También puedes elegir "Según disponibilidad" y nosotras asignaremos la mejor opción
            </p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Perfecto",
        confirmButtonColor: "#7e2952",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      })
    }

    if (paso === 3 && (!fechaReserva || !horaSeleccionada)) {
      return Swal.fire({
        title: "📅 ¡Programa tu cita!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 60px; margin-bottom: 15px;">⏰</div>
            <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
              ${!fechaReserva ? "Selecciona la fecha que más te convenga" : "Elige la hora perfecta para tu cita"}
            </p>
            <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
              ${!fechaReserva ? "Puedes reservar desde hoy en adelante" : "Solo mostramos horarios disponibles"}
            </p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#7e2952",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      })
    }

    if (paso === 4 && !descripcion.trim()) {
      return Swal.fire({
        title: "📝 ¡Agrega una descripción!",
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 60px; margin-bottom: 15px;">✍️</div>
            <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
              Por favor describe qué te gustaría que hagamos en tu cita
            </p>
            <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
              Esto nos ayuda a prepararnos mejor para atenderte
            </p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#7e2952",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      })
    }

    setPaso(paso + 1)
  }

  const handleRegresar = () => {
    if (paso === 1) {
      window.location.href = "/cliente/servicios"
    } else {
      setPaso(paso - 1)
    }
  }

  const handleConfirmarCita = async () => {
    setConfirmandoCita(true)

    // Timer para mostrar alerta si se demora más de 10 segundos
    const timeoutId = setTimeout(() => {
      if (confirmandoCita) {
        Swal.fire({
          title: "⏳ Procesando tu cita...",
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 60px; margin-bottom: 15px;">⌛</div>
              <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                Estamos confirmando tu reserva, por favor espera un momento
              </p>
              <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                No cierres esta ventana ni recargues la página
              </p>
              <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  ⚡ Esto puede tomar unos segundos adicionales
                </p>
              </div>
            </div>
          `,
          icon: "info",
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          background: "#fff0f6",
          customClass: {
            popup: "swal-cliente-popup",
            title: "swal-cliente-title",
          },
        })
      }
    }, 10000)

    try {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("access_token")

      if (!userId || !token) {
        clearTimeout(timeoutId)
        setConfirmandoCita(false)
        Swal.fire({
          title: "🔐 Sesión requerida",
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 60px; margin-bottom: 15px;">👤</div>
              <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                Para reservar una cita necesitas iniciar sesión
              </p>
              <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                ¡Es rápido y fácil! Te llevará solo unos segundos
              </p>
            </div>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Iniciar sesión",
          cancelButtonText: "Más tarde",
          confirmButtonColor: "#7e2952",
          cancelButtonColor: "#ccc",
          background: "#fff0f6",
          customClass: {
            popup: "swal-cliente-popup",
            title: "swal-cliente-title",
            confirmButton: "swal-cliente-button",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login"
          }
        })
        return
      }

      let manicuristaId

      if (manicuristaSeleccionada === "Según la disponibilidad") {
        if (manicuristasDisponibles.length > 0) {
          const randomIndex = Math.floor(Math.random() * manicuristasDisponibles.length)
          manicuristaId = manicuristasDisponibles[randomIndex].usuario_id
        } else {
          clearTimeout(timeoutId)
          setConfirmandoCita(false)
          Swal.fire({
            title: "😔 No hay manicuristas disponibles",
            html: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 60px; margin-bottom: 15px;">👩‍🎨</div>
                <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                  Lo sentimos, no hay manicuristas disponibles para la fecha y hora seleccionadas
                </p>
                <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                  Por favor elige otra fecha u hora, o selecciona una manicurista específica
                </p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                  <p style="font-size: 12px; color: #666; margin: 0;">
                    💡 <strong>Sugerencia:</strong> Las mañanas suelen tener más disponibilidad
                  </p>
                </div>
              </div>
            `,
            icon: "warning",
            confirmButtonText: "Elegir otra hora",
            confirmButtonColor: "#7e2952",
            background: "#fff0f6",
            customClass: {
              popup: "swal-cliente-popup",
              title: "swal-cliente-title",
              confirmButton: "swal-cliente-button",
            },
          })
          return
        }
      } else {
        manicuristaId = manicuristaSeleccionada.usuario_id
      }

      if (!manicuristaId) {
        throw new Error("No se pudo asignar una manicurista disponible")
      }

      const citaData = {
        cliente_id: Number.parseInt(userId),
        manicurista_id: manicuristaId,
        Fecha: fechaReserva.toISOString().split("T")[0],
        Hora: horaSeleccionada,
        Descripcion: descripcion,
        Total: total.toString(),
      }

      console.log("Creating appointment with data:", citaData)

      const citaResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(citaData),
      })

      clearTimeout(timeoutId)

      if (!citaResponse.ok) {
        const errorData = await citaResponse.json()
        console.error("Error response:", errorData)

        setConfirmandoCita(false)

        if (citaResponse.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user_id")
          Swal.fire({
            title: "🔐 Sesión expirada",
            html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 60px; margin-bottom: 15px;">⏰</div>
              <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                Tu sesión ha expirado por seguridad
              </p>
              <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                Por favor inicia sesión nuevamente para continuar
              </p>
            </div>
          `,
            icon: "warning",
            confirmButtonText: "Iniciar sesión",
            confirmButtonColor: "#7e2952",
            background: "#fff0f6",
            customClass: {
              popup: "swal-cliente-popup",
              title: "swal-cliente-title",
              confirmButton: "swal-cliente-button",
            },
          }).then(() => {
            window.location.href = "/login"
          })
          return
        }

        // Manejar errores específicos del serializer
        const errorMessage =
          errorData.error || errorData.detail || errorData.non_field_errors?.[0] || "Error al crear la cita"

        if (errorMessage.includes("ya tiene una cita") || errorMessage.includes("already has an appointment")) {
          Swal.fire({
            title: "📅 Ya tienes una cita",
            html: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 60px; margin-bottom: 15px;">⚠️</div>
                <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                  ${errorMessage}
                </p>
                <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                  Por favor elige otra fecha u hora para tu nueva cita
                </p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                  <p style="font-size: 12px; color: #666; margin: 0;">
                    💡 <strong>Sugerencia:</strong> Puedes ver tus citas existentes en "Mis Citas"
                  </p>
                </div>
              </div>
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Elegir otra hora",
            cancelButtonText: "Ver mis citas",
            confirmButtonColor: "#7e2952",
            cancelButtonColor: "#17a2b8",
            background: "#fff0f6",
            customClass: {
              popup: "swal-cliente-popup",
              title: "swal-cliente-title",
              confirmButton: "swal-cliente-button",
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
              window.location.href = "/cliente/citas/ver"
            }
          })
          return
        }

        if (errorMessage.includes("novedad") || errorMessage.includes("no disponible")) {
          Swal.fire({
            title: "👩‍🎨 Manicurista no disponible",
            html: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 60px; margin-bottom: 15px;">📋</div>
                <p style="font-size: 16px; color: #666; margin-bottom: 15px;">
                  ${errorMessage}
                </p>
                <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                  Por favor elige otra hora o selecciona "Según disponibilidad"
                </p>
              </div>
            `,
            icon: "warning",
            confirmButtonText: "Elegir otra hora",
            confirmButtonColor: "#7e2952",
            background: "#fff0f6",
            customClass: {
              popup: "swal-cliente-popup",
              title: "swal-cliente-title",
              confirmButton: "swal-cliente-button",
            },
          })
          return
        }

        throw new Error(errorMessage)
      }

      const citaCreada = await citaResponse.json()
      console.log("Appointment created:", citaCreada)

      const appointmentId = citaCreada.id || citaCreada.data?.id

      if (!appointmentId) {
        throw new Error("No se pudo obtener el ID de la cita creada")
      }

      const servicioPromises = serviciosSeleccionados.map(async (servicio) => {
        const precio =
          typeof servicio.precio === "string" ? Number.parseFloat(servicio.precio) || 0 : servicio.precio || 0
        const servicioData = {
          cita_id: appointmentId,
          servicio_id: servicio.id,
          subtotal: precio.toString(),
        }

        console.log("Creating service relationship:", servicioData)

        const servicioResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(servicioData),
        })

        if (!servicioResponse.ok) {
          const errorData = await servicioResponse.json()
          console.error("Error creating service relationship:", errorData)
          throw new Error(`Error al agregar servicio ${servicio.nombre}`)
        }

        return servicioResponse.json()
      })

      await Promise.all(servicioPromises)

      setConfirmandoCita(false)

      Swal.fire({
        title: "🎉 ¡Cita confirmada!",
        html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 80px; margin-bottom: 20px;">💅</div>
          <p style="font-size: 18px; color: #666; margin-bottom: 15px;">
            <strong>¡Tu cita ha sido reservada exitosamente!</strong>
          </p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
            <p style="font-size: 14px; color: #7e2952; margin: 5px 0;">
              📅 <strong>Fecha:</strong> ${fechaReserva?.toLocaleDateString()}
            </p>
            <p style="font-size: 14px; color: #7e2952; margin: 5px 0;">
              🕒 <strong>Hora:</strong> ${formatTime(horaSeleccionada)}
            </p>
            <p style="font-size: 14px; color: #7e2952; margin: 5px 0;">
              👩‍🎨 <strong>Manicurista:</strong> ${manicuristaSeleccionada === "Según la disponibilidad"
            ? "Asignada según disponibilidad"
            : `${manicuristaSeleccionada.nombre} ${manicuristaSeleccionada.apellido}`
          }
            </p>
            <p style="font-size: 14px; color: #7e2952; margin: 5px 0;">
              💰 <strong>Total:</strong> $${total.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            Recibirás un correo de confirmación con todos los detalles
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">
            ¡Nos vemos pronto! 💖
          </p>
        </div>
      `,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "📱 Ver mis citas",
        cancelButtonText: "🏠 Ir al inicio",
        confirmButtonColor: "#7e2952",
        cancelButtonColor: "#6c757d",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/cliente/citas/ver"
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.location.href = "/cliente"
        }
      })
    } catch (error) {
      clearTimeout(timeoutId)
      setConfirmandoCita(false)
      console.error("Error creating appointment:", error)

      Swal.fire({
        title: "😔 Error al reservar",
        html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 60px; margin-bottom: 15px;">⚠️</div>
          <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
            No pudimos procesar tu reserva en este momento
          </p>
          <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
            ${error.message || "Por favor intenta nuevamente o contáctanos"}
          </p>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
            <p style="font-size: 12px; color: #666; margin: 0;">
              📞 También puedes llamarnos: <strong>316 345 6789</strong>
            </p>
          </div>
        </div>
      `,
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Reintentar",
        cancelButtonText: "Contactar",
        confirmButtonColor: "#7e2952",
        cancelButtonColor: "#17a2b8",
        background: "#fff0f6",
        customClass: {
          popup: "swal-cliente-popup",
          title: "swal-cliente-title",
          confirmButton: "swal-cliente-button",
        },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          window.open("https://wa.me/573163456789", "_blank")
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando servicios y manicuristas...</p>
      </div>
    )
  }

  return (
    <div className="citas-cliente-layout">
      <div className="citas-cliente-left">
        <div className="citas-cliente-sede">
          {serviciosSeleccionados.length === 0 ? (
            <p>Todavía no hay servicios seleccionados.</p>
          ) : (
            <div>
              <h4
                style={{
                  backgroundColor: "#fdd8e7",
                  borderRadius: "999px",
                  padding: "5px 15px",
                  display: "inline-block",
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#7e2952",
                  marginBottom: "10px",
                }}
              >
                Servicios seleccionados:
              </h4>
              {serviciosSeleccionados.map((s, idx) => (
                <div key={idx} className="servicio-seleccionado-item">
                  <div className="servicio-seleccionado-header">
                    <div className="servicio-seleccionado-nombre">{s.nombre}</div>
                    <div className="servicio-seleccionado-precio">$

                      {(typeof s.precio === "string" ? Number.parseFloat(s.precio) || 0 : s.precio || 0).toLocaleString(
                        "es-CO",
                        { minimumFractionDigits: 0, maximumFractionDigits: 0 },
                      )}
                    </div>
                  </div>
                  <div className="servicio-seleccionado-duracion">{formatDuration(s.duracion)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h4
          style={{
            backgroundColor: "#fdd8e7",
            borderRadius: "999px",
            padding: "5px 15px",
            display: "inline-block",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#7e2952",
            marginBottom: "10px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          Reserva a cargo de:
        </h4>

        {manicuristaSeleccionada ? (
          <div
            className="resumen-manicurista"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              fontSize: "15px",
              color: "#0f0f0f",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            <span role="img" aria-label="user">
              👩‍🎨
            </span>{" "}
            {typeof manicuristaSeleccionada === "string"
              ? manicuristaSeleccionada
              : `${manicuristaSeleccionada.nombre} ${manicuristaSeleccionada.apellido}`}
          </div>
        ) : (
          <p
            style={{
              fontSize: "14px",
              textAlign: "center",
              marginTop: "10px",
              color: "#0f0f0f",
            }}
          >
            Aún no has seleccionado una manicurista.
          </p>
        )}

        <h4
          style={{
            backgroundColor: "#fdd8e7",
            borderRadius: "999px",
            padding: "5px 15px",
            display: "inline-block",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#7e2952",
            marginBottom: "10px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          Fecha de la reserva:
        </h4>

        {fechaReserva && horaSeleccionada ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <span role="img" aria-label="calendar" style={{ fontSize: "20px", marginBottom: "5px" }}>
              📅
            </span>
            <p
              style={{
                fontSize: "14px",
                color: "#0f0f0f",
                textAlign: "center",
                margin: 0,
                borderBottom: "1px solid #fdd8e7",
                paddingBottom: "5px",
                width: "100%",
              }}
            >
              {fechaReserva?.toLocaleDateString()} desde {formatTime(horaSeleccionada)}
            </p>
          </div>
        ) : (
          <p
            style={{
              fontSize: "16px",
              color: "#0f0f0f",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Aún no has seleccionado fecha y hora.
          </p>
        )}

        <div className="citas-cliente-total">
          <span>Total</span>
          <span>${total.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="citas-cliente-right">
        {paso === 1 && (
          <>
            {Object.keys(servicios).map((categoria, index) => (
              <div key={index} className="citas-cliente-categoria">
                <div className="citas-cliente-categoria-header" onClick={() => toggleCategoria(index)}>
                  <h3>{categoria}</h3>
                  <span>{categoriaActiva === index ? "▲" : "▼"}</span>
                </div>

                {categoriaActiva === index && (
                  <div className="citas-cliente-servicios">
                    {servicios[categoria].map((servicio, idx) => (
                      <div key={idx} className="citas-cliente-servicio-item">
                        <div className="citas-cliente-servicio-info">
                          <div className="descripcion-label">
                            <strong>{servicio.nombre}</strong>
                            <p style={{ fontSize: "12px", color: "#7e2952", margin: "2px 0" }}>
                              Duración: {formatDuration(servicio.duracion)}
                            </p>
                          </div>
                          <div className="descripcion-label">
                            $
                            {(typeof servicio.precio === "string"
                              ? Number.parseFloat(servicio.precio) || 0
                              : servicio.precio || 0
                            ).toLocaleString("es-CO", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={serviciosSeleccionados.some((s) => s.id === servicio.id)}
                          onChange={() => toggleServicio(servicio)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {paso === 2 && (
          <div className="citas-cliente-manicuristas">
            <div
              className={`citas-cliente-manicurista-item ${manicuristaSeleccionada === "Según la disponibilidad" ? "seleccionada" : ""
                }`}
              onClick={() => setManicuristaSeleccionada("Según la disponibilidad")}
            >
              {manicuristaSeleccionada === "Según la disponibilidad" ? (
                <span className="check-circle">✔</span>
              ) : (
                <span className="empty-circle"></span>
              )}
              <span>Según la disponibilidad</span>
            </div>

            {manicuristas.map((manicurista, idx) => (
              <div
                key={idx}
                className={`citas-cliente-manicurista-item ${manicuristaSeleccionada?.usuario_id === manicurista.usuario_id ? "seleccionada" : ""
                  }`}
                onClick={() => setManicuristaSeleccionada(manicurista)}
              >
                {manicuristaSeleccionada?.usuario_id === manicurista.usuario_id ? (
                  <span className="check-circle">✔</span>
                ) : (
                  <span className="empty-circle"></span>
                )}
                <span>
                  {manicurista.nombre} {manicurista.apellido}
                </span>
              </div>
            ))}
          </div>
        )}

        {paso === 3 && (
          <div className="citas-cliente-paso3">
            <h3 className="descripcion-label">Elige la fecha y hora para tu cita</h3>

            <div className="fecha-reserva-container">
              <label htmlFor="fechaReserva" className="descripcion-label">
                Selecciona una fecha:
              </label>
              <DatePicker
                selected={fechaReserva}
                onChange={(date) => {
                  setFechaReserva(date)
                  setHoraSeleccionada("")
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Selecciona una fecha"
                className="input-fecha-cita"
              />
            </div>

            {fechaReserva && (
              <div className="horas-disponibles-container">
                {loadingHoras ? (
                  <div className="loading-horas">
                    <p>Cargando horas disponibles...</p>
                  </div>
                ) : horasDisponibles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p style={{ color: "#666", marginBottom: "15px" }}>No hay horas disponibles para esta fecha</p>
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "📅 ¿Por qué no hay horarios?",
                          html: `
                            <div style="text-align: center; padding: 20px;">
                              <div style="font-size: 60px; margin-bottom: 15px;">🤔</div>
                              <p style="font-size: 16px; color: #666; margin-bottom: 15px;">
                                Los horarios pueden no estar disponibles por varios motivos:
                              </p>
                              <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 15px 0;">
                                <p style="font-size: 14px; color: #333; margin: 8px 0;">
                                  ✅ <strong>Citas ya reservadas</strong> en esos horarios
                                </p>
                                <p style="font-size: 14px; color: #333; margin: 8px 0;">
                                  ✅ <strong>Día no laborable</strong> o fuera del horario de atención
                                </p>
                                <p style="font-size: 14px; color: #333; margin: 8px 0;">
                                  ✅ <strong>Manicurista no disponible</strong> ese día
                                </p>
                              </div>
                              <p style="font-size: 14px; color: #7e2952; font-weight: bold; margin-top: 15px;">
                                💡 Intenta con otra fecha o elige "Según disponibilidad"
                              </p>
                              <div style="background: #e8f5e8; padding: 10px; border-radius: 8px; margin-top: 15px;">
                                <p style="font-size: 12px; color: #2d5a2d; margin: 0;">
                                  📞 <strong>¿Necesitas ayuda?</strong> Llámanos: 316 345 6789
                                </p>
                              </div>
                            </div>
                          `,
                          icon: "info",
                          confirmButtonText: "Entendido",
                          confirmButtonColor: "#7e2952",
                          background: "#fff0f6",
                          customClass: {
                            popup: "swal-cliente-popup",
                            title: "swal-cliente-title",
                            confirmButton: "swal-cliente-button",
                          },
                        })
                      }}
                      style={{
                        background: "transparent",
                        border: "2px solid #7e2952",
                        color: "#7e2952",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "#7e2952"
                        e.target.style.color = "white"
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "transparent"
                        e.target.style.color = "#7e2952"
                      }}
                    >
                      ¿Por qué no hay horarios? 🤔
                    </button>
                  </div>
                ) : (
                  horasDisponibles.map((hora, idx) => (
                    <button
                      key={idx}
                      className={`hora-btn ${horaSeleccionada === hora ? "seleccionada" : ""}`}
                      onClick={() => setHoraSeleccionada(hora)}
                    >
                      {formatTime(hora)}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {paso === 4 && (
          <div className="citas-cliente-paso4">
            <h3 className="descripcion-label">Cuéntanos más sobre tu cita</h3>

            <div className="descripcion-container">
              <label htmlFor="descripcion" className="descripcion-label">
                Describe qué te gustaría que hagamos en tu cita:
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ejemplo: Me gustaría uñas en gel color rosa con diseño de flores, también necesito arreglo de cutículas..."
                className="input-descripcion-cita"
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #fdd8e7",
                  fontSize: "14px",
                  fontFamily: "Arial, sans-serif",
                  resize: "vertical",
                  minHeight: "100px",
                  marginTop: "10px",
                }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "8px",
                  fontStyle: "italic",
                }}
              >
                💡 Mientras más detalles nos des, mejor podremos prepararnos para tu cita
              </p>
            </div>
          </div>
        )}

        {paso === 5 && (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
              maxWidth: "520px",
              margin: "0 auto",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: "#2c2c2c",
              lineHeight: 1.6,
            }}
          >
            <h4
              style={{
                fontSize: "24px",
                marginBottom: "25px",
                textAlign: "center",
                color: "#b3005e",
              }}
            >
              ✨ Revisa y confirma tu cita
            </h4>

            <div style={{ marginBottom: "12px" }}>
              <strong>📋 Servicios:</strong>{" "}
              <span style={{ color: "#444" }}>{serviciosSeleccionados.map((s) => s.nombre).join(", ")}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>👩‍🎨 Manicurista:</strong>{" "}
              <span style={{ color: "#444" }}>
                {typeof manicuristaSeleccionada === "string"
                  ? manicuristaSeleccionada
                  : `${manicuristaSeleccionada.nombre} ${manicuristaSeleccionada.apellido}`}
              </span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>📅 Fecha:</strong> <span style={{ color: "#444" }}>{fechaReserva?.toLocaleDateString()}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>🕒 Hora:</strong> <span style={{ color: "#444" }}>{formatTime(horaSeleccionada)}</span>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>📝 Descripción:</strong> <span style={{ color: "#444" }}>{descripcion}</span>
            </div>

            <div
              style={{
                fontWeight: "bold",
                fontSize: "18px",
                marginTop: "25px",
                textAlign: "center",
                color: "#b3005e",
              }}
            >
              💰 Total: ${total.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>

            <div style={{ textAlign: "center", marginTop: "35px" }}>
              <button
                className="btn-confirmar-cita"
                style={{
                  backgroundColor: confirmandoCita ? "#ccc" : "#7e2952",
                  border: "none",
                  borderRadius: "25px",
                  padding: "14px 40px",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: confirmandoCita ? "not-allowed" : "pointer",
                  boxShadow: confirmandoCita ? "none" : "0 4px 12px rgba(126, 41, 82, 0.3)",
                  transition: "all 0.3s ease",
                  opacity: confirmandoCita ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!confirmandoCita) {
                    e.currentTarget.style.backgroundColor = "#571e39"
                    e.currentTarget.style.transform = "scale(1.03)"
                  }
                }}
                onMouseOut={(e) => {
                  if (!confirmandoCita) {
                    e.currentTarget.style.backgroundColor = "#7e2952"
                    e.currentTarget.style.transform = "scale(1)"
                  }
                }}
                onClick={handleConfirmarCita}
                disabled={confirmandoCita}
              >
                {confirmandoCita ? "Confirmando..." : "Confirmar Cita"}
              </button>
            </div>
          </div>
        )}

        <div className="citas-cliente-btn-container">
          <button className="citas-cliente-btn citas-cliente-back" onClick={handleRegresar}>
            Regresar
          </button>
          {paso < 5 && (
            <button className="citas-cliente-btn citas-cliente-next" onClick={handleContinuar}>
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearCita
