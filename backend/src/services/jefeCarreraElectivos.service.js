"use strict";

import { AppDataSource } from "../config/configDb.js";
import User from "../entity/user.entity.js";
import ElectivoLista from "../entity/electivoLista.entity.js";
import Elective from "../entity/elective.entity.js";
import { hayConflictoHorario } from "../helpers/horario.helper.js";

/**
 * Obtener alumnos de la misma carrera del jefe de carrera
 */
export async function getAlumnosCarreraService(jefeId) {
  const userRepo = AppDataSource.getRepository(User);

  const jefe = await userRepo.findOne({
    where: { id: jefeId },
    relations: ["carreraEntidad"],
  });

  if (!jefe || !jefe.carreraEntidad)
    return [null, "Jefe de carrera no válido"];

  const alumnos = await userRepo.find({
    where: {
      rol: "Alumno",
      carreraEntidad: { id: jefe.carreraEntidad.id },
    },
    relations: ["carreraEntidad"],
  });

  return [alumnos, null];
}

/**
 * Obtener lista de electivos de un alumno (misma carrera)
 */
export async function getListaAlumnoService(jefeId, alumnoId) {
  const userRepo = AppDataSource.getRepository(User);
  const listaRepo = AppDataSource.getRepository(ElectivoLista);

  const jefe = await userRepo.findOne({
    where: { id: jefeId },
    relations: ["carreraEntidad"],
  });

  const alumno = await userRepo.findOne({
    where: { id: alumnoId },
    relations: ["carreraEntidad"],
  });

  if (!jefe || !alumno)
    return [null, "Usuario no encontrado"];

  if (jefe.carreraEntidad.id !== alumno.carreraEntidad.id)
    return [null, "No autorizado para ver este alumno"];

  const lista = await listaRepo.find({
    where: { alumno: { id: alumnoId } },
    order: { posicion: "ASC" },
    relations: [
      "electivo",
      "electivo.profesor" 
    ],
  });

  return [lista, null];
}


/**
 * Cambiar estado de un electivo del alumno
 */
export async function updateEstadoElectivoAlumnoService(
  jefeId,
  electivoListaId,
  nuevoEstado
) {
  const userRepo = AppDataSource.getRepository(User);
  const listaRepo = AppDataSource.getRepository(ElectivoLista);

  const jefe = await userRepo.findOne({
    where: { id: jefeId },
    relations: ["carreraEntidad"],
  });

  const item = await listaRepo.findOne({
    where: { id: electivoListaId },
    relations: ["alumno", "alumno.carreraEntidad"],
  });

  if (!item) return [null, "Registro no encontrado"];

  if (item.alumno.carreraEntidad.id !== jefe.carreraEntidad.id)
    return [null, "No autorizado"];

  if (!["aprobado", "rechazado"].includes(nuevoEstado))
    return [null, "Estado no válido"];

  item.estado = nuevoEstado;
  await listaRepo.save(item);

  return [item, null];
}

export async function replaceElectivoListaJefeService(
  alumnoId,
  oldElectivoId,
  newElectivoId
) {
  try {
    const listaRepo = AppDataSource.getRepository(ElectivoLista);
    const electiveRepo = AppDataSource.getRepository(Elective);

    const currentItem = await listaRepo.findOne({
      where: {
        alumno: { id: alumnoId },
        electivo: { id: oldElectivoId },
      },
      relations: ["electivo"],
    });

    if (!currentItem)
      return [null, "El alumno no tiene ese electivo"];

    const newElectivo = await electiveRepo.findOne({
      where: { id: newElectivoId },
    });

    if (!newElectivo)
      return [null, "El nuevo electivo no existe"];

    // ✅ NUEVO: validar duplicado
    const alreadyInList = await listaRepo.findOne({
      where: {
        alumno: { id: alumnoId },
        electivo: { id: newElectivoId },
      },
    });

    if (alreadyInList)
      return [null, "El alumno ya tiene este electivo en su lista"];

    // 🕒 Conflictos horarios
    const otherElectives = await listaRepo.find({
      where: { alumno: { id: alumnoId } },
      relations: ["electivo"],
    });

    const conflict = otherElectives.find(
      (item) =>
        item.electivo.id !== oldElectivoId &&
        hayConflictoHorario(item.electivo, newElectivo)
    );

    if (conflict)
      return [null, "Conflicto de horario con otro electivo"];

    const replaced = await AppDataSource.transaction(async (manager) => {
      const listaTx = manager.getRepository(ElectivoLista);
      const electivoTx = manager.getRepository(Elective);

      await electivoTx.decrement(
        { id: newElectivo.id },
        "cupoDisponible",
        1
      );
      await electivoTx.increment(
        { id: currentItem.electivo.id },
        "cupoDisponible",
        1
      );

      currentItem.electivo = newElectivo;
      return await listaTx.save(currentItem);
    });

    return [replaced, null];
  } catch (err) {
    console.error("Error replaceElectivoListaJefeService:", err);
    return [null, "Error interno del servidor"];
  }
}

export async function getElectivosCarreraJefeService(userId) {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const electiveRepo = AppDataSource.getRepository("Elective");

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["carreraEntidad"],
    });

    if (!user) return [null, "Usuario no encontrado"];
    if (!user.carreraEntidad)
      return [null, "El jefe no tiene una carrera asociada"];

    const carreraId = user.carreraEntidad.id;

    const electives = await electiveRepo
      .createQueryBuilder("elective")
      .leftJoinAndSelect("elective.profesor", "profesor")
      .innerJoin(
        "elective.carrerasEntidad",
        "carrera",
        "carrera.id = :carreraId",
        { carreraId }
      )
      .where("elective.validado = true")
      .orderBy("elective.titulo", "ASC")
      .getMany();

    return [electives, null];
  } catch (error) {
    console.error("Error getElectivosCarreraJefeService:", error);
    return [null, "Error interno del servidor"];
  }
}
