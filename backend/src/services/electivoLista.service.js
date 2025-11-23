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

    //  Verificar si la lista está enviada, no se permite agregar más
    const listaEnviada = await electivoListaRepository.findOne({
      where: { alumno: { id: userId }, estado: "enviado" }
    });

    if (listaEnviada) {
      return [null, "Tu lista ya fue enviada. No puedes agregar más electivos."];
    }

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

      //si no se especifica posición, agregar al final
      if (!finalPosicion) {
        const max = await listaRepo
          .createQueryBuilder("el")
          .select("MAX(el.posicion)", "max")
          .where("el.alumno_id = :userId", { userId })
          .getRawOne();

        finalPosicion = (max?.max ?? 0) + 1;
      } else {
        // Si la posición existe, se deben empujar los otros
        const existsAtPosition = await listaRepo.findOne({
          where: { alumno: { id: userId }, posicion: finalPosicion }
        });

        if (existsAtPosition) {
          await listaRepo
            .createQueryBuilder()
            .update(ElectivoLista)
            .set({ posicion: () => "posicion + 1" })
            .where("alumno_id = :userId AND posicion >= :finalPos", {
              userId,
              finalPos: finalPosicion,
            })
            .execute();
        }
      }

      // Agregar nuevo electivo
      const savedItem = await listaRepo.save({
        alumno: { id: Number(userId) },
        electivo: { id: Number(electivoId) },
        posicion: finalPosicion,
        estado: "guardado",
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

    if (itemFound.estado !== "guardado") {
      return [null, "No puedes modificar este electivo porque la lista ya fue enviada."];
    }

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

    if (itemFound.estado !== "guardado") {
      return [null, "No puedes eliminar electivos porque la lista ya fue enviada."];
    }

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

    // Buscar electivo nuevo con sus carreras
    const newElectivo = await electiveRepository.findOne({
      where: { id: newElectivoId },
      relations: ["carrerasEntidad"],
    });
    if (!newElectivo) return [null, "El nuevo electivo no existe"];

    // Buscar el item actual ANTES de usar currentItem en cualquier lógica
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

    // Validar cupo
    if (newElectivo.cupoDisponible <= 0)
      return [null, "No hay cupos disponibles para el nuevo electivo."];

    if (currentItem.estado !== "guardado") {
      return [null, "No puedes cambiar electivos porque la lista ya fue enviada."];
    }


    // Verificar otros conflictos
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
          message: "Conflicto de horario detectado.",
          conflicto: {
            actual: horarioConflict.electivo,
            nuevo: newElectivo,
          },
        },
      ];
    }

    // Transacción
    const replaced = await AppDataSource.transaction(async (manager) => {
      const listaRepo = manager.getRepository(ElectivoLista);
      const electiveRepo = manager.getRepository(Elective);

      await electiveRepo.decrement({ id: newElectivo.id }, "cupoDisponible", 1);
      await electiveRepo.increment({ id: currentItem.electivo.id }, "cupoDisponible", 1);

      currentItem.electivo = newElectivo;
      return await listaRepo.save(currentItem);
    });

    return [replaced, null];
  } catch (error) {
    console.error("Error en replaceElectivoListaService:", error);
    return [null, "Error interno del servidor"];
  }
}

// El alumno envía su lista de electivos
export async function enviarListaService(userId) {
  try {
    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);

    const items = await electivoListaRepository.find({
      where: { alumno: { id: userId } }
    });

    if (!items.length)
      return [null, "No tienes electivos en tu lista para enviar."];

    // Si ya tiene enviados
    const yaEnviado = items.some(item => item.estado === "enviado");
    if (yaEnviado)
      return [null, "La lista ya fue enviada previamente."];

    await electivoListaRepository
      .createQueryBuilder()
      .update(ElectivoLista)
      .set({ estado: "enviado" })
      .where("alumno_id = :userId", { userId })
      .execute();

    return ["Lista enviada correctamente", null];
  } catch (err) {
    console.error("Error en enviarListaService:", err);
    return [null, "Error interno del servidor"];
  }
}

export async function enviarListasAutomaticamenteService() {
  try {
    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);

    // Buscar todos los electivos con periodo terminado
    const electivesRepository = AppDataSource.getRepository(Elective);
    const now = new Date();

    const periodosTerminados = await electivesRepository.find({
      where: {
        fechaFin: LessThan(now)
      }
    });

    if (!periodosTerminados.length) {
      return ["No hay periodos de inscripción terminados", null];
    }

    const electivoIds = periodosTerminados.map(e => e.id);

    // Buscar listas que estén guardadas o pendientes
    const listasPendientes = await electivoListaRepository.find({
      where: {
        electivo: { id: In(electivoIds) },
        estado: In(["guardado", "pendiente"])
      }
    });

    if (!listasPendientes.length) {
      return ["No hay listas pendientes para enviar", null];
    }

    // Enviar las listas
    await electivoListaRepository
      .createQueryBuilder()
      .update(ElectivoLista)
      .set({ estado: "enviado" })
      .where("estado IN (:...estados)", { estados: ["guardado", "pendiente"] })
      .andWhere("electivo_id IN (:...electivos)", { electivos: electivoIds })
      .execute();

    return ["Listas enviadas automáticamente", null];

  } catch (error) {
    console.error("Error en envío automático:", error);
    return [null, "Error interno del servidor"];
  }
}