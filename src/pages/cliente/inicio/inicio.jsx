import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../../css/inicio.css"
import { FiMenu, FiX } from "react-icons/fi"
import Slider from "react-slick"
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa"
import Swal from "sweetalert2"
import { Link } from "react-router-dom"

const Inicio = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [showMenuServicio, setShowMenuServicio] = useState(false)
  const [subMenuServicio, setSubMenuServicio] = useState(null)
  const [submenuPosition, setSubmenuPosition] = useState(0)
  const [menuMobile, setMenuMobile] = useState(false)
  const [servicios, setServicios] = useState([])
  const [serviciosPorTipo, setServiciosPorTipo] = useState({})
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

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
    setMenuMobile(false)

    Swal.fire({
      icon: "warning",
      title: "Inicia sesión",
      text: "Para poder calificar debes iniciar sesión",
      confirmButtonColor: "#8b2752",
      confirmButtonText: "Aceptar",
    })
  }

  const images = [
    "https://laesmalteria.es/wp-content/uploads/2023/09/APLICACION-MANOS-GEL-1024x1024.webp",
    "https://m.media-amazon.com/images/I/61w3QIZ7onL._AC_UF1000,1000_QL80_.jpg",
    "https://i.pinimg.com/736x/85/f8/f4/85f8f49db0557145bddddb7ab41b238c.jpg",
    "https://media.istockphoto.com/id/1461739328/es/foto/primer-plano-de-una-manicura-marr%C3%B3n-en-u%C3%B1as-largas-y-afiladas-sobre-un-fondo-de-flores-con-un.jpg?s=612x612&w=0&k=20&c=qXXHT1dzW5LpRltwRa5PqSpzDr-rmuFXO3H38Bsms28=",
  ]

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  }

  const itemRefs = useRef({})

  useEffect(() => {
    if (subMenuServicio && itemRefs.current[subMenuServicio]) {
      const itemTop = itemRefs.current[subMenuServicio].offsetTop
      setSubmenuPosition(itemTop)
    }
  }, [subMenuServicio])

  const testimonios = [
    {
      nombre: "Laura Mejia.",
      comentario: "Excelente servicio, súper profesionales y muy amables. ¡Me encantó!",
    },
    {
      nombre: "Andrea González.",
      comentario: "Los mejores en uñas y decoración, siempre salgo feliz. Súper recomendados.",
    },
    {
      nombre: "Elizabeth Apaza.",
      comentario: "El spa de tratamientos es una experiencia increíble. Volveré pronto!",
    },
  ]

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

        <div className={`nav-menu ${menuMobile ? "active" : ""}`}>
          <button
            className="nav-inicio"
            onClick={() => {
              setMenuMobile(false)
            }}
          >
            Inicio
          </button>
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
            <div className={`acceso-link ${showMenuServicio ? "active" : ""}`}>
              <Link
                to="/servicios/inicio"
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
            <div className={`acceso-link ${showMenu ? "active" : ""}`}>
              <a
                onClick={() => {
                  setMenuMobile(false)
                }}
              >
                Acceso
              </a>
              <span className={`flecha-acceso ${showMenu ? "rotate" : ""}`}>&#9660;</span>
            </div>

            <div className={`submenu-acceso ${showMenu ? "show" : ""}`}>
              <div className="submenu-item-acceso" onClick={() => navigate("/login")}>
                Iniciar Sesión
              </div>
              <div className="submenu-item-acceso" onClick={() => navigate("/register")}>
                Registrarse
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="banner-container">
        <img
          src="https://media.glamour.mx/photos/6318ee028645b8d42bd2a316/16:9/w_2531,h_1424,c_limit/un%CC%83as_cafes_para_oton%CC%83o.jpg"
          alt="Banner"
          className="banner-image"
        />
      </div>

      <div className="info-container-acceso">
        <div className="info-item-acceso">
          <img
            src="https://media.istockphoto.com/id/183289521/es/foto/n%C3%BAmero-1.jpg?s=612x612&w=0&k=20&c=BwkPyFRoZUdXxNsMv8Guk2LSXhMAqBSisj02Bb6H9es="
            alt="Icono 1"
          />
          <p>Somos el spa de uñas #1 de la Floresta.</p>
        </div>
        <div className="info-item-acceso">
          <img
            src="https://media.istockphoto.com/id/672402512/es/vector/mujer-haciendo-manicura.jpg?s=612x612&w=0&k=20&c=w6MK-JeGHfn3-rjiY1f8dkmKd__fRyEM2Fa39ogmgcY="
            alt="Icono 2"
          />
          <p>Un equipo de manicuristas profesionales.</p>
        </div>
        <div className="info-item-acceso">
          <img
            src="https://static.vecteezy.com/system/resources/previews/011/933/964/non_2x/employee-retention-work-care-silhouette-icon-customer-loyalty-program-black-icon-heart-symbol-customer-company-service-support-assistance-pictogram-isolated-illustration-vector.jpg"
            alt="Icono 3"
          />
          <p>100 clientes atendidos.</p>
        </div>
        <div className="info-item-acceso">
          <img
            src="https://image.made-in-china.com/202f0j00AGDbgIrqEykZ/Professional-Nail-Beauty-Salon-Disposable-Nail-Kit-Pedicure-Manicure-Set.webp"
            alt="Icono 4"
          />
          <p>Procesos rigurosos de desinfección y kit desechable.</p>
        </div>
      </div>

      <div className="carousel-container">
        <h2 className="titulo-carousel">"Las uñas bien cuidadas son la clave para un aspecto impecable"</h2>
        <div className="carousel-acceso">
          <Slider {...settings}>
            {images.map((img, index) => (
              <div key={index} className="carousel-slide">
                <img src={img || "/placeholder.svg"} alt={`slide-${index}`} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="servicios-section">
        <h2 className="titulo-carousel">Nuestros servicios</h2>
        <div className="servicios-container-acceso">
          {servicios.slice(0, 6).map((servicio) => (
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
          <Link to="/servicios/inicio">
            <button type="button" className="btn-crear">
              Todos los servicios
            </button>
          </Link>
          <button
            type="button"
            className="btn-crear"
            onClick={() => {
              Swal.fire({
                icon: "warning",
                title: "Debes iniciar sesión",
                text: "Inicia sesión para poder reservar una cita",
              })
            }}
          >
            Reservar cita
          </button>
        </div>
      </div>

      <div className="carousel-comentarios">
        <h2 className="titulo-carousel">Lo que dicen nuestras clientas</h2>
        <div className="espacio">
          <Slider {...settings}>
            {testimonios.map((item, index) => (
              <div key={index} className="comentario">
                <p className="texto">"{item.comentario}"</p>
                <p className="nombre">- {item.nombre}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-col">
          <h3>¡TU OPINIÓN ES MUY IMPORTANTE, DÉJANOS TU COMENTARIO!</h3>
          <p>
            <i className="fa fa-envelope"></i> servicioalcliente@candy.com
          </p>
          <p>
            <i className="fa fa-phone"></i>3027786523
          </p>
          <button
            className="btn btn-wpp"
            onClick={() => {
              Swal.fire({
                icon: "warning",
                title: "Debes iniciar sesión",
                text: "Inicia sesión para poder enviar un comentario",
                confirmButtonColor: "#7e2952",
                confirmButtonText: "Aceptar",
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
  )
}

export default Inicio
