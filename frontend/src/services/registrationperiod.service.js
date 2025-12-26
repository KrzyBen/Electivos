import axios from './root.service.js';

export async function getAllPeriods() {
    try {
        const { data } = await axios.get('/registration-period/');
        return data;
    } catch (error) {
        return error.response?.data || { status: "Client error", details: "Error desconocido" };
    }
}

export async function addElectivesToPeriod(periodId, body) {
    try {
        const response = await axios.post(`/registration-period/${periodId}/electives`, body);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "Client error", details: "Error desconocido" };
    }
}

export async function createPeriod(data) {
    try {
        const response = await axios.post('/registration-period/', data);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "Client error", details: "Error desconocido" };
    }
}

export async function deletePeriod(periodId) {
    try {
        const response = await axios.delete(`/registration-period/${periodId}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { status: "Client error", details: "Error desconocido" };
    }
}