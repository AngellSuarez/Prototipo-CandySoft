"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../../css/formCuentas.css" // Asegúrate de que este CSS maneje los .form-row
import Swal from "sweetalert2"
import { Eye, EyeOff } from "lucide-react"
import { register } from "../../services/auth_service" // Importa la función de registro

const Registro = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "", // Cambiar de "email" a "correo"
    password: "",
    confirmPassword: "",
    tipo_documento: "CC",
    numero_documento: "",
    celular: "",
    username: "",
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})
  const tiposDocumento = ["CC", "CE", "TI", "RC", "PA"]

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    return regex.test(email)
  }

  const getNombreError = (value) => {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) return "El nombre es obligatorio."
    if (trimmedValue.length < 3) return "Debes tener mínimo 3 caracteres."
    if (trimmedValue.length > 20) return "Has alcanzado el máximo de 20 caracteres."
    return null
  }

  const getApellidoError = (value) => {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) return "El apellido es obligatorio."
    if (trimmedValue.length < 3) return "Debes tener mínimo 3 caracteres."
    if (trimmedValue.length > 20) return "Has alcanzado el máximo de 20 caracteres."
    return null
  }

  const getUsernameError = (value) => {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) return "El nombre de usuario es obligatorio."
    if (trimmedValue.length > 20) return "Has alcanzado el máximo de 20 caracteres."
    return null
  }

  const getNumeroDocumentoError = (value) => {
    const trimmedValue = value.trim()
    if (trimmedValue.length === 0) return "El número de documento es obligatorio."
    if (trimmedValue.length < 6) return "Debes tener mínimo 6 caracteres."
    if (trimmedValue.length > 15) return "Has alcanzado el máximo de 15 caracteres."
    return null
  }

  const getPasswordError = (value) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d@$!%*?&.,;:+-_#]{8,20}$/
    if (value.length === 0) return "La contraseña es obligatoria."
    if (!passwordRegex.test(value))
      return "Debe tener entre 8 y 20 caracteres, incluir letra, número y un carácter especial."
    if (value.length > 20) return "Has alcanzado el máximo de 20 caracteres."
    return null
  }

  const getConfirmPasswordError = (value, password) => {
    if (value.length === 0) return "Debes confirmar la contraseña."
    if (value !== password) return "Las contraseñas no coinciden."
    if (value.length > 20) return "Has alcanzado el máximo de 20 caracteres."
    return null
  }

  const checkDuplicatedFields = async ({ username, numero_documento }) => {
    try {
      const response = await fetch("https://angelsuarez.pythonanywhere.com/api/usuario/clientes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, numero_documento }),
      })

      if (!response.ok) {
        // Aquí te aseguras que no lance error si es 400 con errores válidos
        const errorData = await response.json()
        if (response.status === 400 && typeof errorData === "object") {
          return {
            username: !!errorData.username,
            numero_documento: !!errorData.numero_documento,
          }
        }
        throw new Error("Error inesperado del servidor")
      }

      // Si no hay duplicados
      return {
        username: false,
        numero_documento: false,
      }
    } catch (err) {
      console.error("Fallo conexión/verificación:", err)
      // Devuelve null para que se maneje en el frontend
      throw new Error("No se pudo verificar duplicados")
    }
  }

  const validateStep1Fields = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es obligatorio"
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio"
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio"
    if (!formData.tipo_documento.trim()) newErrors.tipo_documento = "Selecciona un tipo de documento"
    if (!formData.numero_documento.trim()) newErrors.numero_documento = "El número de documento es obligatorio"

    setErrors((prev) => ({ ...prev, ...newErrors }))

    return Object.keys(newErrors).length === 0
  }

  const validateStep2Fields = () => {
    const newErrors = {}

    if (!formData.correo.trim()) newErrors.correo = "El correo es obligatorio"
    if (!formData.password) newErrors.password = "La contraseña es obligatoria"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden"

    setErrors((prev) => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const validateFields = () => {
    const step1Valid = validateStep1Fields()
    const step2Valid = validateStep2Fields()
    return step1Valid && step2Valid
  }

  const validateSingleField = (fieldName) => {
    const newErrors = { ...errors }

    switch (fieldName) {
      case "nombre":
        const nombreError = getNombreError(formData.nombre)
        if (nombreError) {
          newErrors.nombre = nombreError
        } else {
          delete newErrors.nombre
        }
        break
      case "apellido":
        const apellidoError = getApellidoError(formData.apellido)
        if (apellidoError) {
          newErrors.apellido = apellidoError
        } else {
          delete newErrors.apellido
        }
        break
      case "username":
        const usernameError = getUsernameError(formData.username)
        if (usernameError) {
          newErrors.username = usernameError
        } else {
          delete newErrors.username
        }
        break
      case "numero_documento":
        const numeroDocumentoError = getNumeroDocumentoError(formData.numero_documento)
        if (numeroDocumentoError) {
          newErrors.numero_documento = numeroDocumentoError
        } else {
          delete newErrors.numero_documento
        }
        break
      case "correo":
        if (!formData.correo) {
          newErrors.correo = "El correo es obligatorio"
        } else if (!validateEmail(formData.correo)) {
          newErrors.correo = "Correo no válido"
        } else {
          delete newErrors.correo
        }
        break
      case "password":
        const passwordError = getPasswordError(formData.password)
        if (passwordError) {
          newErrors.password = passwordError
        } else {
          delete newErrors.password
        }
        break
      case "confirmPassword":
        const confirmPasswordError = getConfirmPasswordError(formData.confirmPassword, formData.password)
        if (confirmPasswordError) {
          newErrors.confirmPassword = confirmPasswordError
        } else {
          delete newErrors.confirmPassword
        }
        break
      case "celular":
        if (formData.celular && !/^\+?\d{0,15}$/.test(formData.celular)) {
          newErrors.celular = "El celular solo debe contener números y un '+' opcional, máximo 15 caracteres."
        } else if (formData.celular.length > 13) {
          newErrors.celular = "Has alcanzado el máximo de 13 caracteres."
        } else {
          delete newErrors.celular
        }
        break
      case "tipo_documento": // Added validation for tipo_documento on blur if needed
        if (!formData.tipo_documento) {
          newErrors.tipo_documento = "El tipo de documento es obligatorio"
        } else {
          delete newErrors.tipo_documento
        }
        break
      default:
        break
    }
    setErrors(newErrors)
  }

  const [currentStep, setCurrentStep] = useState(1)

  const handleNextStep = async () => {
    const step1Fields = ["username", "nombre", "apellido", "tipo_documento", "numero_documento"]
    const touched = {}
    step1Fields.forEach((field) => (touched[field] = true))
    setTouchedFields((prev) => ({ ...prev, ...touched }))

    if (!validateStep1Fields()) return

    try {
      const duplicates = await checkDuplicatedFields({
        username: formData.username,
        numero_documento: formData.numero_documento,
      })

      const newErrors = {}
      if (duplicates.username) {
        newErrors.username = "El nombre de usuario ya está registrado"
      }
      if (duplicates.numero_documento) {
        newErrors.numero_documento = "El número de documento ya está registrado"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }))
        return
      }

      setCurrentStep(2)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        numero_documento: "No se pudo verificar el número. Verifica tu conexión.",
      }))
    }
  }

  const validateStep = (fields) => {
    const newErrors = {}
    for (const field of fields) {
      if (!formData[field]) {
        newErrors[field] = "Este campo es obligatorio"
      }
    }
    return newErrors
  }

  // Función para manejar cuando un campo pierde el foco
  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    validateSingleField(fieldName)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    const updatedFormData = {
      ...formData,
      [name]: value,
    }

    if (!usernameManuallyEdited && (name === "nombre" || name === "apellido")) {
      const nombre = name === "nombre" ? value : formData.nombre
      const apellido = name === "apellido" ? value : formData.apellido

      if (nombre && apellido) {
        updatedFormData.username = `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}`.replace(/\s+/g, "")
      }
    }

    if (name === "username") {
      setUsernameManuallyEdited(true)
    }

    setFormData(updatedFormData)

    // Si el campo ya fue tocado, validar en tiempo real
    if (touchedFields[name]) {
      // Small delay to ensure state update before validation
      setTimeout(() => validateSingleField(name), 0)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Set all fields as touched
    const allFieldNames = Object.keys(formData)
    const newTouchedFields = {}
    allFieldNames.forEach((field) => {
      newTouchedFields[field] = true
    })
    setTouchedFields(newTouchedFields)

    if (!validateFields()) return

    Swal.fire({
      title: "Registrando...",
      text: "Espera un momento por favor",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
      customClass: {
        popup: "swal-rosado",
      },
    })

    try {
      const responseData = await register(
        formData.username,
        formData.password,
        formData.nombre,
        formData.apellido,
        formData.tipo_documento,
        formData.numero_documento,
        formData.correo, // Cambiar de formData.email a formData.correo
        formData.celular,
      )

      Swal.close()
      console.log("Registro exitoso:", responseData)

      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Tu cuenta ha sido creada correctamente.",
        showConfirmButton: false,
        timer: 2500,
        customClass: {
          popup: "swal-rosado",
        },
      })

      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (errorData) {
      Swal.close()
      console.error("Error al registrarse:", errorData)

      // Si es error de validación de campos específicos
      if (typeof errorData === "object" && errorData !== null) {
        const fieldErrors = {}

        for (const [key, value] of Object.entries(errorData)) {
          if (Array.isArray(value)) {
            fieldErrors[key] = value[0] // Solo el primer error
          } else if (typeof value === "string") {
            fieldErrors[key] = value
          }
        }

        setErrors(fieldErrors)
      } else {
        // Fallback: error general
        setErrors({ general: "Ocurrió un error inesperado durante el registro." })
      }
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="wrapper">
      <div className="container" style={{ marginTop: "15px" }}>
        <div className="left">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="header fade-in delay-1">
            <h2 className="animation a1">Candy Nails</h2>
            <h4 className="animation a2">Ingresa tus datos para registrarte</h4>
          </div>

          <form className="form" onSubmit={handleRegister} style={{ marginTop: "-24px" }}>
            {currentStep === 1 && (
              <>
                {/* Tipo Documento - Número Documento */}
                <div className="fila-formulario fade-in delay-2">
                  <div className="form-group">
                    <label htmlFor="tipo_documento">Tipo de documento *</label>
                    <select
                      id="tipo_documento"
                      className="form-field-login"
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                      onBlur={() => handleBlur("tipo_documento")}
                    >
                      {tiposDocumento.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                    {touchedFields.tipo_documento && errors.tipo_documento && (
                      <div className="error">{errors.tipo_documento}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="numero_documento">Número de documento *</label>
                    <input
                      type="text"
                      id="numero_documento"
                      placeholder="Número de documento *"
                      className="form-field-login"
                      name="numero_documento"
                      value={formData.numero_documento}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        handleChange({ target: { name: "numero_documento", value: onlyNumbers } })
                      }}
                      maxLength={15}
                      onBlur={() => handleBlur("numero_documento")}
                    />
                    {touchedFields.numero_documento && errors.numero_documento && (
                      <div className="error">{errors.numero_documento}</div>
                    )}
                  </div>
                </div>

                {/* Nombre - Apellido */}
                <div className="fila-formulario fade-in delay-3">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombres *</label>
                    <input
                      type="text"
                      id="nombre"
                      placeholder="Nombres *"
                      className="form-field-login"
                      name="nombre"
                      value={formData.nombre}
                      maxLength={20}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) && value.length <= 20) {
                          handleChange(e)
                        }
                      }}
                      onBlur={() => handleBlur("nombre")}
                    />
                    {touchedFields.nombre && errors.nombre && <div className="error">{errors.nombre}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellidos *</label>
                    <input
                      type="text"
                      id="apellido"
                      placeholder="Apellidos *"
                      className="form-field-login"
                      name="apellido"
                      value={formData.apellido}
                      maxLength={20}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value) && value.length <= 20) {
                          handleChange(e)
                        }
                      }}
                      onBlur={() => handleBlur("apellido")}
                    />
                    {touchedFields.apellido && errors.apellido && <div className="error">{errors.apellido}</div>}
                  </div>
                </div>
                {/* Username */}
                <div className="form-group fade-in delay-4">
                  <label htmlFor="username">Nombre de usuario *</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Ej: Nombre.Apellido *"
                    className="form-field-login"
                    name="username"
                    value={formData.username}
                    maxLength={20}
                    onChange={(e) => {
                      if (e.target.value.length <= 20) handleChange(e)
                    }}
                    onBlur={() => handleBlur("username")}
                  />
                  {touchedFields.username && errors.username && <div className="error">{errors.username}</div>}
                </div>

                <div className="form-links fade-in delay-5">
                  <p style={{ marginTop: "-10px" }}>
                    ¿Ya tienes cuenta?{" "}
                    <span onClick={() => navigate("/login")} className="link">
                      Inicia sesión
                    </span>
                  </p>
                </div>

                <div className="form-buttons fade-in delay-6" style={{ marginTop: "-10px" }}>
                  <button type="button" className="btn-secondary" onClick={() => navigate("/")}>
                    Volver
                  </button>
                  <button type="button" className="btn-primary" onClick={handleNextStep}>
                    Siguiente
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Correo Electrónico - Celular */}
                <div  style={{ marginTop: "24px" }}>
                  <div className="fila-formulario fade-in delay-2">
                    <div className="form-group">
                      <label htmlFor="correo">Correo electrónico *</label>
                      <input
                        type="email"
                        id="correo"
                        placeholder="Correo electrónico *"
                        className="form-field-login"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        onBlur={() => handleBlur("correo")}
                      />
                      {touchedFields.correo && errors.correo && <div className="error">{errors.correo}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="celular">Celular *</label>
                      <input
                        type="text"
                        id="celular"
                        placeholder="Celular *"
                        className="form-field-login"
                        name="celular"
                        value={formData.celular}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\+?\d{0,15}$/.test(value)) {
                            handleChange(e)
                          }
                        }}
                        onBlur={() => handleBlur("celular")}
                      />
                      {touchedFields.celular && errors.celular && <div className="error">{errors.celular}</div>}
                    </div>
                  </div>

                  {/* Contraseña - Confirmar Contraseña */}
                  <div className="fila-formulario fade-in delay-3">
                    <div className="form-group">
                      <label htmlFor="password">Contraseña *</label>
                      <div className="password-field-container">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="Contraseña *"
                          className="form-field-login"
                          name="password"
                          value={formData.password}
                          onChange={(e) => {
                            if (e.target.value.length <= 20) handleChange(e)
                          }}
                          onBlur={() => handleBlur("password")}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                        />
                        {formData.password && (
                          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </span>
                        )}
                      </div>
                      {touchedFields.password && errors.password && <div className="error">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmar contraseña *</label>
                      <div className="password-field-container">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirmar contraseña *"
                          className="form-field-login"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            if (e.target.value.length <= 20) handleChange(e)
                          }}
                          onBlur={() => handleBlur("confirmPassword")}
                          onCopy={(e) => e.preventDefault()}
                          onCut={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                        />
                        {formData.confirmPassword && (
                          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </span>
                        )}
                      </div>
                      {touchedFields.confirmPassword && errors.confirmPassword && (
                        <div className="error">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-buttons fade-in delay-4">
                    <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                      Volver
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary">
                      {isSubmitting ? "Registrando..." : "Registrarse"}
                    </button>
                  </div>
                </div>
              </>
            )}
            {errors.general && <div className="error">{errors.general}</div>}
          </form>

        </div>

        <div className="right"></div>
      </div>
    </div>
  )
}

export default Registro
