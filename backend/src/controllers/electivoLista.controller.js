"use strict";

import {
  createElectivoListaService,
  listarElectivoListaService,
  updateElectivoListaService,
  removeElectivoListaService,
  getElectivesValidadosService,
  replaceElectivoListaService,
  enviarListaService,
} from "../services/electivoLista.service.js";

import {
  createElectivoListaSchema,
  updateElectivoListaSchema,
  idParamSchema
} from "../validations/electivoLista.validation.js";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

/**
 * Crear un nuevo registro de electivo en la lista del alumno
 */
export async function createElectivoLista(req, res) {
  try {
    const { error, value } = createElectivoListaSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const mensajes = error.details.map(e => e.message);
      return handleErrorClient(res, 400, mensajes);
    }

    const userId = req.user?.id;

    // Llamamos al service incluyendo reemplazarId
    const [nuevoElectivo, serviceError] = await createElectivoListaService(userId, {
      electivoId: value.electivoId,
      posicion: value.posicion,
      reemplazarId: value.reemplazarId,
    });

    if (serviceError) {
      // Si el error es un conflicto de horario
      if (typeof serviceError === "object" && serviceError.conflicto) {
        return handleErrorClient(res, 409, serviceError);
      }

      // Errores normales (duplicado, sin cupo, etc.)
      return handleErrorClient(res, 400, serviceError);
    }

    // Éxito
    return handleSuccess(res,201,"Electivo añadido a la lista correctamente",nuevoElectivo);
  } catch (err) {
    console.error("Error en createElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al añadir el electivo en la lista");
  }
}

/**
 * Listar electivos del alumno
 */
export async function listarElectivoLista(req, res) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;

    const [lista, serviceError] = await listarElectivoListaService(userId, { page, limit });
    if (serviceError) return handleErrorClient(res, 404, serviceError);

    return handleSuccess(res, 200, "Lista de electivos obtenida correctamente", lista);
  } catch (err) {
    console.error("Error en listElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al listar los electivos");
  }
}

/**
 * Actualizar un elemento de la lista de electivos
 */
export async function updateElectivoLista(req, res) {
  try {
    const { error: paramsError } = idParamSchema.validate(req.params, { abortEarly: false });
    if (paramsError) {
      const mensajes = paramsError.details.map(e => e.message);
      return handleErrorClient(res, 400, mensajes);
    }

    const { error, value } = updateElectivoListaSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const mensajes = error.details.map(e => e.message);
      return handleErrorClient(res, 400, mensajes);
    }

    const id = Number(req.params.id);
    const userId = req.user?.id;

    const [actualizado, serviceError] = await updateElectivoListaService(userId, id, value);
    if (serviceError) return handleErrorClient(res, 404, serviceError);

    return handleSuccess(res, 200, "Elemento de lista actualizado correctamente", actualizado);
  } catch (err) {
    console.error("Error en updateElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al actualizar el elemento de lista");
  }
}

/**
 * Eliminar un elemento de la lista de electivos
 */
export async function removeElectivoLista(req, res) {
  try {
    const { error } = idParamSchema.validate(req.params, { abortEarly: false });
    if (error) {
      const mensajes = error.details.map(e => e.message);
      return handleErrorClient(res, 400, mensajes);
    }

    const id = Number(req.params.id);
    const userId = req.user?.id;

    const [eliminado, serviceError] = await removeElectivoListaService(id, userId);
    if (serviceError) return handleErrorClient(res, 404, serviceError);

    return handleSuccess(res, 200, "Elemento eliminado correctamente", eliminado);
  } catch (err) {
    console.error("Error en removeElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al eliminar el elemento de lista");
  }
}


/**
 * Electivos validados para el alumno
 */
export async function getElectivesValidados(req, res) {
  try {
    const [electives, error] = await getElectivesValidadosService();
    if (error) return handleErrorClient(res, 404, error);

    return handleSuccess(res, 200, "Electivos validados obtenidos correctamente", electives);
  } catch (err) {
    console.error("Error en getElectivesValidados:", err);
    return handleErrorServer(res, 500, "Error al obtener los electivos validados");
  }
}


/**
 * Reemplazar un electivo en la lista del alumno
 */

export async function replaceElectivoLista(req, res) {
  try {
    const userId = req.user?.id;
    console.log("replaceElectivoLista controller called with userId:", userId, "body:", req.body);
    const [result, error] = await replaceElectivoListaService(userId, req.body);
    if (error) return handleErrorClient(res, 400, error);

    return handleSuccess(res, 200, "Electivo reemplazado correctamente", result);
  } catch (err) {
    console.error("Error en replaceElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al reemplazar electivo");
  }
}

/**
 * El Alumno envia su lista de electivos para validación
 */

export async function enviarElectivoLista(req, res) {
  try {
    const userId = req.user?.id;

    const [resultado, serviceError] = await enviarListaService(userId);

    if (serviceError) {
      return handleErrorClient(res, 400, serviceError);
    }

    return handleSuccess(
      res,
      200,
      "Lista enviada correctamente. Ya no puedes modificar tus electivos.",
      resultado
    );
  } catch (err) {
    console.error("Error en enviarElectivoLista:", err);
    return handleErrorServer(res, 500, "Error al enviar la lista");
  }
}