import axios from './root.service.js';

export async function getMyNotifications() {
    try {
        const { data } = await axios.get('/notifications/');
        return data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return error.response?.data || { status: 'Client error', details: 'Error de conexión' };
    }
}

export async function markNotificationAsRead(id) {
    try {
        const { data } = await axios.patch(`/notifications/${id}/read`);
        return data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return error.response?.data || { status: 'Client error', details: 'Error de conexión' };
    }
}