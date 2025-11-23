"use strict";
import { AppDataSource } from "../config/configDb.js";
import RegistrationPeriod from "../entity/registrationperiod.entity.js";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { handleErrorClient, handleSuccess } from "../handlers/responseHandlers.js";

export async function checkPeriodoInscripcion(req, res, next) {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const now = new Date();

    // Buscar un período activo
    const activePeriod = await periodRepository.findOne({
      where: {
        fechaInicio: LessThanOrEqual(now),
        fechaTermino: MoreThanOrEqual(now),
      },
    });

    if (!activePeriod) {
      return handleErrorClient(
        res,
        403,
        "Fuera del período de inscripción",
        "Actualmente no hay un período de inscripción activo."
      );
    }
    req.activePeriod = activePeriod;
    next();
  } catch (error) {
    console.error("Error en checkPeriodoInscripcion:", error);
    return handleErrorClient(res, 500, "Error validando el período de inscripción");
  }
}