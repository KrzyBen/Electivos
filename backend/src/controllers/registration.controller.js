"use strict";
import { specialRegistrationService } from "../services/registration.service.js";
import {
  createRegistrationsFromListaService,
  listarPendingRegistrationsForElectiveService,
  listarPendingRegistrationsForElectiveWithFilter,
} from "../services/registration.service.js";
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

export async function createRegistrationsFromLista(req, res) {
  try {
    const { periodId } = req.params;

    if (!periodId) return handleErrorClient(res, 400, "periodId es requerido en params");

    const [result, error] = await createRegistrationsFromListaService(Number(periodId));

    if (error) return handleErrorClient(res, 400, "Error creando inscripciones desde lista", error);

    handleSuccess(res, 201, "Inscripciones creadas desde listas", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function listarPendientesPorElectivo(req, res) {
  try {
    const { electiveId, periodId } = req.query;

    if (!electiveId) return handleErrorClient(res, 400, "electiveId es requerido en query");

    const careerFilter = req.careerFilter;
    const applyCareerFilter = req.applyCareerFilter;

    const [result, error] = await listarPendingRegistrationsForElectiveWithFilter(
      careerFilter,
      applyCareerFilter,
      Number(electiveId),
      periodId ? Number(periodId) : undefined,
    );

    if (error) return handleErrorClient(res, 400, "Error listando solicitudes pendientes", error);

    handleSuccess(res, 200, "Solicitudes pendientes obtenidas", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}