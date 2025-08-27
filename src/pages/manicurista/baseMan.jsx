import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiHome, FiClipboard, FiClock, FiCalendar, FiMenu
} from "react-icons/fi";
import { FaChartBar, FaMoon, FaSun } from "react-icons/fa6";
import { MdInventory, MdLogout } from "react-icons/md";
import "../../css/dashboard.css";
import Swal from 'sweetalert2';
import { Outlet } from "react-router-dom";

const BaseCrudMan = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const nombreUsuario = localStorage.getItem("nombre") || "Usuario";
    const apellidoUsuario = localStorage.getItem("apellido") || "Usuario";

    const [darkMode, setDarkMode] = useState(() => {
        const storedTheme = localStorage.getItem("darkMode");
        return storedTheme === "true";
    });

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode);
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    const handleLogoutConfirm = () => {
        Swal.fire({
            title: '¿Estás segura de cerrar sesión?',
            text: 'Tu sesión se cerrará y deberás volver a iniciar para acceder al sistema.',
            icon: 'warning',
            showCancelButton: true,
            reverseButtons: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, cerrar sesión',
            customClass: {
                popup: 'swal-cerrar-sesion'
            }
        })
            .then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    navigate("/");
                }
            });
    };

    return (
        <div className={`base-container ${menuOpen ? "menu-expanded" : "menu-collapsed"} ${darkMode ? "dark-mode" : "light-mode"}`}>
            <button className="menu-toggle nav-item" onClick={() => setMenuOpen(!menuOpen)}>
                <FiMenu className="icon" />
                {!menuOpen && <span className="tooltip" style={{ top: "20%", left: "40px" }}>Abrir menú</span>}
            </button>

            <aside className={`sidebar ${menuOpen ? "open" : "closed"} ${darkMode ? "dark-mode" : ""}`}>
                {menuOpen && <h2 className="titulo-das">Candy Nails</h2>}
                <div className={`profile-section ${menuOpen ? "visible" : "hidden"}`}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2335/2335114.png"
                        alt="Profile"
                        className="profile-pic"
                    />
                    <h3>{nombreUsuario} {apellidoUsuario}</h3>
                    <p>Manicurista</p>
                </div>
                <hr className={`linea-das ${menuOpen ? "visible" : "hidden"}`} />
                <nav>
                    <ul>
                        <li className="nav-item">
                            <Link to="/manicurista/dashboard">
                                <FiHome className="icon" />
                                {menuOpen && "Dashboard"}
                                {!menuOpen && <span className="tooltip" style={{ top: "13.3%", left: "70px" }}>Dashboard</span>}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/manicurista/dashboard/novedades">
                                <FiClock className="icon" />
                                {menuOpen && "Novedades"}
                                {!menuOpen && <span className="tooltip" style={{ top: "21.7%", left: "80px" }}>Novedades</span>}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/manicurista/dashboard/citas">
                                <FiCalendar className="icon" />
                                {menuOpen && "Citas"}
                                {!menuOpen && <span className="tooltip" style={{ top: "30.8%", left: "80px" }}>Citas</span>}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/manicurista/dashboard/liquidaciones">
                                <FiClipboard className="icon" />
                                {menuOpen && "Liquidaciones"}
                                {!menuOpen && <span className="tooltip" style={{ top: "39.5%", left: "80px" }}>Liquidaciones</span>}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/manicurista/dashboard/abastecimientos">
                                <MdInventory className="icon" /> 
                                {menuOpen && "Abastecimientos"}
                                {!menuOpen && <span className="tooltip" style={{ top: "48%", left: "80px" }}>Abastecimientos</span>}
                            </Link>
                        </li>
                        <hr />
                        <li className="nav-item">
                            <Link
                                to="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setDarkMode(!darkMode);
                                }}
                            >
                                {darkMode ? (
                                    <FaSun className="icon" />
                                ) : (
                                    <FaMoon className="icon" />
                                )}
                                {menuOpen && (darkMode ? "Modo Claro" : "Modo Oscuro")}
                                {!menuOpen && (
                                    <span
                                        className="tooltip"
                                        style={{ top: "58%", left: "70px" }}
                                    >
                                        {darkMode ? "Modo Claro" : "Modo Oscuro"}
                                    </span>
                                )}
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="#" onClick={(e) => {
                                e.preventDefault();
                                handleLogoutConfirm();
                            }}>
                                <MdLogout className="icon" /> {menuOpen && "Cerrar Sesión"}
                                {!menuOpen && <span className="tooltip" style={{ top: "67%", left: "70px" }}>Cerrar Sesión</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className={`base-content ${darkMode ? "dark-mode" : ""}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default BaseCrudMan;
