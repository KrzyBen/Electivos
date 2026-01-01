"use strict";

import PDFDocument from 'pdfkit';
import ElectivoLista from '../entity/electivoLista.entity.js';
import User from '../entity/user.entity.js';
import { AppDataSource } from "../config/configDb.js";
import {
  createElectiveService,
  getAvailableElectivesService,
  getElectivesByProfesorService,
  validateElectiveService,
  getElectiveByIdService,
  getAllElectivesService,
  updateElectiveService,
  deleteElectiveService,
} from "../services/elective.service.js";

import {
  electiveValidation,
  electiveUpdateValidation,
} from "../validations/elective.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function createElective(req, res) {
  try {
    const { body } = req;

    const { error } = electiveValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [elective, electiveError] =
      await createElectiveService(body, req.user);

    if (electiveError) {
      return handleErrorClient(res, 400, "Error creando electivo", electiveError);
    }

    handleSuccess(res, 201, "Electivo creado y pendiente de validación", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getElectives(req, res) {
  try {
    let electives, errorElectives;

    const userRole = req.user?.rol?.toLowerCase();

    if (userRole === "profesor") {
      [electives, errorElectives] =
        await getElectivesByProfesorService(req.user.id);
    } else {
      [electives, errorElectives] =
        await getAvailableElectivesService();
    }

    if (errorElectives) {
      return handleErrorClient(res, 404, errorElectives);
    }

    handleSuccess(res, 200, "Electivos", electives || []);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateElective(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!id) {
      return handleErrorClient(res, 400, "El id del electivo es requerido");
    }

    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return handleErrorClient(
        res,
        400,
        "Id inválido",
        "El id del electivo debe ser un número entero válido"
      );
    }

    const { error } = electiveUpdateValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [elective, errorElective] =
      await updateElectiveService(idNum, body, req.user.id);

    if (errorElective) {
      return handleErrorClient(
        res,
        400,
        "Error actualizando electivo",
        errorElective
      );
    }

    handleSuccess(res, 200, "Electivo actualizado correctamente", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllElectives(req, res) {
  try {
    const [electives, errorElectives] =
      await getAllElectivesService();

    if (errorElectives) {
      return handleErrorClient(res, 404, errorElectives);
    }

    handleSuccess(res, 200, "Todos los electivos", electives || []);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function validateElective(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return handleErrorClient(res, 400, "El id del electivo es requerido");
    }

    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return handleErrorClient(
        res,
        400,
        "Id inválido",
        "El id del electivo debe ser un número entero válido"
      );
    }

    const [elective, errorElective] =
      await validateElectiveService(idNum);

    if (errorElective) {
      return handleErrorClient(
        res,
        400,
        "Error validando electivo",
        errorElective
      );
    }

    handleSuccess(res, 200, "Electivo validado correctamente", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getElectiveById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return handleErrorClient(res, 400, "El id del electivo es requerido");
    }

    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return handleErrorClient(
        res,
        400,
        "Id inválido",
        "El id del electivo debe ser un número entero válido"
      );
    }

    const [elective, errorElective] =
      await getElectiveByIdService(idNum);

    if (errorElective) {
      return handleErrorClient(res, 404, errorElective);
    }

    handleSuccess(res, 200, "Electivo encontrado", elective);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteElective(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return handleErrorClient(res, 400, "El id del electivo es requerido");
    }
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) {
      return handleErrorClient(
        res,
        400,
        "Id inválido",
        "El id del electivo debe ser un número entero válido"
      );
    }
    const [deleted, error] = await deleteElectiveService(idNum);
    if (error) {
      return handleErrorClient(res, 400, "Error eliminando electivo", error);
    }
    handleSuccess(res, 200, "Electivo eliminado correctamente", deleted);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function exportInscritosPDF(req, res) {
  try {
    const electivoId = Number(req.params.id);

    const electivoListaRepository =
      AppDataSource.getRepository(ElectivoLista);

    const inscritos = await electivoListaRepository.find({
      where: {
        electivo: { id: electivoId },
      },
      relations: ["alumno"],
      order: {
        alumno: { nombreCompleto: "ASC" },
      },
    });

    if (!inscritos.length) {
      return res
        .status(404)
        .json({ message: "No hay alumnos inscritos en este electivo." });
    }

    // PDF
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inscritos_electivo_${electivoId}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Lista de Alumnos Inscritos", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Electivo ID: ${electivoId}`);
    doc.moveDown();

    // Cabecera
    doc.fontSize(12)
      .text("N°", 50, doc.y, { continued: true })
      .text("Nombre", 90, doc.y, { continued: true })
      .text("RUT", 250, doc.y, { continued: true })
      .text("Email", 350, doc.y);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    inscritos.forEach((item, index) => {
      const alumno = item.alumno;
      doc
        .text(`${index + 1}`, 50, doc.y, { continued: true })
        .text(alumno?.nombreCompleto ?? "", 90, doc.y, { continued: true })
        .text(alumno?.rut ?? "", 250, doc.y, { continued: true })
        .text(alumno?.email ?? "", 350, doc.y);
    });

    doc.end();
  } catch (error) {
    console.error("Error exportando PDF:", error);
    return res
      .status(500)
      .json({ message: "Error al exportar inscritos en PDF." });
  }
}