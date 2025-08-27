const API_BASE_URL = "https://angelsuarez.pythonanywhere.com"; 

export const listar_calificaciones = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calificacion/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al obtener calificaciones:", error)
    throw error
  }
}
