import axios from './root.service.js';

export async function getAllElectives() {
    try {
        const { data } = await axios.get('/electives/all/list');
        return data;
    } catch (error) {
        return error.response.data;
    }
}