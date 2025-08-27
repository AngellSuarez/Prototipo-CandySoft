import { useState, useRef, useEffect } from "react"
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import "../../../css/inicio.css";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ServiciosInicio = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuMobile, setMenuMobile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showMenuServicio, setShowMenuServicio] = useState(false);
    const [subMenuServicio, setSubMenuServicio] = useState(null);
    const itemRefs = useRef({});
    const [submenuPosition, setSubmenuPosition] = useState(0);
    const [servicios, setServicios] = useState([])
    const [serviciosPorTipo, setServiciosPorTipo] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await fetch("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
                if (response.ok) {
                    const data = await response.json()
                    const serviciosActivos = data.filter((servicio) => servicio.estado === "Activo")
                    setServicios(serviciosActivos)

                    const grouped = serviciosActivos.reduce((acc, servicio) => {
                        if (!acc[servicio.tipo]) {
                            acc[servicio.tipo] = []
                        }
                        acc[servicio.tipo].push(servicio)
                        return acc
                    }, {})

                    setServiciosPorTipo(grouped)
                } else {
                    console.error("Error fetching servicios:", response.statusText)
                }
            } catch (error) {
                console.error("Error fetching servicios:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchServicios()
    }, [])

    const handleClick = () => {
        setMenuMobile(false);

        Swal.fire({
            icon: 'warning',
            title: 'Inicia sesión',
            text: 'Para poder calificar debes iniciar sesión',
            confirmButtonColor: '#8b2752',
            confirmButtonText: 'Aceptar'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number.parseFloat(price))
    }

    const handleImageError = (e) => {
        e.target.src = "/placeholder.svg?height=200&width=300"
    }

    if (loading) return null

    return (
        <>
            <nav className="nav-container">
                <div className="perfil-header">
                    <img src="https://i.pinimg.com/736x/ab/dd/f1/abddf13749e496af6b9bfc5f5bec55e4.jpg" alt="Logo" />
                    <button className="menu-toggle2" onClick={() => setMenuMobile(!menuMobile)}>
                        {menuMobile ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                <div className={`nav-menu ${menuMobile ? 'active' : ''}`}>
                    <Link to="/" onClick={() => { setMenuMobile(false); }}>Inicio</Link>
                    <span>|</span>
                    <Link to="/nosotros/inicio" onClick={() => setMenuMobile(false)}>
                        Nosotros
                    </Link>
                    <span>|</span>

                    <div
                        className="acceso-wrapper"
                        onMouseEnter={() => !menuMobile && setShowMenuServicio(true)}
                        onMouseLeave={() => !menuMobile && setShowMenuServicio(false)}
                    >
                        <div className={`acceso-link ${(showMenuServicio || location.pathname.startsWith('/servicios/inicio')) ? 'active' : ''}`}>
                            <Link
                                to="/servicios/inicio"
                                onClick={() => {
                                    setMenuMobile(false);
                                    setShowMenuServicio(!showMenuServicio);
                                }}
                            >
                                Servicios
                            </Link>
                            <span className={`flecha-acceso ${showMenuServicio ? 'rotate' : ''}`}>&#9660;</span>
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
                                                        navigate(`/servicios/detalles/inicio/${servicio.id}`)
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
                    <a onClick={handleClick}>Califícanos</a>
                    <span>|</span>

                    <div
                        className="acceso-wrapper"
                        onMouseEnter={() => !menuMobile && setShowMenu(true)}
                        onMouseLeave={() => !menuMobile && setShowMenu(false)}
                        onClick={() => menuMobile && setShowMenu(!showMenu)}
                    >
                        <div className={`acceso-link ${showMenu ? 'active' : ''}`}>
                            <a onClick={() => { setMenuMobile(false); }}>Acceso</a>
                            <span className={`flecha-acceso ${showMenu ? 'rotate' : ''}`}>&#9660;</span>
                        </div>

                        <div className={`submenu-acceso ${showMenu ? 'show' : ''}`}>
                            <div className="submenu-item-acceso" onClick={() => navigate('/login')}>
                                Iniciar Sesión
                            </div>
                            <div className="submenu-item-acceso" onClick={() => navigate('/register')}>
                                Registrarse
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div>
                <h2 className='titulo-ser'>Conoce todos nuestros servicios</h2>
                <div className='info-servicio-principio'>
                    <p>"Descubre todos los servicios que tenemos para que tus manos y pies luzcan siempre perfectos. ¡Estamos aquí para cuidar cada detalle de tu estilo!"</p>
                </div>


            </div>

            <div className="servicios-section">
                <div className="servicios-container-acceso">
                    {servicios.slice(0, 35).map((servicio) => (
                        <Link key={servicio.id} to={`/servicios/detalles/inicio/${servicio.id}`}>
                            <div className="servicio-tarjeta">
                                <h3 className="servicio-nombre">{servicio.nombre}</h3>
                                <img
                                    src={servicio.url_imagen}
                                    alt={servicio.nombre}
                                    onError={handleImageError}
                                />
                                <p className="servicio-precio">{formatPrice(servicio.precio)}</p>
                                <p className="servicio-tipo">{servicio.tipo}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="button-container">
                    <button
                        type='button'
                        className='btn-crear'
                        onClick={() => {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Debes iniciar sesión',
                                text: 'Inicia sesión para poder reservar una cita',
                            })
                        }}
                    >
                        Reservar cita
                    </button>
                </div>
            </div>

            <footer className="footer">
                <div className="footer-col">
                    <h3>¡TU OPINIÓN ES MUY IMPORTANTE, DÉJANOS TU COMENTARIO!</h3>
                    <p><i className="fa fa-envelope"></i> servicioalcliente@candy.com</p>
                    <p><i className="fa fa-phone"></i>3027786523</p>
                    <button
                        className="btn btn-wpp"
                        onClick={() => {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Debes iniciar sesión',
                                text: 'Inicia sesión para poder enviar un comentario',
                                confirmButtonColor: '#7e2952',
                                confirmButtonText: 'Aceptar'
                            })
                        }}
                    >
                        ENVIAR COMENTARIO
                    </button>
                </div>
                <div className="footer-col">
                    <h3>NUESTROS SERVICIOS</h3>
                    <ul>
                        {servicios.slice(0, 6).map((servicio) => (
                            <li key={servicio.id}>♥ {servicio.nombre}</li>
                        ))}
                    </ul>
                </div>

                <div className="footer-col">
                    <h3>NUESTRA POLÍTICAS</h3>
                    <ul>
                        <li>Política de privacidad</li>
                        <li>Política de derechos de admisión</li>
                        <li>Política de devolución de dinero</li>
                    </ul>

                    <h3>NUESTRAS REDES</h3>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                            <FaFacebookF />
                        </a>
                        <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">
                            <FaTiktok />
                        </a>
                        <a href="https://wa.me/573007787515" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp />
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default ServiciosInicio;
