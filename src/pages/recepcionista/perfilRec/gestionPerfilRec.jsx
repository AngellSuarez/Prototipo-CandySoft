import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../css/perfil.css";
import { FaUser, FaEnvelope, FaLock, FaEdit } from 'react-icons/fa';
import { FileText, Hash } from "lucide-react";
import { useTheme } from "../../tema/ThemeContext";

const PerfilRec = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [perfil, setPerfil] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        tipo_documento: '',
        numero_documento: '',
        imagen: 'https://img.freepik.com/vetores-premium/recepcionista-feminina-na-recepcao-ilustracao-vetorial-de-estilo-plano_1142-109276.jpg?semt=ais_hybrid'
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

                const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/usuarios/${userId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al obtener datos del perfil");
                }

                const data = await response.json();
                setPerfil({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    correo: data.correo,
                    tipo_documento: data.tipo_documento,
                    numero_documento: data.numero_documento,
                    imagen: 'https://img.freepik.com/vetores-premium/recepcionista-feminina-na-recepcao-ilustracao-vetorial-de-estilo-plano_1142-109276.jpg?semt=ais_hybrid'
                });

            } catch (error) {
                console.error("Error al cargar perfil:", error);
            }
        };

        fetchPerfil();
    }, []);

    const handleEditarPerfil = () => {
        navigate('/recepcionista/dashboard/perfil/editarPerfil');
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
                        <p><FileText /> <strong>Tipo de documento:</strong> {perfil.tipo_documento}</p>
                        <p><Hash /> <strong>Número de documento:</strong> {perfil.numero_documento}</p>
                        <p><FaUser /> <strong>Nombre completo:</strong> {perfil.nombre} {perfil.apellido}</p>
                        <p><FaEnvelope /> <strong>Correo electrónico:</strong> {perfil.correo}</p>
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

export default PerfilRec;
