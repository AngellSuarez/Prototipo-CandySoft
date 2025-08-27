import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react';
import '../../../css/servicio.css'
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ServicioDetalle = () => {
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const { id } = useParams()
    const location = useLocation();
    const [menuMobile, setMenuMobile] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showMenuServicio, setShowMenuServicio] = useState(false);
    const [subMenuServicio, setSubMenuServicio] = useState(null);
    const itemRefs = useRef({});
    const [submenuPosition, setSubmenuPosition] = useState(0);
    const [servicio, setServicio] = useState(null)
    const [servicioLoading, setServicioLoading] = useState(true)
    const [servicioError, setServicioError] = useState(null)
    const [servicios, setServicios] = useState([])
    const [serviciosLoading, setServiciosLoading] = useState(true)
    const [serviciosError, setServiciosError] = useState(null)
    const [serviciosPorTipo, setServiciosPorTipo] = useState({})

    useEffect(() => {
        const fetchCliente = async () => {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('access_token');

            try {
                const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/clientes/${userId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('No se pudo obtener la información del cliente');
                const data = await response.json();
                setCliente(data);

            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo cargar tu perfil, inicia de nuevo sesión', 'error');
            }
        };

        fetchCliente();
    }, []);

    useEffect(() => {
        const fetchServicio = async () => {
            try {
                setServicioLoading(true)
                const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/servicio/servicio/${id}/`)
                if (response.ok) {
                    const data = await response.json()
                    setServicio(data)
                } else {
                    setServicioError("Servicio no encontrado")
                }
            } catch (error) {
                console.error("Error fetching servicio:", error)
                setServicioError("Error al cargar el servicio")
            } finally {
                setServicioLoading(false)
            }
        }

        if (id) {
            fetchServicio()
        }
    }, [id])

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                setServiciosLoading(true)
                const response = await fetch("https://angelsuarez.pythonanywhere.com/api/servicio/servicio/")
                if (response.ok) {
                    const data = await response.json()
                    setServicios(data)

                    const serviciosActivos = data.filter((servicio) => servicio.estado === "Activo")

                    const grouped = serviciosActivos.reduce((acc, servicio) => {
                        if (!acc[servicio.tipo]) {
                            acc[servicio.tipo] = []
                        }
                        acc[servicio.tipo].push(servicio)
                        return acc
                    }, {})

                    setServiciosPorTipo(grouped)
                } else {
                    const errorMsg = `Error al cargar los servicios: ${response.statusText}`
                    console.error(errorMsg)
                    setServiciosError(errorMsg)
                }
            } catch (error) {
                console.error("Error fetching servicios:", error)
                setServiciosError("Error al cargar los servicios")
            } finally {
                setServiciosLoading(false)
            }
        }

        fetchServicios()
    }, [])

    useEffect(() => {
        if (subMenuServicio && itemRefs.current[subMenuServicio]) {
            const itemTop = itemRefs.current[subMenuServicio].offsetTop
            setSubmenuPosition(itemTop)
        }
    }, [subMenuServicio])

    if (servicioLoading)
        return (
            <div className="loading-container">
                <p>Cargando servicio...</p>
            </div>
        )
    if (servicioError)
        return (
            <div className="error-container">
                <p>{servicioError}</p>
            </div>
        )
    if (!servicio)
        return (
            <div className="error-container">
                <p>Servicio no encontrado</p>
            </div>
        )

    if (serviciosLoading)
        return (
            <div className="loading-container">
                <p>Cargando servicios...</p>
            </div>
        )
    if (serviciosError)
        return (
            <div className="error-container">
                <p>{serviciosError}</p>
            </div>
        )

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
                    <Link to="/cliente" onClick={() => { setMenuMobile(false); }}>Inicio</Link>
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
                        <div className={`acceso-link ${(showMenuServicio || location.pathname.startsWith('/cliente/servicios/')) ? 'active' : ''}`}>
                            <Link
                                to="/cliente/servicios/"
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
                        <div className={`acceso-link ${showMenu ? 'active' : ''}`}>
                            <a onClick={() => { setMenuMobile(false); }}>{cliente?.nombre} {cliente?.apellido}</a>
                            <span className={`flecha-acceso ${showMenu ? 'rotate' : ''}`}>&#9660;</span>
                        </div>

                        <div className={`submenu-acceso ${showMenu ? 'show' : ''}`}>
                            <div className="submenu-item-acceso" onClick={() => { setMenuMobile(false); navigate('/cliente/perfil'); }}>
                                Perfil
                            </div>
                            <div className="submenu-item-acceso" onClick={() => { setMenuMobile(false); navigate('/cliente/citas/ver'); }}>
                                Ver mis citas
                            </div>
                            <div
                                className="submenu-item-acceso"
                                onClick={() => {
                                    Swal.fire({
                                        title: '¿Estás seguro?',
                                        text: "¿Quieres cerrar sesión?",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        reverseButtons: true,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Sí, cerrar sesión',
                                        cancelButtonText: 'Cancelar'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            navigate('/');
                                        }
                                    });
                                }}
                            >
                                Cerrar sesión
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="servicio-detalle">
                <div className="servicio-detalle-img">
                    <img
                        src={servicio.url_imagen || "/placeholder.svg?height=400&width=600"}
                        alt={servicio.nombre}
                        onError={(e) => {
                            e.target.src = "/placeholder.svg?height=400&width=600"
                        }}
                    />
                </div>

                <div className="servicio-detalle-info">
                    <h1>{servicio.nombre}</h1>
                    <p className="servicio-descripcion">{servicio.descripcion}</p>
                    <p className="servicio-tipo-detalle">{servicio.tipo}</p>
                    <div className='fila-formulario'>
                        <p className="servicio-precio"><strong>Precio:  </strong>
                            {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                            }).format(Number.parseFloat(servicio.precio))}
                        </p>
                        <p className="servicio-duracion"><strong>Duración:</strong> {servicio.duracion}</p>
                    </div>
                    <Link to='/cliente/citas/crear'>
                        <button type='button' className='Reserva' style={{ marginTop: "40px" }}>
                            Reserva tu cita
                        </button>
                    </Link>
                </div>
            </div>
            <footer className="footer">
                <div className="footer-col">
                    <h3>¡TU OPINIÓN ES MUY IMPORTANTE, DÉJANOS TU COMENTARIO!</h3>
                    <p><i className="fa fa-envelope"></i> servicioalcliente@candy.com</p>
                    <p><i className="fa fa-phone"></i>3027786523</p>
                    <Link to="/cliente/calificanos">
                        <button className="btn btn-wpp">ENVIAR COMENTARIO</button>
                    </Link>
                </div>
                <div className="footer-col">
                    <h3>NUESTROS SERVICIOS</h3>
                    <ul>
                        <li>♥ Manicure tradicional.</li>
                        <li>♥ Semipermanente.</li>
                        <li>♥ Extensión de uñas acrílicas.</li>
                        <li>♥ Decoración a mano alzada.</li>
                        <li>♥ Pedicure.</li>
                        <li>♥ Spa de tratamientos.</li>
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
    )
}

export default ServicioDetalle
