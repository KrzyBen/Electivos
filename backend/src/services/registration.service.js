"use strict";
import Registration from "../entity/registration.entity.js";
import User from "../entity/user.entity.js";
import Elective from "../entity/elective.entity.js";
import RegistrationPeriod from "../entity/registrationperiod.entity.js";
import { AppDataSource } from "../config/configDb.js";

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

    const existingRegistration = await registrationRepository.findOne({
      where: {student: { id: studentId }, period: { id: periodId }, elective: { id: electiveId }}
    });

    if (existingRegistration) return [null, "El estudiante ya está inscrito en este electivo para este período"];

    const newRegistration = registrationRepository.create({
      student,
      elective,
      period,
      specialRegistration: true,
    });

    const saved = await registrationRepository.save(newRegistration);
    return [saved, null];

  } catch (error) {
    console.error("Error en el servicio de inscripción especial:", error);
    return [null, "Error interno del servidor"];
  }
}