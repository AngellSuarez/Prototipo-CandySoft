import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiHome, FiUsers, FiTruck, FiShoppingCart, FiClipboard, FiDollarSign,
    FiBriefcase, FiChevronDown, FiChevronRight, FiBox, FiClock, FiCalendar, FiMenu
} from "react-icons/fi";
import { FaStoreAlt, FaStore, FaMoon, FaSun } from "react-icons/fa";
import { FaChartBar, FaMoneyBillTransfer } from "react-icons/fa6";
import { MdAccountCircle, MdInventory, MdLogout, MdShoppingCartCheckout } from "react-icons/md";
import { Tag} from 'lucide-react';
import "../../css/dashboard.css";
import Swal from 'sweetalert2';
import { Outlet } from "react-router-dom";

const BaseCrudRec = () => {
    const [comprasOpen, setComprasOpen] = useState(false);
    const [serviciosOpen, setServiciosOpen] = useState(false);
    const [ventasOpen, setVentasOpen] = useState(false);
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
                        src="https://img.freepik.com/vetores-premium/recepcionista-feminina-na-recepcao-ilustracao-vetorial-de-estilo-plano_1142-109276.jpg?semt=ais_hybrid"
                        alt="Profile"
                        className="profile-pic"
                    />
                    <h3>{nombreUsuario} {apellidoUsuario}</h3>
                    <p>Recepcionista</p>
                </div>
                <hr className={`linea-das ${menuOpen ? "visible" : "hidden"}`} />
                <nav>
                    <ul>
                        <li className="nav-item">
                            <Link to="/recepcionista/dashboard">
                                <FiHome className="icon" />
                                {menuOpen && "Dashboard"}
                                {!menuOpen && <span className="tooltip" style={{ top: "13.3%", left: "70px" }}>Dashboard</span>}
                            </Link>
                        </li>
                        {/* Compras */}
                        <li className="submenu-parent" onClick={() => setComprasOpen(!comprasOpen)}>
                            <div className="submenu-toggle nav-item">
                                <FiShoppingCart className="icon" />
                                {menuOpen && "Compras"}
                                {!menuOpen && <span className="tooltip" style={{ top: "22.5%", left: "70px" }}>Compras</span>}
                                {menuOpen && <span className="arrow">{comprasOpen ? <FiChevronDown /> : <FiChevronRight />}</span>}
                            </div>
                            <ul className={`submenu ${comprasOpen && menuOpen ? "show" : ""}`}>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/marcas">
                                        <Tag className="icon" /> Marcas
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Insumos</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/insumos">
                                        <FiBox className="icon" /> Insumos
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Insumos</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/proveedores">
                                        <FiTruck className="icon" /> Proveedores
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Proveedores</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/compras">
                                        <MdShoppingCartCheckout className="icon" /> Compras
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Compras</span>}
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Servicios */}
                        <li className="submenu-parent" onClick={() => setServiciosOpen(!serviciosOpen)}>
                            <div className="submenu-toggle nav-item">
                                <FaStoreAlt className="icon" />
                                {menuOpen && "Servicios"}
                                {!menuOpen && <span className="tooltip" style={{ top: "30.5%", left: "70px" }}>Servicios</span>}
                                {menuOpen && <span className="arrow">{serviciosOpen ? <FiChevronDown /> : <FiChevronRight />}</span>}
                            </div>
                            <ul className={`submenu ${serviciosOpen && menuOpen ? "show" : ""}`}>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/manicuristas">
                                        <FiUsers className="icon" /> Manicuristas
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Manicuristas</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/servicios">
                                        <FaStore className="icon" /> Servicios
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Servicios</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/abastecimientos">
                                        <MdInventory className="icon" /> Abastecimientos
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Abastecimientos</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/novedades">
                                        <FiClock className="icon" /> Novedades
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Abastecimientos</span>}
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Ventas */}
                        <li className="submenu-parent" onClick={() => setVentasOpen(!ventasOpen)}>
                            <div className="submenu-toggle nav-item">
                                <FiDollarSign className="icon" />
                                {menuOpen && "Ventas"}
                                {!menuOpen && <span className="tooltip" style={{ top: "40%", left: "70px" }}>Ventas</span>}
                                {menuOpen && <span className="arrow">{ventasOpen ? <FiChevronDown /> : <FiChevronRight />}</span>}
                            </div>
                            <ul className={`submenu ${ventasOpen && menuOpen ? "show" : ""}`}>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/clientes">
                                        <FiUsers className="icon" /> Clientes
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Clientes</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/citas">
                                        <FiCalendar className="icon" /> Citas
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Citas</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/ventas">
                                        <FaMoneyBillTransfer className="icon" /> Ventas
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Abastecimientos</span>}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/recepcionista/dashboard/liquidaciones">
                                        <FiClipboard className="icon" /> Liquidaciones
                                        {!menuOpen && <span className="tooltip" style={{ top: "50%", left: "80px" }}>Abastecimientos</span>}
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <hr className="linea-dashboard" />
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
                                        style={{ top: "49.2%", left: "70px" }}
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
                                {!menuOpen && <span className="tooltip" style={{ top: "58%", left: "70px" }}>Cerrar Sesión</span>}
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

export default BaseCrudRec;
