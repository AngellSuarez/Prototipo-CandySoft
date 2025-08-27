import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../css/perfil.css";
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaEdit, FaIdBadge, FaHashtag, FaCalendarCheck  } from 'react-icons/fa';
import { useTheme } from "../../tema/ThemeContext";

const PerfilMan = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [perfil, setPerfil] = useState({
        nombre: '',
        apellido: '',
        tipo_documento: '',
        numero_documento: '',
        correo: '',
        celular: '',
        fecha_nacimiento: '',
        fecha_contratacion: '',
        imagen: 'https://cdn-icons-png.flaticon.com/512/2335/2335114.png'
    });

    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                const token = localStorage.getItem("access_token");

                if (!userId || !token) {
                    console.error("Usuario no autenticado.");
                    return;
                }

                const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/manicuristas`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al obtener datos del perfil");
                }

                const data = await response.json();
                const manicurista = data.find(m => m.usuario_id === parseInt(userId));
                console.log(manicurista)
                if (manicurista) {
                    setPerfil({
                        nombre: manicurista.nombre,
                        apellido: manicurista.apellido,
                        tipo_documento: manicurista.tipo_documento,
                        numero_documento: manicurista.numero_documento,
                        correo: manicurista.correo,
                        celular: manicurista.celular,
                        fecha_nacimiento: manicurista.fecha_nacimiento,
                        fecha_contratacion: manicurista.fecha_contratacion,
                        imagen: 'https://cdn-icons-png.flaticon.com/512/2335/2335114.png'
                    });
                }
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            }
        };

        fetchPerfil();
    }, []);

    const handleEditarPerfil = () => {
        navigate('/manicurista/dashboard/perfil/editar');
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`perfil-container ${darkMode ? "dark" : ""}`}>
            <div className="perfil-card">
                <div className="perfil-header">
                    <img
                        src="https://i.pinimg.com/736x/ab/dd/f1/abddf13749e496af6b9bfc5f5bec55e4.jpg"
                        alt="Banner Perfil"
                    />
                </div>

                <h1 className="titulo-perfil">Mi Perfil</h1>
                <p className="subtitulo-perfil">Información personal</p>
                <hr className="linea" />

                <div className="perfil-content">
                    <div className="datos-personal">
                        <p><FaIdBadge /> <strong>Tipo de documento:</strong> {perfil.tipo_documento}</p>
                        <p><FaHashtag /> <strong>Número de documento:</strong> {perfil.numero_documento}</p>
                        <p><FaUser /> <strong>Nombre completo:</strong> {perfil.nombre} {perfil.apellido}</p>
                        <p><FaEnvelope /> <strong>Correo electrónico:</strong> {perfil.correo}</p>
                        <p><FaPhone /> <strong>Teléfono:</strong> {perfil.celular}</p>
                        <p><FaBirthdayCake /> <strong>Fecha de nacimiento:</strong> {perfil.fecha_nacimiento}</p>
                        <p><FaCalendarCheck /> <strong>Fecha de contratación:</strong> {perfil.fecha_contratacion}</p>
                    </div>

                    <div className="perfil-imagen">
                        <img src={perfil.imagen} className="img-perfil" alt="Perfil" />
                    </div>
                </div>

                <button className="btn-crear" onClick={handleEditarPerfil}>
                    <FaEdit /> Editar Perfil
                </button>
            </div>
        </div>
    );
};

export default PerfilMan;
