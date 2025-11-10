"use strict";
import Elective from "../entity/elective.entity.js";
import { AppDataSource } from "../config/configDb.js";

export async function createElectiveService(body, profesorUser) {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    if (body.cupoMaximo > 45) {
      return [null, "El cupo máximo permitido es 45"]; 
    }

    const newElective = electiveRepository.create({
      titulo: body.titulo,
      contenidos: body.contenidos,
      cupoMaximo: body.cupoMaximo,
      horario: body.horario,
      requisitos: body.requisitos || null,
      profesor: profesorUser,
      validado: false,
    });

    const saved = await electiveRepository.save(newElective);

    return [saved, null];
  } catch (error) {
    console.error("Error al crear electivo:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAvailableElectivesService() {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    const electives = await electiveRepository.find({
      where: { validado: true },
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

    if (updates.cupoMaximo > 45) {
      return [null, "El cupo máximo permitido es 45"];
    }

    // Para PUT reemplazamos todos los campos
    electiveFound.titulo = updates.titulo;
    electiveFound.contenidos = updates.contenidos;
    electiveFound.cupoMaximo = updates.cupoMaximo;
    electiveFound.horario = updates.horario;
    electiveFound.requisitos = updates.requisitos || null;
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
