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