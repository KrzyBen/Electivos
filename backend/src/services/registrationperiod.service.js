"use strict";
import RegistrationPeriod from "../entity/registrationperiod.entity.js";
import Elective from "../entity/elective.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { createNotificationService } from "./notification.service.js"; 

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

export async function getAllPeriodsService() {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const periods = await periodRepository.find({
      relations: ["electives"],
      order: { fechaInicio: "DESC" },
    });
    return [periods, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}

export async function deletePeriodService(id) {
  try {
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);
    const result = await periodRepository.delete(id);
    if (result.affected === 0) return [null, "Período no encontrado"];
    return [true, null];
  } catch (error) {
    return [null, "Error interno del servidor"];
  }
}


export async function addElectivesToPeriodService(periodId, electiveIds, comments) {
  try {
    const savedPeriod = await AppDataSource.transaction(async (transactionalEntityManager) => {
      const periodRepository = transactionalEntityManager.getRepository(RegistrationPeriod);
      const electiveRepository = transactionalEntityManager.getRepository(Elective);

      const period = await periodRepository.findOne({
        where: { id: periodId },
        relations: ["electives", "electives.profesor"], 
      });
      if (!period) throw new Error("Período de inscripción no encontrado");

      const oldElectiveIds = new Set(period.electives.map(e => e.id));
      const newElectiveIds = new Set(electiveIds);

      
      // Notificar a profesores de electivos aprobados
      for (const newId of newElectiveIds) {
        if (!oldElectiveIds.has(newId)) {
          const elective = await electiveRepository.findOne({ where: { id: newId }, relations: ["profesor"] });
          if (elective?.profesor) {
            const message = `Tu electivo "${elective.titulo}" ha sido aprobado para el período "${period.nombre}".`;
            await createNotificationService(elective.profesor.id, message);
          }
        }
      }

      // Notificar a profesores de electivos eliminados
      for (const oldElective of period.electives) {
        if (!newElectiveIds.has(oldElective.id)) {
          if (oldElective.profesor) {
            const message = `Tu electivo "${oldElective.titulo}" fue desasignado del período "${period.nombre}".`;
            const comment = comments[oldElective.id] || "No se proporcionó un motivo.";
            await createNotificationService(oldElective.profesor.id, message, comment);
          }
        }
      }

      // Notificar a profesores de electivos que no fueron seleccionados
      const allElectiveIds = new Set((await electiveRepository.find({ select: ["id"] })).map(e => e.id));
      for (const id of allElectiveIds) {
        if (!newElectiveIds.has(id) && !oldElectiveIds.has(id)) {
          const elective = await electiveRepository.findOne({ where: { id }, relations: ["profesor"] });
          if (elective?.profesor && comments[id]) {
            const message = `Tu electivo "${elective.titulo}" no fue seleccionado para el período "${period.nombre}".`;
            const comment = comments[id];
            await createNotificationService(elective.profesor.id, message, comment);
          }
        }
      }
      

      const electives = await electiveRepository.findBy({ id: In(electiveIds) });
      period.electives = electives;
      return await periodRepository.save(period);
    });

    return [savedPeriod, null];
  } catch (error) {
    return [null, error.message || "Error interno del servidor"];
  }
}