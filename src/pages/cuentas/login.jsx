"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../css/formCuentas.css"
import Swal from "sweetalert2"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { login } from "../../services/auth_service"

const Login = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/
        return regex.test(password)
    }

    // Validaciones individuales por campo
    const validateEmailField = () => {
        let message = ""
        if (!email) message = "El correo es obligatorio"
        else if (!validateEmail(email)) message = "Correo no válido"
        setErrors((prev) => ({ ...prev, email: message }))
    }

    const validatePasswordField = () => {
        let message = ""
        if (!password) message = "La contraseña es obligatoria"
        else if (!validatePassword(password)) {
            message = "Debe tener entre 8 y 20 caracteres, incluir letra, número y un carácter especial."
        }
        setErrors((prev) => ({ ...prev, password: message }))
    }

    // Validación completa (solo usada al enviar)
    const validateFields = () => {
        const newErrors = {}

        if (!email) newErrors.email = "El correo es obligatorio"
        else if (!validateEmail(email)) newErrors.email = "Correo no válido"

        if (!password) newErrors.password = "La contraseña es obligatoria"
        else if (!validatePassword(password)) {
            newErrors.password = "Debe tener entre 8 y 20 caracteres, incluir letra, número y un carácter especial."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setErrors({})

        if (!validateFields()) return

        setIsLoading(true)

        Swal.fire({
            title: "Validando datos...",
            text: "Espera un momento por favor",
            customClass: {
                popup: "swal-rosado",
            },
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            },
        })

        try {
            const responseData = await login(email, password)
            Swal.close()
            console.log("Login exitoso:", responseData)

            localStorage.setItem("access_token", responseData.access)
            localStorage.setItem("refresh_token", responseData.refresh)
            localStorage.setItem("user_id", responseData.user_id)
            localStorage.setItem("username", responseData.username)
            localStorage.setItem("nombre", responseData.nombre)
            localStorage.setItem("apellido", responseData.apellido)
            localStorage.setItem("rol", responseData.rol)

            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: "Inicio de sesión exitoso. Redirigiendo...",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    popup: "swal-rosado",
                },
            }).then(() => {
                switch (responseData.rol) {
                    case "Administrador":
                        navigate("/administrador/dashboard")
                        break
                    case "Cliente":
                        navigate("/cliente")
                        break
                    case "Manicurista":
                        navigate("/manicurista/dashboard")
                        break
                    case "Recepcionista":
                        navigate("/recepcionista/dashboard")
                        break
                    default:
                        navigate("/")
                }
            })
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo iniciar sesión. Verifica tus credenciales.",
                customClass: {
                    popup: "swal-rosado",
                },
            }).then(() => {
                const backendMessage = error.message?.toLowerCase()
                const newErrors = {}

                if (backendMessage.includes("correo") || backendMessage.includes("email")) {
                    newErrors.email = "El correo no coincide con ninguna cuenta registrada."
                }
                if (backendMessage.includes("contraseña") || backendMessage.includes("password")) {
                    newErrors.password = "La contraseña es incorrecta."
                }
                if (Object.keys(newErrors).length === 0) {
                    newErrors.general = "Credenciales inválidas. Intenta nuevamente."
                }
                setErrors(newErrors)
            })
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="wrapper">
            <div className="container" style={{ marginTop: "20px" }}>
                {/* Lado izquierdo - Formulario */}
                <div className="left">
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>

                    <div className="back-arrow fade-in delay-0" onClick={() => navigate("/")}>
                        <ArrowLeft size={24} style={{ cursor: "pointer" }} />
                    </div>

                    <div className="header fade-in delay-1">
                        <h2>Candy Nails</h2>
                        <h4>Ingresa tus datos para iniciar sesión</h4>
                    </div>

                    <form className="form" onSubmit={handleLogin}>
                        <div className="form-group fade-in delay-2">
                            <label htmlFor="email">Correo electrónico *</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="form-field-login"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmailField}
                            />
                            {errors.email && <div className="error">{errors.email}</div>}
                        </div>

                        <div className="form-group fade-in delay-3">
                            <label htmlFor="password">Contraseña *</label>
                            <div className="password-field-container">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="form-field-login"
                                    value={password}
                                    maxLength={20}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={validatePasswordField}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                    onDrop={(e) => e.preventDefault()}
                                />
                                {password && (
                                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                )}
                            </div>
                            {errors.password && <div className="error">{errors.password}</div>}
                        </div>

                        {errors.general && <div className="error">{errors.general}</div>}

                        <div className="form-links fade-in delay-4">
                            <p>
                                ¿No tienes cuenta?{" "}
                                <span onClick={() => navigate("/register")} className="link">
                                    Regístrate
                                </span>
                            </p>
                            <p>
                                ¿Olvidaste tu contraseña?{" "}
                                <span onClick={() => navigate("/requerir-codigo")} className="link">
                                    Recupérala
                                </span>
                            </p>
                        </div>

                        <div className="form-buttons fade-in delay-5">
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Iniciando...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lado derecho - Imagen */}
                <div className="right"></div>
            </div>
        </div >
    )
}

export default Login
