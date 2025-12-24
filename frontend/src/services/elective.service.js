import axios from "axios";


const API_URL = "http://localhost:3000/api/electives";

const getAuthConfig = () => {
  const token = sessionStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const getElectives = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const getElectiveById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

export const createElective = async (data) => {
  const response = await axios.post(API_URL, data, getAuthConfig());
  return response.data;
};

export const updateElective = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthConfig());
  return response.data;
};