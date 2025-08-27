import React, { useEffect, useState } from "react";
import { FaChartLine, FaStar, FaUsers, FaRegCalendarCheck, FaBoxOpen, FaUserCog } from "react-icons/fa";
import { Bell, User, Star, X } from 'lucide-react';
import { listar_calificaciones } from "../../../services/calificaciones_service"
import { Link } from "react-router-dom";
import "../../../css/medicion.css";
import { FaHandsHelping } from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from "recharts";

import { useTheme } from "../../tema/ThemeContext";
import axios from "axios";
import { PieChart, Pie, Cell, Legend } from 'recharts';

const MedicionRec = () => {
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

  const [serviciosMes, setServiciosMes] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [citasSemana, setCitasSemana] = useState([]);
  const { darkMode } = useTheme();

  const [serviciosVendidosMes, setServiciosVendidosMes] = useState([]);

  useEffect(() => {
    axios.get("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
      .then(res => {
        const serviciosOrdenados = [...res.data]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);
        setServiciosMes(serviciosOrdenados);
      })
      .catch(err => {
        console.error("Error al obtener servicios:", err);
      });
  }, []);

  const [gananciaSemanal, setGananciaSemanal] = useState(null);
  const [gananciaSemanaPasada, setGananciaSemanaPasada] = useState(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState('');
  const COLORS = ['#ae61d2', '#5591c6'];
  useEffect(() => {
    obtenerGanancia();
    obtenerGananciaSemanaAnterior();
  }, []);

  const obtenerGanancia = async (semana = null) => {
    try {
      const response = await axios.get('https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/ganancia-semanal/', {
        params: semana ? { semana } : {}
      });

      setGananciaSemanal({
        total: response.data.ganancia_total,
        fechaInicio: response.data.fecha_inicio,
        fechaFin: response.data.fecha_fin
      });
    } catch (error) {
      console.error('Error al obtener la ganancia actual:', error);
      setGananciaSemanal(null);
    }
  };

  const obtenerGananciaSemanaAnterior = async () => {
    try {
      const response = await axios.get('https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/ganancia-semanal-anterior/');
      setGananciaSemanaPasada({
        total: response.data.ganancia_total,
        fechaInicio: response.data.fecha_inicio,
        fechaFin: response.data.fecha_fin
      });
    } catch (error) {
      console.error('Error al obtener la ganancia pasada:', error);
      setGananciaSemanaPasada(null);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSemanaSeleccionada(value);
    obtenerGanancia(value);
  };

  const dataGrafica = [
    { name: 'Semana Actual', value: gananciaSemanal?.total || 0 },
    { name: 'Semana Anterior', value: gananciaSemanaPasada?.total || 0 },
  ];

  const [serviciosDia, setServiciosDia] = useState([]);

  useEffect(() => {
    axios.get("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/servicios-dia/")
      .then(res => setServiciosDia(res.data))
      .catch(err => console.error("Error al obtener servicios del día:", err));
  }, []);

  useEffect(() => {
    axios.get("https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/ganancia-semanal/")
      .then(res => {
        setGananciaSemanal({
          total: res.data.ganancia_total,
          fechaInicio: res.data.fecha_inicio,
          fechaFin: res.data.fecha_fin
        });
      })
      .catch(err => console.error("Error al obtener ganancia semanal:", err));
  }, []);

  useEffect(() => {
    axios.get("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/servicios-mas-vendidos-mes/")
      .then(res => setServiciosVendidosMes(res.data))
      .catch(err => {
        console.error("Error al obtener servicios más vendidos del mes:", err);
      });
  }, []);

  const diasSemanaES = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const citasSemanaTraducida = Array.isArray(citasSemana)
    ? citasSemana.map((dia) => ({
      ...dia,
      name: diasSemanaES[dia.name] || dia.name,
    }))
    : [];

  useEffect(() => {
    fetch('https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/clientes-top/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClientesTop(data);
        } else {
          setClientesTop([]);
          console.warn("Formato de datos incorrecto para clientesTop:", data);
        }
      })
      .catch((error) => {
        console.error('Error al obtener los clientes top:', error);
        setClientesTop([]);
      });
  }, []);


  useEffect(() => {
    fetch('https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/citas-semana/')
      .then(res => res.json())
      .then(data => setCitasSemana(data))
      .catch(err => console.error('Error al obtener citas de la semana:', err));
  }, []);

  const [abastecimientosRecientes, setAbastecimientosRecientes] = useState([]);

  useEffect(() => {
    fetch('https://angelsuarez.pythonanywhere.com/api/abastecimiento/abastecimientos/recientes/')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAbastecimientosRecientes(data);
        } else {
          console.error('La respuesta no es una lista:', data);
          setAbastecimientosRecientes([]);
        }
      })
      .catch((error) => {
        console.error('Error al obtener abastecimientos recientes:', error);
        setAbastecimientosRecientes([]);
      });
  }, []);

  const [topAbastecimientos, setTopAbastecimientos] = useState([]);

  useEffect(() => {
    fetch('https://angelsuarez.pythonanywhere.com/api/abastecimiento/abastecimientos/top_manicuristas/')
      .then((res) => res.json())
      .then((data) => setTopAbastecimientos(data))
      .catch((error) => console.error('Error al obtener top manicuristas:', error));
  }, []);

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      <div className="fila-formulario">
        <h1 className="titulo">Gestión dashboard</h1>

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

      <div className="dashboard-grid">
        <div className="card combined-card">
          <div className="combined-content">
            <div className="left-section highlight-card">
              <h3>Ganancia Total De La Semana</h3>
              <input
                type="week"
                className="buscar-ganancia"
                value={semanaSeleccionada}
                onChange={handleChange}
              />
              {gananciaSemanal ? (
                <>
                  <p className="amount">
                    ${Number(gananciaSemanal.total || 0).toLocaleString()}
                  </p>
                  <span className="date-range">
                    {gananciaSemanal.fechaInicio} - {gananciaSemanal.fechaFin}
                  </span>
                </>
              ) : (
                <p>Cargando datos...</p>
              )}
            </div>

            <div className="right-section">
              <h4>Comparación con la semana pasada</h4>
              {gananciaSemanal && gananciaSemanaPasada ? (
                <PieChart width={250} height={230}>
                  <Pie
                    data={dataGrafica}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    fill="#8884d8"
                    label
                  >
                    {dataGrafica.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <p>Cargando gráfica...</p>
              )}
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-title">
            <h3>Servicios del Día por Manicurista</h3>
            <FaHandsHelping className="icon-medi" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={serviciosDia.slice(0, 4)} barSize={30}>
              <XAxis dataKey="name" tick={{ fill: "#888" }} />
              <YAxis domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Bar dataKey="servicios" fill="#f06292" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="card-title">
            <h3>Servicios mas vendidos del mes</h3>
            <FaHandsHelping className="icon-medi" />
          </div>
          {serviciosVendidosMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={serviciosVendidosMes.slice(0, 4)} barSize={30}>
                <XAxis dataKey="name" tick={{ fill: "#888" }} />
                <YAxis domain={[0, 'dataMax + 1']} />
                <Tooltip />
                <Bar dataKey="ventas" fill="#ab47bc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>No hay datos disponibles</p>
          )}
        </div>

        <div className="card chart-card">
          <div className="card-title">
            <h3>Nuevos servicios</h3>
            <FaChartLine className="icon-medi" />
          </div>
          <ul className="detail-list">
            {serviciosMes.map((servicio, idx) => (
              <li key={idx} className="detail-item">
                <div className="detail-info">
                  <img
                    src={servicio.url_imagen}
                    alt={servicio.nombre}
                    className="service-img"
                  />
                  <span className="service-name">{servicio.nombre}</span>
                </div>
                <span className="service-ventas">Nuevo</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card detail-card">
          <div className="card-title">
            <h3>Clientes con Más Citas</h3>
            <FaUsers className="icon-medi" />
          </div>

          <table className="detail-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Citas</th>
              </tr>
            </thead>
            <tbody>
              {clientesTop.map((cliente, index) => (
                <tr key={index}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.citas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card combined-card chart-card2">
          <div className="card-title">
            <h3>Citas de la Semana</h3>
            <FaRegCalendarCheck className="icon-medi" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={citasSemanaTraducida} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "#888" }} />
              <YAxis domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Bar dataKey="Pendiente" stackId="a" fill="#ffb74d" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Terminada" stackId="a" fill="#4db6ac" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card detail-card">
          <div className="card-title">
            <h3>Últimos Abastecimientos</h3>
            <FaBoxOpen className="icon-medi" />
          </div>
          <ul className="detail-list">
            {abastecimientosRecientes.map((abastecimiento) => (
              <li key={abastecimiento.id} className="detail-item">
                <span>
                  <strong>{abastecimiento.manicurista_nombre}</strong> pidió:
                  <ul>
                    {Array.isArray(abastecimiento.insumos) ? (
                      abastecimiento.insumos.map((insumo) => (
                        <li key={insumo.id}>
                          {insumo.insumo_nombre} – {insumo.cantidad} unidades
                        </li>
                      ))
                    ) : (
                      <li>No hay insumos disponibles</li>
                    )}
                  </ul>
                </span>
                <span className="date">
                  {new Date(abastecimiento.fecha_creacion).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card detail-card">
          <div className="card-title">
            <h3>Top Manicuristas por Abastecimientos</h3>
          </div>
          <table className="detail-table">
            <thead>
              <tr>
                <th>Manicurista</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {topAbastecimientos.map((item, index) => (
                <tr key={index}>
                  <td>{item.nombre}</td>
                  <td>{item.pedidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </div>
  );
};

export default MedicionRec;
