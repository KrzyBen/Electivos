
import axios from "./root.service.js";

const API_URL = "/electives"; 

const getAuthConfig = () => {
  const token = sessionStorage.getItem("token");
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

export const getElectives = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getElectivesByProfesor = async () => {
  const response = await axios.get(
    `${API_URL}/creados`,
    getAuthConfig()
  );
  return response.data;
};

export const getAllElectives = async () => {
  const response = await axios.get(
    `${API_URL}/all/list`,
    getAuthConfig()
  );
  return response.data;
};

export const getElectiveById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  );
  return response.data;
};

export const createElective = async (data) => {
  const response = await axios.post(
    API_URL,
    data,
    getAuthConfig()
  );
  return response.data;
};

export const updateElective = async (id, data) => {
  const response = await axios.put(
    `${API_URL}/edit/${id}`,
    data,
    getAuthConfig()
  );
  return response.data;
};

export const validateElective = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/validate/`,
    {},
    getAuthConfig()
  );
  return response.data;
};

export const deleteElective = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    {},
    getAuthConfig()
  );
  return response.data;
};

export const downloadInscritosPDF = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}/export-inscritos-pdf`,
    {
      ...getAuthConfig(),
      responseType: 'blob',
    }
  );
  return response.data;
};