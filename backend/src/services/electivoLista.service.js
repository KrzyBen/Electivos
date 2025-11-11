"use strict";

import { AppDataSource } from "../config/configDb.js";
import ElectivoLista from "../entity/electivoLista.entity.js";
import Elective from "../entity/elective.entity.js";
import User from "../entity/user.entity.js";

export async function createElectivoListaService(userId, body) {
  try {
    const { electivoId, posicion } = body;

    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);
    const electiveRepository = AppDataSource.getRepository(Elective);
    const userRepository = AppDataSource.getRepository(User);

    // Buscar alumno con su carrera
    const userFound = await userRepository.findOne({
      where: { id: userId },
      relations: ["carreraEntidad"]
    });
    if (!userFound) return [null, "Usuario no encontrado"];
    if (!userFound.carreraEntidad)
      return [null, "El usuario no tiene una carrera asignada"];

    // Buscar electivo con sus carreras
    const electiveFound = await electiveRepository.findOne({
      where: { id: electivoId },
      relations: ["carrerasEntidad"],
    });
    if (!electiveFound) return [null, "Electivo no encontrado"];

    // Validar que el electivo esté aprobado/validado
    if (!electiveFound.validado) {
      return [null, "Este electivo aún no ha sido validado por la administración."];
    }

    // Validar que el electivo pertenezca a la carrera del alumno
    const alumnoCarreraId = userFound.carreraEntidad.id;
    const carrerasElectivo = electiveFound.carrerasEntidad.map((c) => c.id);

    if (!carrerasElectivo.includes(alumnoCarreraId)) {
      return [
        null,
        `No puedes inscribirte en este electivo. No pertenece a tu carrera (${userFound.carreraEntidad.nombre}).`,
      ];
    }

    // Evitar duplicados
    const alreadyExists = await electivoListaRepository.findOne({
      where: {
        alumno: { id: Number(userId) },
        electivo: { id: Number(electivoId) },
      },
    });
    if (alreadyExists)
      return [null, "Este electivo ya está en tu lista."];

    // Validar cupo
    if (electiveFound.cupoDisponible <= 0)
      return [null, "No hay cupos disponibles para este electivo."];

    // Verificar conflictos de horario
    const currentElectives = await electivoListaRepository.find({
      where: { alumno: { id: userId } },
      relations: ["electivo"],
    });

    const conflicting = currentElectives.find(
      (item) => item.electivo.horario === electiveFound.horario
    );

    if (conflicting) {
      return [
        null,
        {
          message:
            "Conflicto de horario detectado. No puedes inscribir dos electivos con el mismo horario.",
          conflicto: {
            actual: {
              id: conflicting.electivo.id,
              titulo: conflicting.electivo.titulo,
              horario: conflicting.electivo.horario,
            },
            nuevo: {
              id: electiveFound.id,
              titulo: electiveFound.titulo,
              horario: electiveFound.horario,
            },
          },
        },
      ];
    }

    // Transacción para insertar y descontar cupo
    const saved = await AppDataSource.transaction(async (manager) => {
      const listaRepo = manager.getRepository(ElectivoLista);
      const electiveRepo = manager.getRepository(Elective);

      // Calcular posición final
      let finalPosicion = posicion;
      if (!finalPosicion) {
        const max = await listaRepo
          .createQueryBuilder("el")
          .select("MAX(el.posicion)", "max")
          .where("el.alumno_id = :userId", { userId })
          .getRawOne();

        finalPosicion = (max?.max ?? 0) + 1;
      }

      // Agregar nuevo electivo
      const savedItem = await listaRepo.save({
        alumno: { id: Number(userId) },
        electivo: { id: Number(electivoId) },
        posicion: finalPosicion,
      });

      // Descontar cupo
      await electiveRepo.decrement(
        { id: electiveFound.id },
        "cupoDisponible",
        1
      );

      return savedItem;
    });

    return [saved, null];
  } catch (error) {
    console.error("Error al crear electivo en la lista:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function listarElectivoListaService(userId, query = {}) {
  try {
    const { page = 1, limit = 50 } = query;

    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);

    const [items, total] = await electivoListaRepository.findAndCount({
      where: { alumno: { id: userId } },
      relations: ["electivo"],
      order: { posicion: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (items.length === 0)
      return [null, "El alumno no tiene electivos en su lista"];

    return [{ items, total, page, limit }, null];
  } catch (error) {
    console.error("Error al obtener lista de electivos del alumno:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateElectivoListaService(userId, id, body) {
  try {
    const { electivoId, posicion } = body;

    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);
    const electiveRepository = AppDataSource.getRepository(Elective);

    const itemFound = await electivoListaRepository.findOne({
      where: { id, alumno: { id: userId } },
      relations: ["electivo", "alumno"],
    });

    if (!itemFound) return [null, "Elemento de lista no encontrado"];

    if (electivoId) {
      const electiveFound = await electiveRepository.findOne({
        where: { id: electivoId },
      });
      if (!electiveFound) return [null, "Electivo no encontrado"];
      itemFound.electivo = electiveFound;
    }

    if (posicion && posicion !== itemFound.posicion) {
      const oldPos = itemFound.posicion;

      if (posicion < oldPos) {
        await electivoListaRepository
          .createQueryBuilder()
          .update(ElectivoLista)
          .set({ posicion: () => "posicion + 1" })
          .where(
            "alumno_id = :userId AND posicion >= :newPos AND posicion < :oldPos",
            { userId, newPos: posicion, oldPos }
          )
          .execute();
      } else {
        await electivoListaRepository
          .createQueryBuilder()
          .update(ElectivoLista)
          .set({ posicion: () => "posicion - 1" })
          .where(
            "alumno_id = :userId AND posicion <= :newPos AND posicion > :oldPos",
            { userId, newPos: posicion, oldPos }
          )
          .execute();
      }

      itemFound.posicion = posicion;
    }

    const updated = await electivoListaRepository.save(itemFound);
    return [updated, null];
  } catch (error) {
    console.error("Error al actualizar un electivo de la lista:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function removeElectivoListaService(id, userId) {
  try {
    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);

    const numericUserId = Number(userId);

    // Buscar el elemento en la lista junto con su electivo y alumno
    const itemFound = await electivoListaRepository
      .createQueryBuilder("el")
      .leftJoinAndSelect("el.alumno", "alumno")
      .leftJoinAndSelect("el.electivo", "electivo")
      .where("el.id = :id AND alumno.id = :userId", { id, userId: numericUserId })
      .getOne();

    if (!itemFound) return [null, "Elemento de lista no encontrado"];

    const oldPos = itemFound.posicion;
    const electivo = itemFound.electivo;

    // Iniciar transacción para asegurar coherencia
    await AppDataSource.transaction(async (manager) => {
      const electivoListaRepoTx = manager.getRepository(ElectivoLista);
      const electiveRepoTx = manager.getRepository(Elective);

      // Eliminar el electivo de la lista
      await electivoListaRepoTx.remove(itemFound);

      // Ajustar posiciones
      await electivoListaRepoTx
        .createQueryBuilder()
        .update(ElectivoLista)
        .set({ posicion: () => "posicion - 1" })
        .where("alumno_id = :userId AND posicion > :oldPos", {
          userId: numericUserId,
          oldPos,
        })
        .execute();

      // Sumar 1 al cupo del electivo eliminado
      await electiveRepoTx
        .createQueryBuilder()
        .update(Elective)
        .set({ cupoDisponible: () => "cupoDisponible + 1" })
        .where("id = :electivoId", { electivoId: electivo.id })
        .execute();
    });

    return [
      {
        deletedId: id,
        cupoLiberadoEn: electivo.titulo,
      },
      null,
    ];
  } catch (error) {
    console.error("Error al eliminar un electivo de la lista:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

// El alumno trae los electivos disponibles para agregar a su lista
export async function getElectivesValidadosService(userId) {
  try {
    const userRepository = AppDataSource.getRepository("User");
    const electiveRepository = AppDataSource.getRepository("Elective");

    // Traer al usuario con su carreraEntidad
    const userFound = await userRepository.findOne({
      where: { id: userId },
      relations: ["carreraEntidad"],
    });

    if (!userFound)
      return [null, "Usuario no encontrado"];

    const userCarrera = userFound.carreraEntidad;

    // Si el usuario no tiene carrera asignada
    if (!userCarrera)
      return [null, "El usuario no tiene una carrera asociada"];

    // Buscar electivos validados y que correspondan a la carrera del usuario
    const electives = await electiveRepository
      .createQueryBuilder("elective")
      .leftJoinAndSelect("elective.profesor", "profesor")
      .leftJoinAndSelect("elective.carrerasEntidad", "carrera")
      .where("elective.validado = :validado", { validado: true })
      .andWhere("carrera.id = :carreraId", { carreraId: userCarrera.id })
      .orderBy("elective.titulo", "ASC")
      .getMany();

    if (!electives.length)
      return [null, "No hay electivos validados disponibles para tu carrera"];

    return [electives, null];
  } catch (error) {
    console.error("Error en getElectivesValidadosService:", error);
    return [null, `Error interno del servidor: ${error.message}`];
  }
}

export async function replaceElectivoListaService(userId, body) {
  try {
    const { oldElectivoId, newElectivoId } = body;

    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);
    const electiveRepository = AppDataSource.getRepository(Elective);
    const userRepository = AppDataSource.getRepository(User);

    // Buscar alumno con su carrera
    const userFound = await userRepository.findOne({
      where: { id: userId },
      relations: ["carreraEntidad"],
    });
    if (!userFound) return [null, "Usuario no encontrado"];
    if (!userFound.carreraEntidad)
      return [null, "El usuario no tiene una carrera asignada"];

    const alumnoCarreraId = userFound.carreraEntidad.id;

    // Buscar electivo nuevo con sus carreras
    const newElectivo = await electiveRepository.findOne({
      where: { id: newElectivoId },
      relations: ["carrerasEntidad"],
    });
    if (!newElectivo) return [null, "El nuevo electivo no existe"];

    // Validar que el electivo nuevo pertenezca a la carrera del alumno
    const carrerasElectivo = newElectivo.carrerasEntidad.map((c) => c.id);
    if (!carrerasElectivo.includes(alumnoCarreraId)) {
      return [
        null,
        `No puedes inscribirte en este electivo. No pertenece a tu carrera (${userFound.carreraEntidad.nombre}).`,
      ];
    }

    // Buscar la lista del alumno con el electivo actual
    const currentItem = await electivoListaRepository.findOne({
      where: {
        alumno: { id: Number(userId) },
        electivo: { id: Number(oldElectivoId) },
      },
      relations: ["electivo"],
    });
    if (!currentItem)
      return [null, "No tienes inscrito el electivo que deseas reemplazar"];

    // Evitar reemplazo por el mismo electivo
    if (oldElectivoId === newElectivoId)
      return [null, "No puedes reemplazar por el mismo electivo"];

    // Validar cupo disponible
    if (newElectivo.cupoDisponible <= 0)
      return [null, "No hay cupos disponibles para el nuevo electivo."];

    // Validar conflicto de horario
    if (currentItem.electivo.horario === newElectivo.horario) {
      return [
        null,
        {
          message: "El nuevo electivo tiene el mismo horario que el anterior.",
          conflicto: {
            actual: {
              id: currentItem.electivo.id,
              titulo: currentItem.electivo.titulo,
              horario: currentItem.electivo.horario,
            },
            nuevo: {
              id: newElectivo.id,
              titulo: newElectivo.titulo,
              horario: newElectivo.horario,
            },
          },
        },
      ];
    }

    const otherElectives = await electivoListaRepository.find({
      where: { alumno: { id: userId } },
      relations: ["electivo"],
    });

    const horarioConflict = otherElectives.find(
      (item) =>
        item.electivo.id !== oldElectivoId &&
        item.electivo.horario === newElectivo.horario
    );

    if (horarioConflict) {
      return [
        null,
        {
          message:
            "Conflicto de horario detectado. No puedes inscribirte en este electivo.",
          conflicto: {
            actual: {
              id: horarioConflict.electivo.id,
              titulo: horarioConflict.electivo.titulo,
              horario: horarioConflict.electivo.horario,
            },
            nuevo: {
              id: newElectivo.id,
              titulo: newElectivo.titulo,
              horario: newElectivo.horario,
            },
          },
        },
      ];
    }

    // Transacción: reemplazar electivo y ajustar cupos
    const replaced = await AppDataSource.transaction(async (manager) => {
      const listaRepo = manager.getRepository(ElectivoLista);
      const electiveRepo = manager.getRepository(Elective);

      // Eliminar cupo del nuevo y devolver cupo del anterior
      await electiveRepo.decrement({ id: newElectivo.id }, "cupoDisponible", 1);
      await electiveRepo.increment(
        { id: currentItem.electivo.id },
        "cupoDisponible",
        1
      );

      // Actualizar relación de electivo en la lista
      currentItem.electivo = newElectivo;
      return await listaRepo.save(currentItem);
    });

    return [replaced, null];
  } catch (error) {
    console.error("Error en replaceElectivoListaService:", error);
    return [null, "Error interno del servidor"];
  }
}