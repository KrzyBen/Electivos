import axios from "./root.service.js";

// Obtener alumnos de la carrera del jefe
export async function getAlumnosCarrera() {
  try {
    const { data } = await axios.get("/jc_electivos/alumnos");
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

// Obtener lista de electivos de un alumno
export async function getListaAlumno(alumnoId) {
  try {
    const { data } = await axios.get(`/jc_electivos/alumnos/${alumnoId}/lista`);
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

// Aprobar o rechazar electivo
export async function updateEstadoElectivo(electivoListaId, estado) {
  try {
    const { data } = await axios.patch(
      `/jc_electivos/electivo/${electivoListaId}/estado`,
      { estado }
    );
    return data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function replaceElectivoAlumno(
  alumnoId,
  oldElectivoId,
  newElectivoId
) {
  try {
    const { data } = await axios.post("/jc_electivos/replace", {
      alumnoId,
      oldElectivoId,
      newElectivoId,
    });
    return data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function getElectivosCarreraJefe() {
  try {
    const { data } = await axios.get("/jc_electivos/electivos");
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function aprobarListaElectivos(alumnoId) {
  try {
    console.log("Aprobar lista para alumnoId:", alumnoId);
    const { data } = await axios.post(`/jc_electivos/${alumnoId}/aprobar`);
    return data;
  } catch (error) {
    return error.response?.data;
  }
}