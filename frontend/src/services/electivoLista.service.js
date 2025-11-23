import axios from './root.service.js';

export async function getElectivosValidados() {
  try {
    const { data } = await axios.get('/electivo_Alumno/validos');
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function getMisElectivos() {
  try {
    const { data } = await axios.get('/electivo_Alumno/listar');
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function addElectivo(body) {
  try {
    const { data } = await axios.post('/electivo_Alumno/create', body);
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function replaceElectivo(body) {
  try {
    const { data } = await axios.put('/electivo_Alumno/replace', body);
    return data.data;
  } catch (error) {
    return error.response?.data;
  }
}

export async function deleteElectivo(electivoId) {
  try {
    const { data } = await axios.delete(`/electivo_Alumno/remove/${electivoId}`);
    return data.data;
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