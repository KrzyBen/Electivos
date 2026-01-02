"use strict";

import PDFDocument from 'pdfkit';
import ElectivoLista from '../entity/electivoLista.entity.js';
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
  const comentario = req.query.comentario || null;
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
    const electivoListaRepository = AppDataSource.getRepository(ElectivoLista);
    const electiveRepository = AppDataSource.getRepository("Elective");

    // Obtener electivo para el nombre
    const electivo = await electiveRepository.findOne({ where: { id: electivoId } });
    const electivoTitulo = electivo?.titulo || `ID: ${electivoId}`;

    const inscritos = await electivoListaRepository.find({
      where: {
        electivo: { id: electivoId },
      },
      relations: ["alumno"],
      order: {
        alumno: { nombreCompleto: "ASC" },
      },
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inscritos_electivo_${electivoId}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(18).text("Lista de Alumnos Inscritos", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Electivo: ${electivoTitulo}`);
    doc.moveDown();

    if (!inscritos.length) {
      doc
        .fontSize(12)
        .text("No hay alumnos inscritos en este electivo.", {
          align: "center",
        });
      doc.end();
      return;
    }


    
    const startX = 50;
    const colWidths = [30, 150, 100, 220];
    const headers = ["N°", "Nombre", "RUT", "Email"];
    let y = doc.y;
    headers.forEach((header, i) => {
      doc.font("Helvetica-Bold").fontSize(12).text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: colWidths[i],
        continued: i < headers.length - 1,
        lineBreak: false
      });
    });
    doc.font("Helvetica");
    doc.moveDown(0.5);
    y = doc.y;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();

    inscritos.forEach((item, index) => {
      const alumno = item.alumno;
      let x = startX;
      y = doc.y;
      doc.text(`${index + 1}`, x, y, { width: colWidths[0] });
      x += colWidths[0];
      doc.text(alumno?.nombreCompleto ?? "", x, y, { width: colWidths[1] });
      x += colWidths[1];
      doc.text(alumno?.rut ?? "", x, y, { width: colWidths[2] });
      x += colWidths[2];
      doc.text(alumno?.email ?? "", x, y, { width: colWidths[3] });
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error exportando PDF:", error);
    return res
      .status(500)
      .json({ message: "Error al exportar inscritos en PDF." });
  }
}
