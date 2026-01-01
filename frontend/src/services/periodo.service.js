import axios from './root.service.js';

export async function getAllPeriods() {
  try {
    const { data } = await axios.get('/registration-period');
    return data;
  } catch (error) {
    return error.response.data;
  }
}

export async function createPeriod(periodData) {
  try {
    const { data } = await axios.post('/registration-period', periodData);
    return data;
  } catch (error) {
    return error.response.data;
  }
}

export async function addElectivesToPeriod(periodId, electiveIds) {
  try {
    const { data } = await axios.post(`/registration-period/${periodId}/electives`, { electiveIds });
    return data;
  } catch (error) {
    return error.response.data;
  }
}

export async function getActivePeriod() {
  try {
    const { data, status } = await axios.get("/registration-period/active");
    return { data, status };
  } catch (error) {
    return {
      data: error.response?.data,
      status: error.response?.status || 500
    };
  }
}