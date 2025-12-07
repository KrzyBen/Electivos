"use strict";
import {
  createElectiveService,
  getAvailableElectivesService,
  validateElectiveService,
  getElectiveByIdService,
  getAllElectivesService,
} from "../services/elective.service.js";
import { electiveValidation } from "../validations/elective.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createElective(req, res) {
  try {
    const { body } = req;

    const { error } = electiveValidation.validate(body);

    if (error) return handleErrorClient(res, 400, "Error de validación", error.message);

    const [elective, electiveError] = await createElectiveService(body, req.user);

    if (electiveError) return handleErrorClient(res, 400, "Error creando electivo", electiveError);

    handleSuccess(res, 201, "Electivo creado y pendiente de validación", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getElectives(req, res) {
  try {
    const [electives, errorElectives] = await getAvailableElectivesService();

    if (errorElectives) return handleErrorClient(res, 404, errorElectives);

    electives.length === 0 ? handleSuccess(res, 204) : handleSuccess(res, 200, "Electivos disponibles", electives);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllElectives(req, res) {
  try {
    const [electives, errorElectives] = await getAllElectivesService();

    if (errorElectives) return handleErrorClient(res, 404, errorElectives);

    electives.length === 0 ? handleSuccess(res, 204) : handleSuccess(res, 200, "Todos los electivos", electives);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function validateElective(req, res) {
  try {
    const { id } = req.params;

    if (!id) return handleErrorClient(res, 400, "El id del electivo es requerido");

    const idNum = Number(id);
    if (Number.isNaN(idNum) || !Number.isInteger(idNum)) {
      return handleErrorClient(res, 400, "Id inválido", "El id del electivo debe ser un número entero válido");
    }

    const [elective, errorElective] = await validateElectiveService(idNum);

    if (errorElective) return handleErrorClient(res, 400, "Error validando electivo", errorElective);

    handleSuccess(res, 200, "Electivo validado correctamente", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getElectiveById(req, res) {
  try {
    const { id } = req.params;

    if (!id) return handleErrorClient(res, 400, "El id del electivo es requerido");

    const idNum = Number(id);
    if (Number.isNaN(idNum) || !Number.isInteger(idNum)) {
      return handleErrorClient(res, 400, "Id inválido", "El id del electivo debe ser un número entero válido");
    }

    const [elective, errorElective] = await getElectiveByIdService(idNum);

    if (errorElective) return handleErrorClient(res, 404, errorElective);

    handleSuccess(res, 200, "Electivo encontrado", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
