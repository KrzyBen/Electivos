"use strict";
import { AppDataSource } from "../config/configDb.js";
import NotificationSchema from "../entity/notification.entity.js";

export async function getMyNotificationsService(userId) {
  try {
    const notificationRepository = AppDataSource.getRepository(NotificationSchema);
    const notifications = await notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });
    return [notifications, null];
  } catch (error) {
    console.error("Error en getMyNotificationsService:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function markNotificationAsReadService(notificationId) {
  try {
    const notificationRepository = AppDataSource.getRepository(NotificationSchema);
    const result = await notificationRepository.update(
      { id: notificationId },
      { isRead: true }
    );
    if (result.affected === 0) {
      return [null, "Notificación no encontrada"];
    }
    return [{ affected: result.affected }, null];
  } catch (error) {
    console.error("Error en markNotificationAsReadService:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createNotificationService(userId, message, comment = null) {
  try {
    const notificationRepository = AppDataSource.getRepository(NotificationSchema);
    const newNotification = notificationRepository.create({
      user: { id: userId },
      message,
      comment,
      isRead: false
    });
    await notificationRepository.save(newNotification);
    return true;
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return false;
  }
}