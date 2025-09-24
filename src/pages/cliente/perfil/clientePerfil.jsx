import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiMenu, FiX } from 'react-icons/fi';

const ClientePerfil = () => {
    const [cliente, setCliente] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [menuMobile, setMenuMobile] = useState(false);
    const [submenuPosition, setSubmenuPosition] = useState(0);
    const [servicios, setServicios] = useState([])
    const [serviciosPorTipo, setServiciosPorTipo] = useState({});
    const [showMenu, setShowMenu] = useState(false);
    const [showMenuServicio, setShowMenuServicio] = useState(false);
    const [subMenuServicio, setSubMenuServicio] = useState(null);
    const itemRefs = useRef({});
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate();

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
                Swal.fire('Error', 'No se pudo cargar tu perfil', 'error');
            }
        };

        fetchCliente();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCliente((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('access_token');

        try {
            const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/clientes/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cliente),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = Object.values(errorData).flat().join(', ');
                throw new Error(errorMsg || 'Error al actualizar');
            }

            const updatedData = await response.json();
            setCliente(updatedData);
            setIsEditing(false);

            Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success').then(() => {
                navigate('/cliente');
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', `No se pudo actualizar: ${error.message}`, 'error');
        }
    };

    if (!cliente) return null;

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
                    <Link to="/cliente" onClick={() => setMenuMobile(false)}>Inicio</Link>
                    <span>|</span>
                    <Link to="/cliente/Nosotros" onClick={() => setMenuMobile(false)}>Nosotros</Link>
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
                    <Link to="/cliente/calificanos" onClick={() => setMenuMobile(false)}>Califícanos</Link>
                    <span>|</span>

                    <div
                        className="acceso-wrapper"
                        onMouseEnter={() => !menuMobile && setShowMenu(true)}
                        onMouseLeave={() => !menuMobile && setShowMenu(false)}
                        onClick={() => menuMobile && setShowMenu(!showMenu)}
                    >
                        <div className={`acceso-link ${showMenu ? 'active' : ''}`}>
                            <a>{cliente?.nombre} {cliente?.apellido}</a>
                            <span className={`flecha-acceso ${showMenu ? 'rotate' : ''}`}>&#9660;</span>
                        </div>

                        <div className={`submenu-acceso ${showMenu ? 'show' : ''}`}>
                            <div className="submenu-item-acceso" onClick={() => { navigate('/cliente/perfil'); setMenuMobile(false); }}>Perfil</div>
                            <div className="submenu-item-acceso" onClick={() => { navigate('/cliente/citas/ver'); setMenuMobile(false); }}>Ver mis citas</div>
                            <div className="submenu-item-acceso" onClick={() => {
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
                            }}>Cerrar sesión</div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="perfil-cliente-container">
                <div className="perfil-cliente-imagen">
                    <img src="https://i.pinimg.com/originals/4a/0c/af/4a0caf8a8e5c9ac676d601b81a572063.png" alt="Cliente" />
                </div>
                <div className="perfil-cliente-info">
                    <h1>Mi Perfil</h1>
                    <p>Aquí podrás ver y editar tu información.</p>

                    <form className="perfil-cliente-form">
                        <div className="perfil-cliente-campo">
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={cliente.nombre} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="perfil-cliente-campo">
                            <label>Apellido:</label>
                            <input type="text" name="apellido" value={cliente.apellido} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="perfil-cliente-campo">
                            <label>Tipo de Documento:</label>
                            <input type="text" name="tipo_documento" value={cliente.tipo_documento} disabled />
                        </div>
                        <div className="perfil-cliente-campo">
                            <label>Documento:</label>
                            <input type="text" name="numero_documento" value={cliente.numero_documento} disabled />
                        </div>
                        <div className="perfil-cliente-campo">
                            <label>Correo:</label>
                            <input type="email" name="correo" value={cliente.correo} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="perfil-cliente-campo">
                            <label>Celular:</label>
                            <input type="text" name="celular" value={cliente.celular || ''} onChange={handleChange} disabled={!isEditing} />
                        </div>

                        {!isEditing ? (
                            <button type="button" onClick={() => setIsEditing(true)} className="btn-crear">
                                Editar
                            </button>
                        ) : (
                            <button type="button" onClick={handleSave} className="btn-crear">
                                Guardar
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default ClientePerfil;
