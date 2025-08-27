import axios from "axios";

export const obtenerServiciosSemana = async (manicuristaId) => {
  try {
    const res = await axios.get("https://angelsuarez.pythonanywhere.com/api/cita-venta/servicios-cita/servicios-semana-manicurista/", {
      params: { manicurista_id: manicuristaId }
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener servicios de la semana", error);
    return null;
  }
};

export const obtenerLiquidacionesManicurista = async (manicuristaId) => {
  try {
    const response = await axios.get(`https://angelsuarez.pythonanywhere.com/api/manicurista/liquidaciones/?manicurista_id=${manicuristaId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las liquidaciones:", error);
    return [];
  }
};