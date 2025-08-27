import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
  FaBoxOpen,
  FaRegCalendarCheck
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Bell, User, X } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../../css/medicion.css";
import axios from 'axios';
import {
  listar_novedades
} from "../../../services/novedades_service";

import { obtenerServiciosSemana, obtenerLiquidacionesManicurista } from "../../../services/servicio_cita_service";


const consumos = [
  { insumo: "Esmalte Rojo", cantidad: 2, estadoInsumo: "Disponible", fecha: "03 Abril 2025" },
  { insumo: "Lima Nueva", cantidad: 1, estadoInsumo: "Agotado", fecha: "05 Abril 2025" },
];

const MedicionManicurista = () => {
  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      mensaje: "Nueva novedad creada por Paula. Cambio en el horario de ingreso",
      fecha: "2024-12-29",
      visto: false,
    },
    {
      id: 2,
      mensaje: "Se ha agendado una cita para el 03/05/2025.",
      fecha: "2024-12-28",
      visto: false,
    },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tabActiva, setTabActiva] = useState("notificaciones")

  const openModal = (tab = "notificaciones") => {
    setTabActiva(tab)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    if (tabActiva === "notificaciones") {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, visto: true })))
    }
  }

  const notificacionesNoVistas = notificaciones.filter((n) => !n.visto).length

  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    const cargarNovedades = async () => {
      const manicuristaId = localStorage.getItem("user_id");
      if (!manicuristaId) return;

      const data = await listar_novedades(manicuristaId);
      if (data) {
        const ordenadas = [...data].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));

        const ultimasDos = ordenadas.slice(0, 2);

        const novedadesFormateadas = ultimasDos.map(item => ({
          tipo: "Novedad",
          detalle: item.Motivo,
          fecha: `${item.Fecha} (${item.HoraEntrada} - ${item.HoraSalida})`
        }));

        setNovedades(novedadesFormateadas);
      }
    };

    cargarNovedades();
  }, []);

  const [serviciosSemana, setServiciosSemana] = useState([]);

  useEffect(() => {
    const cargarServiciosSemana = async () => {
      const manicuristaId = localStorage.getItem("user_id");
      console.log("manicuristaId:", manicuristaId);

      if (!manicuristaId) return;

      const response = await obtenerServiciosSemana(manicuristaId);
      if (response) {
        setServiciosSemana(response);
      }
    };

    cargarServiciosSemana();
  }, []);

  const [liquidaciones, setLiquidaciones] = useState([]);

  useEffect(() => {
    const cargarLiquidaciones = async () => {
      const manicuristaId = localStorage.getItem("user_id");
      if (!manicuristaId) return;

      const data = await obtenerLiquidacionesManicurista(manicuristaId);

      if (data && Array.isArray(data)) {
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.FechaFinal) - new Date(a.FechaFinal)
        );

        const ultimasTres = ordenadas.slice(0, 3);

        const formateadas = ultimasTres.map((liq) => ({
          nombreM: liq.manicurista_nombre,
          valor: liq.Comision,
          fecha: liq.FechaFinal
        }));

        setLiquidaciones(formateadas);
      }
    };

    cargarLiquidaciones();
  }, []);

  const [citasSemanaTraducida, setCitasSemanaTraducida] = useState([]);

  const traducirDia = (diaIngles) => {
    const dias = {
      Monday: "Lunes",
      Tuesday: "Martes",
      Wednesday: "Miércoles",
      Thursday: "Jueves",
      Friday: "Viernes",
      Saturday: "Sábado",
      Sunday: "Domingo",
    };
    return dias[diaIngles] || diaIngles;
  };

  useEffect(() => {
    const cargarCitasSemana = async () => {
      const manicuristaId = localStorage.getItem("user_id");
      if (!manicuristaId) return;

      try {
        const response = await fetch(
          `https://angelsuarez.pythonanywhere.com/api/cita-venta/citas-venta/citas-semana/?manicurista_id=${manicuristaId}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          const formateadas = data.map((item) => ({
            name: traducirDia(item.name),
            Pendiente: item.Pendiente || 0,
            Terminada: item.Terminada || 0,
          }));

          setCitasSemanaTraducida(formateadas);
        }
      } catch (error) {
        console.error("Error cargando citas de la semana:", error);
      }
    };

    cargarCitasSemana();
  }, []);

  const [consumos, setConsumos] = useState([]);

  useEffect(() => {
    const cargarConsumosReportados = async () => {
      const manicuristaId = localStorage.getItem("user_id");
      if (!manicuristaId) return;

      try {
        const response = await fetch(
          `https://angelsuarez.pythonanywhere.com/api/abastecimiento/abastecimientos/consumos_reportados/?manicurista_id=${manicuristaId}`
        );
        const data = await response.json();

        if (Array.isArray(data)) {
          setConsumos(data);
        }
      } catch (error) {
        console.error("Error cargando consumos reportados:", error);
      }
    };

    cargarConsumosReportados();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="fila-formulario">
        <h1 className="titulo">Gestión dashboard</h1>

        <div className="iconos-perfil">
          <div className="bell-container" onClick={() => openModal("notificaciones")}>
            <span title="Ver tus notificaciones">
              <Bell className="icon" />
            </span>
            {notificacionesNoVistas > 0 && (
              <span className="notification-badge">{notificacionesNoVistas > 99 ? "99+" : notificacionesNoVistas}</span>
            )}
          </div>
          <Link to="/manicurista/dashboard/perfil">
            <span title="Tu perfil">
              <User className="icon" />
            </span>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* NOVEDADES */}
        <div className="card chart-card">
          <div className="card-title">
            <h3>Mis Novedades</h3>
            <FaExclamationTriangle className="icon-medi" />
          </div>
          <div className="timeline">
            {novedades.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-icon">
                  {item.tipo === "Retraso" ? <FaRegCalendarCheck /> : <FaExclamationTriangle />}
                </div>
                <div className="timeline-content">
                  <strong>{item.tipo}</strong>
                  <p>{item.detalle}</p>
                  <span className="date">{item.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SERVICIOS MÁS REALIZADOS SEMANA */}
        <div className="card chart-card">
          <div className="card-title">
            <h3>Servicios que más realice (Semana)</h3>
            <FaStar className="icon-medi" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={serviciosSemana} barSize={30}>
              <XAxis dataKey="servicio" />
              <YAxis domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#ab47bc" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LIQUIDACIONES */}
        <div className="card detail-card">
          <div className="card-title">
            <h3>Mis liquidaciones</h3>
            <FaFileInvoiceDollar className="icon-medi" />
          </div>
          <ul className="detail-list">
            {liquidaciones.map((liq, idx) => (
              <li key={idx} className="detail-item">
                <span>{liq.nombreM}</span>
                <span className="amount">${liq.valor.toLocaleString("es-CO")}</span>
                <span className="date">{liq.fecha}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CONSUMOS */}
        <div className="card detail-card">
          <div className="card-title">
            <h3>Abastecimientos Reportados</h3>
            <FaBoxOpen className="icon-medi" />
          </div>
          <table className="detail-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Cantidad</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {consumos.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.insumo}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.estadoInsumo}</td>
                  <td>{item.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CITAS */}
        <div className="card combined-card chart-card2">
          <div className="card-title">
            <h3>Citas de la Semana</h3>
            <FaRegCalendarCheck className="icon-medi" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={citasSemanaTraducida} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: "#888" }} />
              <YAxis domain={[0, 'dataMax + 1']} />
              <Tooltip formatter={(value, name) => [`${value} citas`, name]} />
              <Bar dataKey="Pendiente" stackId="a" fill="#ffb74d" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Terminada" stackId="a" fill="#4db6ac" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isModalOpen && (
        <div className="overlay-popup-notifications" onClick={closeModal}>
          <div className="ventana-popup-notifications" onClick={(e) => e.stopPropagation()}>
            <div className="contenido-popup-notifications">
              <div className="notifications-header">
                <h1 className="notifications-title">Centro de Notificaciones</h1>
                <button onClick={closeModal} className="close-button">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="tabs-container">
                <button
                  className={`tab-button ${tabActiva === "notificaciones" ? "tab-active" : "tab-inactive"}`}
                  onClick={() => setTabActiva("notificaciones")}
                >
                  <div className="tab-content">
                    <Bell className="w-4 h-4" />
                    Notificaciones
                    {notificacionesNoVistas > 0 && <span className="tab-badge">{notificacionesNoVistas}</span>}
                  </div>
                </button>
              </div>

              {/* Contenido de las pestañas mejorado */}
              <div className="tab-content-container">
                {tabActiva === "notificaciones" && (
                  <div className="tab-panel">
                    <h2 className="section-title">Notificaciones Recientes</h2>
                    {notificaciones.length === 0 ? (
                      <div className="empty-state">
                        <Bell className="empty-icon" />
                        <p>No tienes notificaciones nuevas.</p>
                      </div>
                    ) : (
                      <ul className="notifications-list">
                        {notificaciones.map((n) => (
                          <li
                            key={n.id}
                            className={`notification-item ${!n.visto ? "notification-unread" : "notification-read"}`}
                          >
                            <div className="notification-content">
                              <div className="notification-text">
                                <p className="notification-message">{n.mensaje}</p>
                                <p className="notification-date">{n.fecha}</p>
                              </div>
                              {!n.visto && <span className="notification-dot"></span>}
                            </div>
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
  );
};

export default MedicionManicurista;
