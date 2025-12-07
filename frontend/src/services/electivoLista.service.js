import axios from './root.service.js';

export async function getElectivosValidados() {
  try {
    const { data } = await axios.get("/electivo_Alumno/validados");
    return data;
  } catch (error) {
    return error.response?.data || { status: "Client error", details: "Error desconocido" };
  }
}

export async function getMisElectivos() {
  try {
    const { data } = await axios.get("/electivo_Alumno/lista");
    return data.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      return { items: [] };
    }
    throw err;
  }
}

export async function addElectivo(body) {
  try {
    console.log('Adding electivo with body:', body);
    const { data } = await axios.post('/electivo_Alumno/create', body);
    return data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function replaceElectivo(body) {
  try {
    console.log('Replacing electivo with body:', body);
    const { data } = await axios.post('/electivo_Alumno/replace', body);
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function deleteElectivo(electivoId) {
  try {
    const { data } = await axios.delete(`/electivo_Alumno/${electivoId}/delete`);
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function updateElectivo(id, body) {
  try {
    const { data } = await axios.patch(`/electivo_Alumno/${id}/update`, body);
    return data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function enviarLista() {
  try {
    const { data } = await axios.post('/electivo_Alumno/enviar');
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}