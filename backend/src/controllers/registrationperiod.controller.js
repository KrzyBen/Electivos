"use strict";
import { 
  createPeriodService, 
  getActivePeriodService, 
  addElectivesToPeriodService 
} from "../services/registrationPeriod.service.js";
import { periodValidation } from "../validations/registrationPeriod.validation.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";

export async function createPeriod(req, res) {
  try {
    const { body } = req;
    
    const { error } = periodValidation.validate(body);
    if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

    const [period, periodError] = await createPeriodService(body);
    if (periodError) return handleErrorClient(res, 400, "Error creando el período", periodError);

    handleSuccess(res, 201, "Período de inscripción creado exitosamente", period);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getActivePeriod(req, res) {
    try {
      const [period, error] = await getActivePeriodService();
      if (error) return handleErrorClient(res, 500, "Error obteniendo el período", error);
      if (!period) return handleSuccess(res, 204);
      
      handleSuccess(res, 200, "Período de inscripción activo encontrado", period);
    } catch (error) {
      handleErrorServer(res, 500, error.message);
    }
}

export async function addElectivesToPeriod(req, res) {
  try {
    const { id } = req.params;
    const { electiveIds } = req.body;

    if (!id) return handleErrorClient(res, 400, "El ID del período es requerido");
    if (!Array.isArray(electiveIds) || electiveIds.length === 0) {
      return handleErrorClient(res, 400, "Se requiere un arreglo de IDs de electivos");
    }

    const [period, error] = await addElectivesToPeriodService(Number(id), electiveIds);

    if (error) return handleErrorClient(res, 400, "Error al asociar electivos", error);

    handleSuccess(res, 200, "Electivos añadidos al período correctamente", period);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}