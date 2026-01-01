"use strict";

import {
  getAlumnosCarreraService,
  getListaAlumnoService,
  updateEstadoElectivoAlumnoService,
  replaceElectivoListaJefeService,
  getElectivosCarreraJefeService
} from "../services/jefeCarreraElectivos.service.js";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function getAlumnosCarrera(req, res) {
  try {
    const [alumnos, error] = await getAlumnosCarreraService(req.user.id);
    if (error) return handleErrorClient(res, 403, error);

    return handleSuccess(res, 200, "Alumnos obtenidos correctamente", alumnos);
  } catch (err) {
    return handleErrorServer(res, 500, "Error al obtener alumnos");
  }
}

export async function getListaAlumno(req, res) {
  try {
    const alumnoId = Number(req.params.alumnoId);

    const [lista, error] = await getListaAlumnoService(
      req.user.id,
      alumnoId
    );

    if (error) return handleErrorClient(res, 403, error);

    return handleSuccess(res, 200, "Lista obtenida correctamente", lista);
  } catch (err) {
    return handleErrorServer(res, 500, "Error al obtener lista del alumno");
  }
}

export async function updateEstadoElectivoAlumno(req, res) {
  try {
    const electivoListaId = Number(req.params.id);
    const { estado } = req.body;

    const [item, error] =
      await updateEstadoElectivoAlumnoService(
        req.user.id,
        electivoListaId,
        estado
      );

    if (error) return handleErrorClient(res, 400, error);

    return handleSuccess(res, 200, "Estado actualizado correctamente", item);
  } catch (err) {
    return handleErrorServer(res, 500, "Error al actualizar estado");
  }
}

export async function replaceElectivoListaJefe(req, res) {
  try {
    const { alumnoId, oldElectivoId, newElectivoId } = req.body;

    if (!alumnoId || !oldElectivoId || !newElectivoId) {
      return handleErrorClient(res, 400, "Datos incompletos");
    }

    const [result, error] =
      await replaceElectivoListaJefeService(
        alumnoId,
        oldElectivoId,
        newElectivoId
      );

    if (error) return handleErrorClient(res, 400, error);

    return handleSuccess(
      res,
      200,
      "Electivo reemplazado por Jefe de Carrera",
      result
    );
  } catch (err) {
    console.error("Error en replaceElectivoListaJefe:", err);
    return handleErrorServer(res, 500, "Error interno");
  }
}

export async function getElectivosCarreraJefe(req, res) {
  try {
    const userId = req.user.id;

    const [electives, error] =
      await getElectivosCarreraJefeService(userId);

    if (error) return handleErrorClient(res, 404, error);

    return handleSuccess(
      res,
      200,
      "Electivos de la carrera obtenidos correctamente",
      electives
    );
  } catch (err) {
    console.error("Error en getElectivosCarreraJefe:", err);
    return handleErrorServer(
      res,
      500,
      "Error al obtener electivos de la carrera"
    );
  }
}