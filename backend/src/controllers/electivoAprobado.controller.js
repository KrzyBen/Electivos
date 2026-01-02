"use strict";
import { aprobarListaAlumno, getMisElectivosAprobadosService } from "../services/electivoAprobado.service.js";
import { handleSuccess, handleErrorClient } from "../handlers/responseHandlers.js";

export async function aprobarLista(req, res) {
  try {
    const { alumnoId } = req.params;

    const result = await aprobarListaAlumno(alumnoId);

    return handleSuccess(res, 200, "Lista aprobada correctamente", result);
  } catch (error) {
    return handleErrorClient(res, 400, error.message);
  }
}

export async function getMisElectivosAprobados(req, res) {
  try {
    const userId = req.user?.id;
    const periodId = req.query.periodId ? Number(req.query.periodId) : null;

    const [electivos, error] = await getMisElectivosAprobadosService(
      userId,
      periodId
    );

    if (error) return handleErrorClient(res, 404, error);

    return handleSuccess(
      res,
      200,
      "Electivos aprobados obtenidos correctamente",
      electivos
    );
  } catch (err) {
    console.error("Error en getMisElectivosAprobados:", err);
    return handleErrorServer(res, 500, "Error al obtener electivos aprobados");
  }
}