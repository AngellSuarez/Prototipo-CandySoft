"use client"

import { useState, useEffect, useRef } from "react"
import { FiMenu, FiX, FiCalendar, FiList, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import "../../../css/crearcita.css"

const VerCita = () => {
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [citas, setCitas] = useState([])
  const [serviciosCitas, setServiciosCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [vistaCalendario, setVistaCalendario] = useState(false)
  const [serviciosPorTipo, setServiciosPorTipo] = useState({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()
  const [menuMobile, setMenuMobile] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showMenuServicio, setShowMenuServicio] = useState(false)
  const [subMenuServicio, setSubMenuServicio] = useState(null)
  const itemRefs = useRef({})
  const [submenuPosition, setSubmenuPosition] = useState(0)
  const [cancelandoCita, setCancelandoCita] = useState(false)

  useEffect(() => {
    const fetchCliente = async () => {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("access_token")

      if (!userId || !token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/clientes/${userId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) throw new Error("No se pudo obtener la información del cliente")

        const data = await response.json()
        setCliente(data)
      } catch (error) {
        console.error(error)
        Swal.fire("Error", "No se pudo cargar tu perfil, inicia de nuevo sesión", "error")
      }
    }

    fetchCliente()
  }, [navigate])

  useEffect(() => {
    const fetchServicios = async () => {
      try {
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
          setServiciosPorTipo(grouped)
        }
      } catch (error) {
        console.error("Error fetching servicios:", error)
      }
    }

    fetchServicios()
  }, [])

  useEffect(() => {
    const fetchCitasYServicios = async () => {
      const userId = localStorage.getItem("user_id")
      const token = localStorage.getItem("access_token")

      if (!userId || !token) return

      try {
        setLoading(true)

        const citasResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!citasResponse.ok) throw new Error("Error al obtener las citas")

        const citasData = await citasResponse.json()
        const citasCliente = citasData.filter((cita) => cita.cliente_id === Number.parseInt(userId))

        const serviciosResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!serviciosResponse.ok) throw new Error("Error al obtener los servicios de las citas")

        const serviciosData = await serviciosResponse.json()

        setCitas(citasCliente)
        setServiciosCitas(serviciosData)
      } catch (error) {
        console.error("Error:", error)
        Swal.fire("Error", "No se pudieron cargar las citas", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchCitasYServicios()
  }, [])

  const getServiciosPorCita = (citaId) => {
    return serviciosCitas.filter((servicio) => servicio.cita_id === citaId)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(Number.parseFloat(price))
  }

  const getEstadoClass = (estado) => {
    switch (estado.toLowerCase()) {
      case "terminada":
        return "terminada"
      case "en proceso":
        return "en-proceso"
      case "cancelada":
        return "cancelada"
      default:
        return "pendiente"
    }
  }

  const puedeSerCancelada = (cita) => {
    const estadosPermitidos = ["Pendiente", "En proceso"]
    return estadosPermitidos.includes(cita.estado_nombre)
  }

  const handleCancelarCita = async (cita) => {
    // Mostrar confirmación
    const confirmResult = await Swal.fire({
      title: "⚠️ ¿Cancelar cita?",
      html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 60px; margin-bottom: 15px;">📅</div>
                    <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                        ¿Estás seguro de que quieres cancelar tu cita del <strong>${formatDate(cita.Fecha)}</strong> a las <strong>${formatTime(cita.Hora)}</strong>?
                    </p>
                    <p style="font-size: 14px; color: #7e2952; font-weight: bold; margin-bottom: 15px;">
                        Esta acción no se puede deshacer
                    </p>
                    <div style="background: #fff3cd; padding: 10px; border-radius: 8px; margin-top: 15px;">
                        <p style="font-size: 12px; color: #856404; margin: 0;">
                            ⚠️ <strong>Recuerda:</strong> Solo puedes cancelar citas con más de 24 horas de anticipación
                        </p>
                    </div>
                </div>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantener cita",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      cancelButtonColor: "#7e2952",
      background: "#fff0f6",
      customClass: {
        popup: "swal-cliente-popup",
        title: "swal-cliente-title",
        confirmButton: "swal-cliente-button",
      },
    })

    if (!confirmResult.isConfirmed) return

    setCancelandoCita(true)

    try {
      const token = localStorage.getItem("access_token")

      // Obtener el estado "Cancelada"
      const estadosResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/estados-cita/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!estadosResponse.ok) throw new Error("Error al obtener los estados")

      const estados = await estadosResponse.json()
      const estadoCancelada = estados.find((estado) => estado.Estado === "Cancelada")

      if (!estadoCancelada) {
        throw new Error("No se encontró el estado 'Cancelada'")
      }

      // Actualizar la cita con el estado cancelada
      const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/${cita.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado_id: estadoCancelada.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)

        const errorMessage =
          errorData.error || errorData.detail || errorData.non_field_errors?.[0] || "Error al cancelar la cita"

        if (errorMessage.includes("menos de 24 horas") || errorMessage.includes("anticipación")) {
          throw new Error(`⏰ ${errorMessage}`)
        } else if (errorMessage.includes("ya pasó") || errorMessage.includes("en curso")) {
          throw new Error(`⚠️ ${errorMessage}`)
        } else {
          throw new Error(errorMessage)
        }
      }

      const citasResponse = await fetch("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (citasResponse.ok) {
        const citasData = await citasResponse.json()
        const userId = localStorage.getItem("user_id")
        const citasCliente = citasData.filter((cita) => cita.cliente_id === Number.parseInt(userId))
        setCitas(citasCliente)
      }

      // Cerrar el modal
      setCitaSeleccionada(null)

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "✅ Cita cancelada",
        html: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
                        <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                            Tu cita del <strong>${formatDate(cita.Fecha)}</strong> a las <strong>${formatTime(cita.Hora)}</strong> ha sido cancelada exitosamente
                        </p>
                        <p style="font-size: 14px; color: #7e2952; font-weight: bold;">
                            Esperamos verte pronto en otra ocasión
                        </p>
                        <div style="background: #f8c1d9; padding: 10px; border-radius: 8px; margin-top: 15px;">
                            <p style="font-size: 12px; color: #7e2952; margin: 0;">
                                💗 <strong>¿Cambio de planes?</strong> Puedes reservar una nueva cita cuando gustes
                            </p>
                        </div>
                    </div>
                `,
        icon: "success",
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: "Reservar nueva cita",
        cancelButtonText: "Cerrar",
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
          navigate("/cliente/citas/crear")
        }
      })
    } catch (error) {
      console.error("Error canceling appointment:", error)

      Swal.fire({
        title: "😔 Error al cancelar",
        html: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 60px; margin-bottom: 15px;">⚠️</div>
                        <p style="font-size: 16px; color: #666; margin-bottom: 10px;">
                            ${error.message || "No pudimos cancelar tu cita en este momento"}
                        </p>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
                            <p style="font-size: 12px; color: #666; margin: 0;">
                                📞 <strong>¿Necesitas ayuda?</strong> Contáctanos: 316 345 6789
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
    } finally {
      setCancelandoCita(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" })
  }

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const getCitasForDate = (date) => {
    return citas.filter((cita) => {
      const citaDate = new Date(cita.Fecha)
      return isSameDay(citaDate, date)
    })
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const CalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)
    const today = new Date()
    const calendarDays = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day)
    }

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              <FiChevronLeft size={20} />
            </button>
            <h2 className="calendar-title">{getMonthName(currentDate)}</h2>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              <FiChevronRight size={20} />
            </button>
          </div>
          <button className="today-btn" onClick={goToToday}>
            Hoy
          </button>
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-color calendar-appointment-ver-pending"></span>
            <span className="legend-label">Pendiente</span>
          </div>
          <div className="legend-item">
            <span className="legend-color calendar-appointment-ver-process"></span>
            <span className="legend-label">En proceso</span>
          </div>
          <div className="legend-item">
            <span className="legend-color calendar-appointment-ver-cancelled"></span>
            <span className="legend-label">Cancelada</span>
          </div>
          <div className="legend-item">
            <span className="legend-color calendar-appointment-ver-completed"></span>
            <span className="legend-label">Terminada</span>
          </div>
        </div>

        <div className="calendar-grid descripcion-label">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="calendar-day-empty"></div>
            }

            const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const daysCitas = getCitasForDate(currentDayDate)
            const isToday = isSameDay(currentDayDate, today)
            const isPast = currentDayDate < today && !isToday

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? "today" : ""} ${isPast ? "past" : ""} ${daysCitas.length > 0 ? "has-appointments" : ""
                  }`}
              >
                <div className="day-number">{day}</div>
                <div className="day-appointments-ver">
                  {daysCitas.slice(0, 3).map((cita) => (
                    <div
                      key={cita.id}
                      className={`calendar-appointment ${cita.estado_nombre === "Pendiente"
                        ? "calendar-appointment-ver-pending"
                        : cita.estado_nombre === "En proceso"
                          ? "calendar-appointment-ver-process"
                          : cita.estado_nombre === "Cancelada"
                            ? "calendar-appointment-ver-cancelled"
                            : cita.estado_nombre === "Terminada"
                              ? "calendar-appointment-ver-completed"
                              : ""
                        }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCitaSeleccionada(cita)
                      }}
                      title={`${formatTime(cita.Hora)} - ${cita.manicurista_nombre}`}
                    >
                      <span className="appointment-time-mini-ver">{formatTime(cita.Hora).slice(0, 5)}</span>
                    </div>
                  ))}
                  {daysCitas.length > 3 && <div className="appointment-more-ver">+{daysCitas.length - 3}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando citas...</p>
      </div>
    )
  }

  return (
    <>
      <nav className="nav-container">
        <div className="perfil-header">
          <img src="https://i.pinimg.com/736x/ab/dd/f1/abddf13749e496af6b9bfc5f5bec55e4.jpg" alt="Logo" />
          <button className="menu-toggle2" onClick={() => setMenuMobile(!menuMobile)}>
            {menuMobile ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <div className={`nav-menu ${menuMobile ? "active" : ""}`}>
          <Link
            to="/cliente"
            onClick={() => {
              setMenuMobile(false)
            }}
          >
            Inicio
          </Link>
          <span>|</span>
          <Link to="/cliente/Nosotros" onClick={() => setMenuMobile(false)}>
            Nosotros
          </Link>
          <span>|</span>
          <div
            className="acceso-wrapper"
            onMouseEnter={() => !menuMobile && setShowMenuServicio(true)}
            onMouseLeave={() => !menuMobile && setShowMenuServicio(false)}
          >
            <div className={`acceso-link ${showMenuServicio ? "active" : ""}`}>
              <Link
                to="/cliente/servicios"
                onClick={() => {
                  setMenuMobile(false)
                  setShowMenuServicio(!showMenuServicio)
                }}
              >
                Servicios
              </Link>
              <span className={`flecha-acceso ${showMenuServicio ? "rotate" : ""}`}>&#9660;</span>
            </div>

            <div className={`submenu-acceso ${showMenuServicio ? "show" : ""}`}>
              {Object.keys(serviciosPorTipo).map((tipo) => (
                <div
                  key={tipo}
                  className={`submenu-item-acceso ${subMenuServicio === tipo ? "active" : ""}`}
                  ref={(el) => (itemRefs.current[tipo] = el)}
                  onClick={() => (subMenuServicio === tipo ? setSubMenuServicio(null) : setSubMenuServicio(tipo))}
                >
                  {tipo}
                  {subMenuServicio === tipo && (
                    <div className="sub-submenu-acceso" style={{ top: submenuPosition }}>
                      {serviciosPorTipo[tipo].map((servicio) => (
                        <div
                          key={servicio.id}
                          className="submenu-item-acceso"
                          onClick={() => {
                            navigate(`/cliente/servicios/${servicio.id}`)
                            setShowMenuServicio(false)
                            setSubMenuServicio(null)
                          }}
                        >
                          {servicio.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <span>|</span>
          <Link to="/cliente/calificanos" onClick={() => setMenuMobile(false)}>
            Califícanos
          </Link>
          <span>|</span>
          <div
            className="acceso-wrapper"
            onMouseEnter={() => !menuMobile && setShowMenu(true)}
            onMouseLeave={() => !menuMobile && setShowMenu(false)}
            onClick={() => menuMobile && setShowMenu(!showMenu)}
          >
            <div className={`acceso-link ${showMenu ? "active" : ""}`}>
              <a
                onClick={() => {
                  setMenuMobile(false)
                }}
              >
                {cliente?.nombre} {cliente?.apellido}
              </a>
              <span className={`flecha-acceso ${showMenu ? "rotate" : ""}`}>&#9660;</span>
            </div>
            <div className={`submenu-acceso ${showMenu ? "show" : ""}`}>
              <div
                className="submenu-item-acceso"
                onClick={() => {
                  setMenuMobile(false)
                  navigate("/cliente/perfil")
                }}
              >
                Perfil
              </div>
              <div
                className="submenu-item-acceso"
                onClick={() => {
                  setMenuMobile(false)
                  navigate("/cliente/citas/ver")
                }}
              >
                Ver mis citas
              </div>
              <div
                className="submenu-item-acceso"
                onClick={() => {
                  Swal.fire({
                    title: "¿Estás seguro?",
                    text: "¿Quieres cerrar sesión?",
                    icon: "warning",
                    showCancelButton: true,
                    reverseButtons: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Sí, cerrar sesión",
                    cancelButtonText: "Cancelar",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      localStorage.removeItem("access_token")
                      localStorage.removeItem("user_id")
                      navigate("/")
                    }
                  })
                }}
              >
                Cerrar sesión
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="ver-cita-layout">
        <div className="ver-cita-container">
          <div className="main-content">
            <div className="ver-cita-header">
              <div className="header-content">
                <h2 className="ver-cita-title">Mis Citas</h2>
                <p className="ver-cita-subtitle">Gestiona y visualiza todas tus citas de belleza</p>
              </div>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${!vistaCalendario ? "active" : ""}`}
                  onClick={() => setVistaCalendario(false)}
                >
                  <FiList /> Lista
                </button>
                <button
                  className={`toggle-btn ${vistaCalendario ? "active" : ""}`}
                  onClick={() => setVistaCalendario(true)}
                >
                  <FiCalendar /> Calendario
                </button>
              </div>
            </div>

            {citas.length === 0 ? (
              <div className="no-citas">
                <div className="no-citas-icon">📅</div>
                <h3>No tienes citas programadas</h3>
                <p>¡Es hora de mimarte! Reserva tu próxima cita de belleza</p>
                <Link to="/cliente/citas/crear" className="btn-crear-cita">
                  Reservar una cita
                </Link>
              </div>
            ) : vistaCalendario ? (
              <CalendarView />
            ) : (
              <div className="ver-cita-lista">
                {citas.map((cita, index) => (
                  <div
                    key={cita.id}
                    className="ver-cita-card"
                    onClick={() => setCitaSeleccionada(cita)}
                    style={{ cursor: "pointer", animationDelay: `${index * 0.1}s` }}
                    title="Dale click para ver más detalles de la cita"
                  >
                    <div className="cita-card-header">
                      <div className="cita-fecha-hora">
                        <div className="cita-fecha">{formatDate(cita.Fecha)}</div>
                        <div className="cita-hora">{formatTime(cita.Hora)}</div>
                      </div>
                      <div className={`estado ${getEstadoClass(cita.estado_nombre)}`}>{cita.estado_nombre}</div>
                    </div>

                    <div className="cita-info">
                      <div className="cita-info-item">
                        <div className="cita-info-label">Manicurista</div>
                        <div className="cita-info-value">{cita.manicurista_nombre}</div>
                      </div>
                      <div className="cita-info-item">
                        <div className="cita-info-label">Total</div>
                        <div className="cita-info-value cita-precio">{formatPrice(cita.Total)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ver-cita-sidebar">
            <div className="sidebar-card">
              <img
                src="https://hips.hearstapps.com/hmg-prod/images/granate-66a8d5b63adf4.jpg?resize=980:*"
                alt="Imagen cita"
                className="sidebar-image"
              />
              <div className="sidebar-stats">
                <div className="stat-item">
                  <span className="stat-number">{citas.length}</span>
                  <span className="stat-label">Total Citas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {citas.filter((c) => c.estado_nombre.toLowerCase() === "terminada").length}
                  </span>
                  <span className="stat-label">Terminadas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {citaSeleccionada && (
        <div className="modal-overlay-cita" onClick={() => setCitaSeleccionada(null)}>
          <div className="modal-content-cita" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>LA FLORESTA</h2>
              <p>Cra. 81 #27-50, Floresta</p>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <div className="section-title">📅 Información principal</div>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Fecha</div>
                    <div className="info-value">{formatDate(citaSeleccionada.Fecha)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Hora</div>
                    <div className="info-value">{formatTime(citaSeleccionada.Hora)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Estado</div>
                    <div className={`estado ${getEstadoClass(citaSeleccionada.estado_nombre)}`}>
                      {citaSeleccionada.estado_nombre}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-section">
                <div className="section-title">💅 Servicios seleccionados</div>
                <div className="info-grid">
                  {getServiciosPorCita(citaSeleccionada.id).map((servicio) => (
                    <div key={servicio.id} className="servicio-item">
                      <div className="servicio-nombre-ver">{servicio.servicio_nombre}</div>
                      <div className="servicio-precio-ver">{formatPrice(servicio.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="info-grid-dos">
                <div className="responsable-section">
                  <div className="responsable-avatar">👩‍🎨</div>
                  <div>
                    <div className="info-label" style={{ color: "rgba(255,255,255,0.8)" }}>
                      Reserva a cargo de la manicurista
                    </div>
                    <div className="info-value" style={{ color: "white", fontSize: "1.2rem" }}>
                      {citaSeleccionada.manicurista_nombre}
                    </div>
                  </div>

                </div>
                <div className="total-section">
                  <div className="total-label">Total a pagar</div>
                  <div className="total-amount">{formatPrice(citaSeleccionada.Total)}</div>
                </div>
              </div>
              {citaSeleccionada.Descripcion && (
                <div className="modal-section-dos">
                  <div className="section-title">📝 Descripción</div>
                  <div className="info-item">
                    <div className="info-value-des">{citaSeleccionada.Descripcion}</div>
                  </div>
                </div>
              )}
            </div>


            <div className="modal-actions">
              <button className="btn-modal btn-cerrar-ver" onClick={() => setCitaSeleccionada(null)}>
                Cerrar
              </button>

              {puedeSerCancelada(citaSeleccionada) && (
                <button
                  className="btn-modal btn-cancelar-cita"
                  onClick={() => handleCancelarCita(citaSeleccionada)}
                  disabled={cancelandoCita}
                  style={{
                    backgroundColor: cancelandoCita ? "#ccc" : "#dc3545",
                    cursor: cancelandoCita ? "not-allowed" : "pointer",
                    opacity: cancelandoCita ? 0.7 : 1,
                  }}
                >
                  {cancelandoCita ? "Cancelando..." : "Cancelar cita"}
                </button>
              )}

              <button className="btn-modal btn-conectar">Contactar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VerCita
