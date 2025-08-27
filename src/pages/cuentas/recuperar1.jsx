import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../css/formCuentas.css";
import { ArrowLeft } from "lucide-react"
import { solicitar_codigo_recuperacion } from '../../services/auth_service'

const Recuperar1 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateFields = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "El correo es obligatorio";
    else if (!validateEmail(formData.email)) newErrors.email = "Correo no válido";

    if (!formData.confirmEmail) newErrors.confirmEmail = "Confirma tu correo";
    else if (formData.email !== formData.confirmEmail)
      newErrors.confirmEmail = "Los correos no coinciden";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const irRestaurar = async (event) => {
    event.preventDefault();

    if (!validateFields()) return;

    try {
      await solicitar_codigo_recuperacion(formData.email);

      Swal.fire({
        icon: "success",
        title: "Correo validado",
        text: "El codigo de recuperación se envio a su correo",
        customClass: {
          popup: 'swal-rosado'
        }
      }).then(() => {
        navigate("/recuperar-password", { state: { correo: formData.email } });
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: `Error al solicitar el codigo || ${error.message}`,
        text: 'Occurrio un error inesperado, vuelve a intentarlo.',
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
            <h2 className="animation a1">Recuperar contraseña</h2>
            <h4 className="animation a2">Ingresa tu correo para restablecer tu contraseña</h4>
          </div>
          <form className="form" onSubmit={irRestaurar}>
            <div className="form-group fade-in delay-2">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                placeholder="Correo electrónico *"
                className="form-field animation a3"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={validateFields}
              />
              <span className="error">{errors.email || ""}</span>
            </div>

            <div className="form-group fade-in delay-3">
              <label htmlFor="email">Confirmar correo electrónico</label>
              <input
                type="email"
                placeholder="Confirmar correo *"
                className="form-field animation a4"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
                onBlur={validateFields}
                onCopy={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              />
              <span className="error">{errors.confirmEmail || ""}</span>
            </div>
            <div className="form-links fade-in delay-4">
              <p className="animation a6">
                ¿La recordaste?{" "}
                <span onClick={() => navigate("/login")} className="link">
                  Inicia sesión
                </span>
              </p>
            </div>

            <div className="form-buttons fade-in delay-5">
              <button className="btn btn-primary" type="submit">
                Recuperar
              </button>
            </div>


          </form>

        </div>
        <div className="right"></div>
      </div>
    </div>
  );
};

export default Recuperar1;
