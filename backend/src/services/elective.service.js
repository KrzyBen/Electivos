"use strict";
import Elective from "../entity/elective.entity.js";
import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import sendEmail from "../helpers/sendEmail.helper.js";

export async function createElectiveService(body, profesorUser) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);



    let carreras = [];
    if (Array.isArray(body.carrerasEntidad) && body.carrerasEntidad.length > 0) {
      const carreraRepository = AppDataSource.getRepository('Carrera');
      const ids = body.carrerasEntidad.map(c => typeof c === 'object' && c !== null ? c.id : c);
      carreras = await carreraRepository.find({ where: { id: In(ids) } });
    }

    const newElective = electiveRepository.create({
      titulo: body.titulo,
      contenidos: body.contenidos,
      cupoMaximo: body.cupoMaximo,
      cupoDisponible: body.cupoMaximo,
      cupoMaximoCarrera: 10,
      cupoDisponibleCarrera: 10,
      horario: body.horario,
      horaInicio: body.horaInicio,
      horaFinal: body.horaFinal,
      requisitos: body.requisitos || null,
      profesor: profesorUser,
      validado: false,
      carrerasEntidad: carreras,
    });

    const saved = await electiveRepository.save(newElective);

    const savedWithProfesor = await electiveRepository.findOne({
      where: { id: saved.id },
      relations: ["profesor"],
    });

    return [savedWithProfesor ?? saved, null];
  } catch (error) {
    console.error("Error al crear electivo:", error);
    return [null, "Error interno del servidor"];
  }
}


export async function getAvailableElectivesService() {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electives = await electiveRepository.find({
      where: {validado: true, cupoDisponible: MoreThan(0),},
      relations: ["profesor"],
    });

    return [electives, null];
  } catch (error) {
    console.error("Error al obtener electivos:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAllElectivesService() {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electives = await electiveRepository.find({ relations: ["profesor"] });

    return [electives, null];
  } catch (error) {
    console.error("Error al obtener todos los electivos:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function validateElectiveService(id) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electiveFound = await electiveRepository.findOneBy({ id: Number(id) });

    if (!electiveFound) return [null, "Electivo no encontrado"];

    if (electiveFound.validado) return [null, "El electivo ya está validado"];

    electiveFound.validado = true;
    electiveFound.updatedAt = new Date();

    const saved = await electiveRepository.save(electiveFound);

    return [saved, null];
  } catch (error) {
    console.error("Error al validar electivo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getElectiveByIdService(id) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const elective = await electiveRepository.findOne({ where: { id: Number(id) }, relations: ["profesor"] });

    if (!elective) return [null, "Electivo no encontrado"];

    return [elective, null];
  } catch (error) {
    console.error("Error al obtener electivo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateElectiveService(id, updates, profesorId) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electiveFound = await electiveRepository.findOne({
      where: { id: Number(id) },
      relations: ["profesor"],
    });

    if (!electiveFound) return [null, "Electivo no encontrado"];
    
    if (electiveFound.profesor.id !== profesorId) {
      return [null, "No tienes permiso para editar este electivo"];
    }

    if (electiveFound.validado) {
      return [null, "No se puede editar un electivo ya validado"];
    }
    electiveFound.titulo = updates.titulo;
    electiveFound.contenidos = updates.contenidos;
    electiveFound.cupoMaximo = updates.cupoMaximo;
    if (updates.horario) {
      electiveFound.horario = updates.horario;
    }
    if (updates.horaInicio) {
      electiveFound.horaInicio = updates.horaInicio;
    }
    if (updates.horaFinal) {
      electiveFound.horaFinal = updates.horaFinal;
    }
    electiveFound.requisitos = updates.requisitos || null;
    if (Array.isArray(updates.carrerasEntidad)) {
      const carreraRepository = AppDataSource.getRepository('Carrera');
      const ids = updates.carrerasEntidad.map(c => typeof c === 'object' && c !== null ? c.id : c);
      const carreras = await carreraRepository.find({ where: { id: In(ids) } });
      electiveFound.carrerasEntidad = carreras;
    }
    electiveFound.updatedAt = new Date();

    const saved = await electiveRepository.save(electiveFound);
    return [saved, null];
  } catch (error) {
    console.error("Error al actualizar electivo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getElectivesByProfesorService(profesorId) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electives = await electiveRepository.find({
      where: { profesor: { id: profesorId } },
      relations: ["profesor"],
    });

    return [electives, null];
  } catch (error) {
    console.error("Error al obtener electivos del profesor:", error);
    return [null, "Error interno del servidor"];
  }
}



export async function deleteElectiveService(id) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const elective = await electiveRepository.findOne({
      where: { id: Number(id) },
      relations: ["profesor"],
    });

    if (!elective) {
      return [null, "Electivo no encontrado"];
    }

    const profesorEmail = elective.profesor?.email;
    const tituloElectivo = elective.titulo;


    const result = await electiveRepository.delete({ id: Number(id) });

    if (result.affected === 0) {
      return [null, "Electivo no encontrado"];
    }

    if (profesorEmail) {
      const mensaje = `Estimado/a profesor/a,\n\nLe informamos que su electivo \"${tituloElectivo}\" no fue elegido para ser impartido este periodo.\n\nSaludos.`;
      await sendEmail({
        to: profesorEmail,
        subject: "Notificación: Electivo no será impartido",
        text: mensaje,
      });
    }

    return [{ id }, null];
  } catch (error) {
    console.error("Error al eliminar electivo:", error);
    return [null, "Error interno del servidor"];
  }
}
