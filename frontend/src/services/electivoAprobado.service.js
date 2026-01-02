import axios from "./root.service.js";

export async function getMisElectivosAprobados(periodId = null) {
  try {
    const params = periodId ? { params: { periodId } } : {};
    const { data } = await axios.get(
      "/electivo_Alumno/electivos-aprobados",
      params
    );

    return data.data;
  } catch (error) {
    return (
      error.response?.data || {
        status: "Client error",
        details: "Error desconocido",
      }
    );
  }
}

export async function downloadMisElectivosAprobadosPDF() {
  try {
    const response = await axios.get(
      "/electivo_Alumno/electivos-aprobados/pdf",
      {
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        status: "Client error",
        details: "Error al descargar el PDF",
      }
    );
  }
}