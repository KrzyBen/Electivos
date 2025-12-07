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
    
    const savedPeriod = await AppDataSource.transaction(async (transactionalEntityManager) => {
      const periodRepository = transactionalEntityManager.getRepository(RegistrationPeriod);
      const electiveRepository = transactionalEntityManager.getRepository(Elective);

      
      const period = await periodRepository.findOneBy({ id: periodId });
      if (!period) {
        throw new Error("Período de inscripción no encontrado");
      }

      
      const electives = await electiveRepository.findBy({
        id: In(electiveIds),
      });

      
      if (electives.length !== electiveIds.length) {
        throw new Error("Uno o mas ID de electivos no son válidos o no existen");
      }

      
      electives.forEach(elective => {
        elective.validado = true;
      });
      await electiveRepository.save(electives);

     
      period.electives = electives;
      
     
      return await periodRepository.save(period);
    });

    return [savedPeriod, null];
  } catch (error) {
    
    return [null, error.message || "Error interno del servidor"];
  }
}