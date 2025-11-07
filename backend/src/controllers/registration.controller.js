"use strict";
import { specialRegistrationService } from "../services/registration.service.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function specialRegistration(req, res) {
  try {
    const { studentId, electiveId, periodId } = req.body;

    if (!studentId || !electiveId || !periodId) {
      return handleErrorClient(res, 400, "studentId, electiveId y periodId son requeridos");
    }

    const [registration, error] = await specialRegistrationService(studentId, electiveId, periodId);

    if (error) return handleErrorClient(res, 400, "Error en la inscripción especial", error);

    handleSuccess(res, 201, "Inscripción especial realizada con éxito", registration);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}