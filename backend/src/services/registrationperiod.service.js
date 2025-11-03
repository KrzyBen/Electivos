"use strict";
import RegistrationPeriod from "../entity/registrationperiod.entity.js";
import Elective from "../entity/elective.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export async function createPeriodService(body) {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const newPeriod = periodRepository.create(body);
    const saved = await periodRepository.save(newPeriod);
    return [saved, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}

export async function getActivePeriodService() {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const now = new Date();
    const activePeriod = await periodRepository.findOne({
      where: {
        fechaInicio: LessThanOrEqual(now),
        fechaTermino: MoreThanOrEqual(now),
      },
      relations: ["electives"],
    });
    return [activePeriod, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}

export async function addElectivesToPeriodService(periodId, electiveIds) {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const electiveRepository = AppDataSource.getRepository(Elective);

    const period = await periodRepository.findOneBy({ id: periodId });
    if (!period) return [null, "Período de inscripción no encontrado"];

    const electives = await electiveRepository.findBy({
      id: In(electiveIds),
      validado: true,
    });

    if (electives.length !== electiveIds.length) {
      return [null, "Uno o más electivos no son válidos, no existen o no han sido validados por un jefe de carrera"];
    }

    period.electives = electives;
    const savedPeriod = await periodRepository.save(period);

    return [savedPeriod, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}