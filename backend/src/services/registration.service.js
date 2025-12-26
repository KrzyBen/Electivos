"use strict";
import Registration from "../entity/registration.entity.js";
import User from "../entity/user.entity.js";
import Elective from "../entity/elective.entity.js";
import RegistrationPeriod from "../entity/registrationperiod.entity.js";
import { AppDataSource } from "../config/configDb.js";
import ElectivoLista from "../entity/electivoLista.entity.js";
import Notification from "../entity/notification.entity.js"; 


export async function specialRegistrationService(studentId, electiveId, periodId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const studentRepository = AppDataSource.getRepository(User);
    const electiveRepository = AppDataSource.getRepository(Elective);
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);

    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student || student.rol !== 'Alumno') return [null, "Estudiante no válido"];

    const elective = await electiveRepository.findOneBy({ id: electiveId });
    if (!elective) return [null, "Electivo no encontrado"];

    const period = await periodRepository.findOneBy({ id: periodId });
    if (!period) return [null, "Período no encontrado"];

    

    // Buscar todas las inscripciones del alumno en el mismo período
    const studentRegistrationsInPeriod = await registrationRepository.find({
      where: { student: { id: studentId }, period: { id: periodId } },
      relations: ["elective"],
    });

    // Revisar si ya está inscrito en el mismo electivo
    const alreadyRegistered = studentRegistrationsInPeriod.some(
      (reg) => reg.elective.id === electiveId
    );
    if (alreadyRegistered) {
      return [null, "El estudiante ya está inscrito en este electivo para este período."];
    }

    // Revisar si hay conflicto de horario con otros electivos en el mismo período
    const scheduleConflict = studentRegistrationsInPeriod.find(
      (reg) => reg.elective.horario === elective.horario
    );

    if (scheduleConflict) {
      const errorMessage = `Conflicto de horario: El alumno ya está inscrito en '${scheduleConflict.elective.titulo}', que tiene el mismo horario.`;
      
      return [null, { conflicto: true, message: errorMessage }];
    }

    

    const newRegistration = registrationRepository.create({
      student,
      elective,
      period,
      specialRegistration: true,
      pending: false, 
    });

    const saved = await registrationRepository.save(newRegistration);
    return [saved, null];

  } catch (error) {
    console.error("Error en el servicio de inscripción especial:", error);
    return [null, "Error interno del servidor"];
  }
}


export async function unenrollStudentService(registrationId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const electiveRepository = AppDataSource.getRepository(Elective);

    
    const result = await AppDataSource.transaction(async (transactionalEntityManager) => {
      const regRepo = transactionalEntityManager.getRepository(Registration);
      const electRepo = transactionalEntityManager.getRepository(Elective);

      
      const registration = await regRepo.findOne({
        where: { id: registrationId },
        relations: ["elective"],
      });

      if (!registration) {
        throw new Error("Inscripción no encontrada.");
      }

      const electiveId = registration.elective?.id;

      
      await regRepo.remove(registration);

      // Si la inscripción estaba asociada a un electivo, liberar el cupo
      if (electiveId) {
        await electRepo.increment({ id: electiveId }, "cupoDisponible", 1);
      }

      return { unenroll: true, registrationId };
    });

    return [result, null];
  } catch (error) {
    console.error("Error en el servicio de desinscripción:", error);
    
    return [null, error.message || "Error interno del servidor"];
  }
}


export async function getRegistrationsByStudentService(studentId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const registrations = await registrationRepository.find({
      where: { student: { id: studentId } },
      relations: ["elective", "period"],
      order: { registeredAt: "DESC" },
    });
    return [registrations, null];
  } catch (error) {
    console.error("Error en getRegistrationsByStudentService:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function createRegistrationsFromListaService(periodId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const listaRepository = AppDataSource.getRepository(ElectivoLista);
    const periodRepository = AppDataSource.getRepository(RegistrationPeriod);

    const period = await periodRepository.findOneBy({ id: periodId });
    if (!period) return [null, "Período no encontrado"];

    
    const lista = await listaRepository.find({ relations: ["alumno", "electivo"] });

    const created = [];

    for (const item of lista) {
      const studentId = item.alumno?.id;
      const electiveId = item.electivo?.id;

      if (!studentId || !electiveId) continue;

      
      const existing = await registrationRepository.findOne({
        where: {
          student: { id: studentId },
          period: { id: periodId },
          elective: { id: electiveId },
        },
      });

      if (existing) continue;

      const newRegistration = registrationRepository.create({
        student: { id: studentId },
        elective: { id: electiveId },
        period: { id: periodId },
        specialRegistration: false,
        pending: true,
      });

      const saved = await registrationRepository.save(newRegistration);
      created.push(saved);
    }

    return [{ createdCount: created.length, created }, null];
  } catch (error) {
    console.error("Error creando inscripciones desde lista:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function listarPendingRegistrationsForElectiveService(jefeEmail, electiveId, periodId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);
    const userRepository = AppDataSource.getRepository(User);

    
    const jefe = await userRepository.findOne({ where: { email: jefeEmail } });
    if (!jefe) return [null, "Jefe de carrera no encontrado"];

    
    const whereClause = { pending: true, elective: { id: electiveId } };
    if (periodId) whereClause.period = { id: periodId };

    const registrations = await registrationRepository.find({
      where: whereClause,
      relations: ["student", "elective", "period"],
      order: { registeredAt: "ASC" },
    });

    // filtrar por carrera del jefe: comparar campo 'carrera' si existe, o fallback a carreraEntidad.id
    const jefeCarreraName = jefe.carrera;
    const jefeCarreraEntidadId = jefe.carreraEntidad?.id;

    const filtered = registrations.filter((r) => {
      const student = r.student || {};
      if (jefeCarreraName && student.carrera) return student.carrera === jefeCarreraName;
      if (jefeCarreraEntidadId && student.carreraEntidad) return student.carreraEntidad.id === jefeCarreraEntidadId;
      return false;
    });

    return [{ total: filtered.length, items: filtered }, null];
  } catch (error) {
    console.error("Error listando solicitudes pendientes:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function listarPendingRegistrationsForElectiveWithFilter(careerFilter, applyCareerFilter, electiveId, periodId) {
  try {
    const registrationRepository = AppDataSource.getRepository(Registration);

    const whereClause = { pending: true, elective: { id: electiveId } };
    if (periodId) whereClause.period = { id: periodId };

    const registrations = await registrationRepository.find({
      where: whereClause,
      relations: ["student", "elective", "period"],
      order: { registeredAt: "ASC" },
    });

    if (!applyCareerFilter || !careerFilter) {
      return [{ total: registrations.length, items: registrations }, null];
    }

    const { careerName, careerEntidadId } = careerFilter;

    const filtered = registrations.filter((r) => {
      const student = r.student || {};
      if (careerName && student.carrera) return student.carrera === careerName;
      if (careerEntidadId && student.carreraEntidad) return student.carreraEntidad.id === careerEntidadId;
      return false;
    });

    return [{ total: filtered.length, items: filtered }, null];
  } catch (error) {
    console.error("Error listando solicitudes pendientes (filter):", error);
    return [null, "Error interno del servidor"];
  }
}

export async function markNotificationsAsReadService(userId, notificationIds) {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const result = await notificationRepository.update(
      { id: In(notificationIds), user: { id: userId } },
      { read: true } 
    );

    if (result.affected === 0) {
      return [null, "No se encontraron notificaciones para marcar como leídas."];
    }

    return [{ updatedCount: result.affected }, null];
  } catch (error) {
    console.error("Error marcando notificaciones como leídas:", error);
    return [null, "Error interno del servidor"];
  }
}