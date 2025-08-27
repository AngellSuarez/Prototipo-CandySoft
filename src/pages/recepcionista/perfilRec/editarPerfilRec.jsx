import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Hash } from "lucide-react";
import "../../../css/perfil.css";
import { useTheme } from "../../tema/ThemeContext";
import {
    FaUser, FaEnvelope, FaLock, FaSave, FaArrowLeft, FaImage
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const EditarPerfilRec = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        tipo_documento: '',
        numero_documento: '',
        contraseña: '',
        confirmarContraseña: '',
        imagen: ''
    });

    useEffect(() => {
        const fetchPerfil = async () => {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('access_token');
            if (!userId || !token) return;

            try {
                const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/usuarios/${userId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('No se pudo cargar el perfil');

                const data = await response.json();
                setFormData({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    correo: data.correo || '',
                    tipo_documento: data.tipo_documento || '',
                    numero_documento: data.numero_documento || '',
                    contraseña: '',
                    confirmarContraseña: '',
                    imagen: ''
                });

            } catch (error) {
                console.error("Error al cargar perfil:", error);
            }
        };

        fetchPerfil();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === "nombre" || name === "apellido" || name === 'tipo-documento' || name === 'numero_documento' || name === "contraseña" || name === "confirmarContraseña") && value.length > 20) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imagen: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validarContraseña = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
        return regex.test(password);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        const { nombre, apellido, correo, tipo_documento, numero_documento, contraseña, confirmarContraseña } = formData;

        if (!nombre || !apellido || !correo || !tipo_documento || !numero_documento) {
            Swal.fire('Campos obligatorios', 'Por favor completa todos los campos obligatorios.', 'warning');
            return;
        }

        if (contraseña) {
            if (!validarContraseña(contraseña)) {
                Swal.fire(
                    'Contraseña inválida',
                    'Debe tener entre 8 y 20 caracteres, incluir una letra, un número y un carácter especial.',
                    'error'
                );
                return;
            }

            if (contraseña !== confirmarContraseña) {
                Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
                return;
            }
        }

        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('access_token');
        if (!userId || !token) return;

        const payload = {
            nombre,
            apellido,
            correo,
            tipo_documento,
            numero_documento,
        };

        if (contraseña) {
            payload.password = contraseña;
        }

        try {
            const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/usuario/usuarios/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error al guardar cambios');

            Swal.fire({
                icon: 'success',
                title: 'Perfil actualizado',
                text: 'Datos actualizados correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            setTimeout(() => {
                navigate('/recepcionista/dashboard/perfil');
            }, 1500);

        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el perfil',
            });
        }

    };

    const handleCancelar = () => {
        navigate('/recepcionista/dashboard/perfil');
    };

    return (
        <div className={`perfil-container ${darkMode ? "dark" : ""}`}>
            <div className="perfil-card">
                <div className="perfil-header">
                    <img src="https://i.pinimg.com/736x/ab/dd/f1/abddf13749e496af6b9bfc5f5bec55e4.jpg" alt="Banner Perfil" />
                </div>

                <h1 className="titulo-perfil">Editar Perfil</h1>
                <p className="subtitulo-perfil">Modifica tu información personal</p>
                <hr className="linea" />

                <form className="perfil-formulario" onSubmit={handleGuardar}>
                    <div className="perfil-content">
                        <div className="datos-personal">
                            <div className='fila-formulario'>
                                <div className="form-group">
                                    <label><FileText /> Tipo de documento:</label>
                                    <select
                                        name="tipo_documento"
                                        value={formData.tipo_documento}
                                        onChange={handleChange}
                                        required
                                        disabled
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="CC">Cédula de ciudadanía</option>
                                        <option value="CE">Cédula de extranjería</option>
                                        <option value="PA">Pasaporte</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><Hash /> Número de documento:</label>
                                    <input disabled type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} required maxLength={15} />
                                </div>
                            </div>
                            <div className='fila-formulario'>
                                <div className="form-group">
                                    <label><FaUser /> Nombre:</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required maxLength={40} />
                                </div>

                                <div className="form-group">
                                    <label><FaUser /> Apellido:</label>
                                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required maxLength={40} />
                                </div>
                            </div>
                            <div className='fila-formulario'>
                                <div className="form-group">
                                    <label><FaEnvelope /> Correo electrónico:</label>
                                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                                </div>

                                <div className="form-group">
                                    <label><FaLock /> Nueva contraseña:</label>
                                    <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} maxLength={20} placeholder="Nueva contraseña (opcional)" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FaLock /> Confirmar contraseña:</label>
                                <input type="password" name="confirmarContraseña" value={formData.confirmarContraseña} onChange={handleChange} maxLength={20} placeholder="Solo si cambiaras la contraseña" />
                            </div>
                        </div>

                        <div className="perfil-imagen">
                            <img
                                src={formData.imagen || "https://img.freepik.com/vetores-premium/recepcionista-feminina-na-recepcao-ilustracao-vetorial-de-estilo-plano_1142-109276.jpg?semt=ais_hybrid"}
                                className="img-perfil"
                                alt="Perfil"
                            />
                            <label className="cambiar-imagen">
                                <FaImage /> Cambiar imagen
                                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                            </label>
                        </div>
                    </div>

                    <div className="botones-editar">
                        <button type="button" className="btn-cancelar" onClick={handleCancelar}>
                            <FaArrowLeft /> Cancelar
                        </button>
                        <button type="submit" className="btn-crear">
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarPerfilRec;
