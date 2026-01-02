"use strict";
import { AppDataSource } from "../config/configDb.js";
import ElectivoLista from "../entity/electivoLista.entity.js";
import ElectivoAprobado from "../entity/electivoAprobado.entity.js";

export async function aprobarListaAlumno(alumnoId) {
  return await AppDataSource.transaction(async (manager) => {
    // Buscar toda la lista provisional del alumno
    const listaCompleta = await manager.find(ElectivoLista, {
      where: { alumno: { id: alumnoId } },
      relations: ["electivo", "alumno"],
    });

    if (listaCompleta.length === 0) {
      // Si no hay nada, lanzamos un error
      throw new Error("El alumno no tiene electivos en su lista provisional");
    }

    // Filtrar solo los aprobados
    const listaAprobada = listaCompleta.filter(item => item.estado === "aprobado");

    // Crear registros aprobados (si hay)
    const aprobados = listaAprobada.map(item =>
      manager.create(ElectivoAprobado, {
        alumno: item.alumno,
        electivo: item.electivo,
        fechaAprobacion: new Date(),
      })
    );

    if (aprobados.length > 0) {
      await manager.save(ElectivoAprobado, aprobados);
    }

    // Vaciar toda la lista provisional
    await manager.remove(ElectivoLista, listaCompleta);

    return { aprobados: aprobados.length };
  });
}

export async function getMisElectivosAprobadosService(userId) {
  try {
    const repo = AppDataSource.getRepository(ElectivoAprobado);

    const electivos = await repo.find({
      where: { alumno: { id: userId } },
      relations: ["electivo"],
      order: { createdAt: "ASC" },
    });

    return [electivos, null];
  } catch (error) {
    console.error("Error al obtener electivos aprobados:", error);
    return [null, "Error interno del servidor"];
  }
}