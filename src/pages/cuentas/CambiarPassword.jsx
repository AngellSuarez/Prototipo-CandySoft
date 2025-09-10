import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import "../../css/formCuentas.css";
import axios from "axios";

const CambiarPassword = () => {
    const navigate = useNavigate();

    const [correo, setCorreo] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validar = () => {
        const newErrors = {};

        if (!correo) newErrors.correo = "El correo es obligatorio";
        if (!nuevaPassword) newErrors.nuevaPassword = "La contraseña es obligatoria";
        else if (nuevaPassword.length < 8)
            newErrors.nuevaPassword = "Debe tener al menos 8 caracteres";

        if (!confirmarPassword) newErrors.confirmarPassword = "Confirma tu contraseña";
        else if (nuevaPassword !== confirmarPassword)
            newErrors.confirmarPassword = "Las contraseñas no coinciden";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({ correo: true, nuevaPassword: true, confirmarPassword: true });

        if (!validar()) return;

        try {
            await axios.post("https://angelsuarez.pythonanywhere.com/api/auth/password/cambiar/", {
                correo,
                nueva_password: nuevaPassword,
            });

            Swal.fire({
                icon: "success",
                title: "¡Contraseña cambiada exitosamente!",
                text: "Redirigiendo al inicio de sesión...",
                timer: 2500,
                showConfirmButton: false,
                customClass: {
                    popup: 'swal-rosado'
                }
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al cambiar la contraseña",
                text: "Verifica el correo o intenta más tarde.",
                customClass: {
                    popup: 'swal-rosado'
                }
            });
        }
    };

    return (
        <div className="wrapper">
            <div className="container" style={{ marginTop: "40px" }}>
                <div className="left">
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>

                    <div className="back-arrow fade-in delay-0" onClick={() => navigate("/")}>
                        <ArrowLeft size={24} style={{ cursor: "pointer" }} />
                    </div>
                    <div className="header fade-in delay-1">
                        <h2 className="animation a1">Cambiar contraseña</h2>
                        <h4 className="animation a2">Ingresa los datos requeridos</h4>
                    </div>

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="fila-formulario fade-in delay-2">
                            <div className="form-group">
                                <label htmlFor="email">Correo electrónico</label>
                                <input
                                    type="email"
                                    placeholder="Correo electrónico *"
                                    className="form-field-login animation a3"
                                    style={{ marginTop: "-1px" }}
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    onBlur={() => {
                                        setTouched((prev) => ({ ...prev, correo: true }));
                                        validar();
                                    }}
                                />
                                {touched.correo && errors.correo && <span className="error">{errors.correo}</span>}
                            </div>

                            <div className="password-field-container animation a4">
                                <div className="form-group">
                                    <label htmlFor="email">Nueva contraseña</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nueva contraseña *"
                                        className="form-field-login"
                                        style={{ marginTop: "-1px" }}
                                        value={nuevaPassword}
                                        onChange={(e) => setNuevaPassword(e.target.value)}
                                        onBlur={() => {
                                            setTouched((prev) => ({ ...prev, nuevaPassword: true }));
                                            validar();
                                        }}
                                    />
                                    {nuevaPassword && (
                                        <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {touched.nuevaPassword && errors.nuevaPassword && <span className="error">{errors.nuevaPassword}</span>}
                        </div>

                        <div className="password-field-container animation a5">
                            <div className="form-group fade-in delay-3">
                                <label htmlFor="email">Confirmar contraseña</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirmar contraseña *"
                                    style={{ marginTop: "-1px" }}
                                    className="form-field-login"
                                    value={confirmarPassword}
                                    onChange={(e) => setConfirmarPassword(e.target.value)}
                                    onBlur={() => {
                                        setTouched((prev) => ({ ...prev, confirmarPassword: true }));
                                        validar();
                                    }}
                                />
                                {confirmarPassword && (
                                    <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                )}
                            </div>
                        </div>
                        {touched.confirmarPassword && errors.confirmarPassword && (
                            <span className="error">{errors.confirmarPassword}</span>
                        )}

                        <div className="form-buttons fade-in delay-4">
                            <button type="submit" className="btn btn-primary">
                                Cambiar contraseña
                            </button>
                        </div>
                    </form>
                </div>

                <div className="right"></div>
            </div>
        </div>
    );
};

export default CambiarPassword;
