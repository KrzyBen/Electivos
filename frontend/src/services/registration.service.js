import axios from './root.service.js';

export async function specialRegistration(data) {
  try {
    const response = await axios.post('/registration/special', data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
}

export async function getRegistrationsByStudent(studentId) {
  try {
    const { data } = await axios.get(`/registration/student/${studentId}`);
    return data;
  } catch (error) {
    return error.response.data;
  }
}

export async function unenrollStudent(registrationId) {
  try {
    const { data } = await axios.delete(`/registration/${registrationId}`);
    return data;
  } catch (error) {
    return error.response.data;
  }
}
