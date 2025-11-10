"use strict";

import { AppDataSource } from "../config/configDb.js";
import ElectivoLista from "../entity/electivoLista.entity.js";
import Elective from "../entity/elective.entity.js";
import User from "../entity/user.entity.js";

export async function createElectivoListaService(userId, body) {
  try {
    const { electivoId, posicion, reemplazarId } = body;

    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);
    const electiveRepository = AppDataSource.getRepository(Elective);
    const userRepository = AppDataSource.getRepository(User);

    // Validar usuario
    const userFound = await userRepository.findOne({ where: { id: userId } });
    if (!userFound) return [null, "Usuario no encontrado"];

    // Validar electivo nuevo
    const electiveFound = await electiveRepository.findOne({
      where: { id: electivoId },
    });
    if (!electiveFound) return [null, "Electivo no encontrado"];

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

    // Si hay conflicto y no se indicó reemplazo, avisamos
    if (conflicting && !reemplazarId) {
      return [
        null,
        {
          message:
            "Conflicto de horario detectado. Debes decidir si reemplazar el electivo existente.",
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

    // Si hay conflicto y el usuario decidió reemplazar
    const saved = await AppDataSource.transaction(async (manager) => {
      const listaRepo = manager.getRepository(ElectivoLista);
      const electiveRepo = manager.getRepository(Elective);

      // Si reemplazarId está definido, eliminamos el electivo anterior
      if (reemplazarId) {
        const oldItem = await listaRepo.findOne({
          where: {
            alumno: { id: userId },
            electivo: { id: reemplazarId },
          },
          relations: ["electivo"],
        });

        if (oldItem) {
          // restaurar cupo del electivo reemplazado
          await electiveRepo.increment(
            { id: oldItem.electivo.id },
            "cupoDisponible",
            1
          );

          // eliminar de la lista
          await listaRepo.remove(oldItem);
        }
      }

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

      // Agregar nuevo electivo y descontar cupo
      const savedItem = await listaRepo.save({
        alumno: { id: Number(userId) },
        electivo: { id: Number(electivoId) },
        posicion: finalPosicion,
      });

      await electiveRepo.decrement({ id: electiveFound.id }, "cupoDisponible", 1);

      return savedItem;
    });

    return [saved, null];
  } catch (error) {
    console.error("Error al crear electivo en la lista:", error);
    return [null, `Error interno del servidor: ${error.message}`];
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
export async function getElectivesValidadosService() {
  try {
    const electiveRepository = AppDataSource.getRepository(Elective);

    // Buscar solo electivos validados, incluyendo al profesor
    const electives = await electiveRepository.find({
      where: { validado: true },
      relations: ["profesor"],
      order: { titulo: "ASC" },
    });

    if (!electives.length) return [null, "No hay electivos validados disponibles"];

    return [electives, null];
  } catch (error) {
    console.error("Error en getElectivesValidadosService:", error);
    return [null, "Error interno del servidor"];
  }
}