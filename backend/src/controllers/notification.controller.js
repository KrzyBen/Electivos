"use strict";
import {
    getMyNotificationsService,
    markNotificationAsReadService,
} from "../services/notification.service.js";
import {
    handleErrorClient,
    handleErrorServer,
    handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getMyNotifications(req, res) {
    try {
        const userId = req.user.id;
        const [notifications, error] = await getMyNotificationsService(userId);

        if (error) return handleErrorServer(res, 500, error);

        handleSuccess(res, 200, "Notificaciones obtenidas exitosamente", notifications);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}

export async function markAsRead(req, res) {
    try {
        const { id } = req.params;
        const [result, error] = await markNotificationAsReadService(Number(id));

        if (error) return handleErrorClient(res, 404, error);

        handleSuccess(res, 200, "Notificación marcada como leída", result);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
}