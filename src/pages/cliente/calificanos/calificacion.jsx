import { useState, useRef } from "react"
import { FaCamera, FaImage, FaPaperPlane, FaTimes, FaCheck } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import "../../../css/calificacion.css"

const Calificacion = () => {
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [comentario, setComentario] = useState("")
  const [imagen, setImagen] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const icons = [
    { id: 2, emoji: "😊", label: "Muy Bien", color: "#3b82f6" },
    { id: 3, emoji: "🙂", label: "Bien", color: "#f59e0b" },
    { id: 4, emoji: "😞", label: "Malo", color: "#f97316" },
    { id: 5, emoji: "😡", label: "Muy Malo", color: "#ef4444" },
  ]

  const handleSubmit = async () => {
    if (!selectedIcon) {
      await Swal.fire({
        icon: "warning",
        title: "¡Oops!",
        text: "Por favor selecciona una calificación antes de continuar.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        backdrop: "rgba(0,0,0,0.4)",
        customClass: {
          popup: "swal-popup-custom",
          title: "swal-title-custom",
          content: "swal-content-custom",
          confirmButton: "swal-button-custom",
        },
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      })
      return
    }

    const selectedRating = icons.find((icon) => icon.id === selectedIcon)

    const result = await Swal.fire({
      title: "¿Enviar calificación?",
      html: `
                <div style="text-align: left; padding: 20px;">
                    <p style="color: #374151; margin-bottom: 15px;">Estás a punto de enviar tu calificación:</p>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 15px 0;">
                        <p style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">
                            Calificación: <span style="color: ${selectedRating.color};">${selectedRating.label} ${selectedRating.emoji}</span>
                        </p>
                        ${comentario ? `<p style="color: #6b7280; margin-bottom: 8px;">Comentario: "${comentario}"</p>` : ""}
                        ${imagen ? `<p style="color: #6b7280;"><i class="fas fa-camera" style="margin-right: 8px;"></i>Imagen adjunta</p>` : ""}
                    </div>
                    <p style="color: #d97706; font-size: 14px; background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 15px;">
                        <strong>📝 Nota:</strong> Tu comentario podría ser visible públicamente.
                    </p>
                </div>
            `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      background: "#ffffff",
      backdrop: "rgba(0,0,0,0.4)",
      customClass: {
        popup: "swal-popup-custom",
        title: "swal-title-custom",
        htmlContainer: "swal-html-custom",
        confirmButton: "swal-button-custom",
        cancelButton: "swal-button-custom",
      },
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
    })

    if (result.isConfirmed) {
      setIsSubmitting(true)

      Swal.fire({
        title: "Enviando calificación...",
        html: '<div class="swal-loading"><div class="swal-spinner"></div></div>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        background: "#ffffff",
        customClass: {
          popup: "swal-popup-custom",
        },
      })

      const formData = new FormData()
      formData.append("puntuacion", selectedIcon)
      formData.append("comentario", comentario)
      if (imagen) {
        formData.append("imagen", imagen)
      }

      try {
        const response = await fetch("https://angelsuarez.pythonanywhere.com/api/calificacion/", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "🎉 ¡Gracias por tu calificación!",
            text: "Tu opinión ha sido registrada correctamente.",
            timer: 3000,
            showConfirmButton: false,
            background: "#ffffff",
            customClass: {
              popup: "swal-popup-custom swal-success-custom",
              title: "swal-title-success",
            },
            showClass: {
              popup: "animate__animated animate__bounceIn",
            },
          })
          setTimeout(() => navigate("/cliente"), 2200)
        } else {
          throw new Error("Error en la respuesta del servidor")
        }
      } catch (error) {
        console.error("Error al enviar:", error)
        await Swal.fire({
          icon: "error",
          title: "❌ Error al enviar",
          text: "Ocurrió un error al guardar tu calificación. Por favor, intenta de nuevo.",
          confirmButtonText: "🔄 Reintentar",
          confirmButtonColor: "#ef4444",
          background: "#ffffff",
          customClass: {
            popup: "swal-popup-custom",
            title: "swal-title-error",
            confirmButton: "swal-button-custom",
          },
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Archivo muy grande",
          text: "La imagen debe ser menor a 5MB.",
          confirmButtonColor: "#3b82f6",
          customClass: {
            popup: "swal-popup-custom",
          },
        })
        return
      }
      setImagen(file)
    }
  }

  const removeImage = () => {
    setImagen(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="container-califi">
      <div className="header-califi">
        <div className="header-content-califi">
          <img src="https://i.pinimg.com/736x/ab/dd/f1/abddf13749e496af6b9bfc5f5bec55e4.jpg" alt="Logo" />
          <div className="header-overlay"></div>
        </div>
      </div>

      <div className="content-califi">
        <div className="welcome-section">
          <h2 className="texto-califi">¡Queremos conocer tu opinión! 🌟</h2>
          <p className="subtitle-califi">Califícanos y comparte tu experiencia</p>
          <div className="divider-califi"></div>
        </div>

        <div className="rating-section">
          <h3 className="califi-h3">Amabilidad y profesionalismo del personal</h3>

          <div className="icons">
            {icons.map((icon) => (
              <div
                key={icon.id}
                className={`icon-container ${selectedIcon === icon.id ? "active" : ""}`}
                onClick={() => setSelectedIcon(icon.id)}
              >
                <span className="icon-emoji">{icon.emoji}</span>
                <span
                  className="icon-label"
                  style={{
                    backgroundColor: selectedIcon === icon.id ? icon.color : "#e5e7eb",
                    color: selectedIcon === icon.id ? "white" : "#6b7280",
                  }}
                >
                  {icon.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="comment-section">
          <label className="comment-label">💬 Cuéntanos más sobre tu experiencia (opcional)</label>
          <textarea
            className="input-califi"
            placeholder="Escribe aquí tu comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <div className="character-count">{comentario.length}/500 caracteres</div>
        </div>

        {imagen && (
          <div className="preview-container">
            <div className="preview-header">
              <span className="preview-title">
                <FaCheck className="check-icon" />
                Imagen adjunta
              </span>
              <button className="remove-image-btn" onClick={removeImage} type="button">
                <FaTimes />
              </button>
            </div>
            <img src={URL.createObjectURL(imagen) || "/placeholder.svg"} alt="Vista previa" className="preview-image" />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        <div className="buttons-califi">
          <button type="button" className="media-btn camera-btn" onClick={openCamera}>
            <FaCamera />
            <span>Tomar Foto</span>
          </button>
          <button type="button" className="media-btn gallery-btn" onClick={openFileSelector}>
            <FaImage />
            <span>Subir Imagen</span>
          </button>
        </div>

        <div className="button-container">
          <button onClick={() => navigate("/cliente")} className="btn-cancelar" disabled={isSubmitting}>
             Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-crear" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                Enviando...
              </>
            ) : (
              <>
                Enviar Calificación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Calificacion
