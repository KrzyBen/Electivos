"use strict";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import ElectivoAprobado from "../entity/electivoAprobado.entity.js";

export async function generarPDFListaAprobada(alumnoId, outputPath) {
  try {
    const repo = AppDataSource.getRepository(ElectivoAprobado);

    const electivos = await repo.find({
      where: { alumno: { id: alumnoId } },
      relations: ["electivo"],
      order: { createdAt: "ASC" },
    });

    if (!electivos.length) {
      return [null, "No hay electivos aprobados para este alumno"];
    }

    const columns = {
        titulo: { x: 50, width: 120 },
        contenido: { x: 180, width: 170 },
        horario: { x: 360, width: 80 },
        inicio: { x: 440, width: 50 },
        final: { x: 500, width: 50 },
    };

    /* =======================
       HELPERS
       ======================= */
    const formatDate = (value) => {
      if (!value) return "—";
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return value; // string YYYY-MM-DD
    };

    /* =======================
       ASEGURAR DIRECTORIO
       ======================= */
    const dir = path.dirname(outputPath);

    try {
    fs.mkdirSync(dir, { recursive: true });
    } catch (error) {
    console.error("No se pudo crear el directorio tmp:", error);
    return [null, "Error al preparar el directorio de exportación"];
    }

    /* =======================
       PDF
       ======================= */
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Título
    doc.fontSize(18).text("Lista de Electivos Aprobados", {
      align: "center",
    });

    doc.moveDown(2);

    // Encabezado tabla
    const headerY = doc.y;

    doc.fontSize(12)
        .text("Título", columns.titulo.x, headerY, { width: columns.titulo.width })
        .text("Contenido", columns.contenido.x, headerY, { width: columns.contenido.width })
        .text("Horario", columns.horario.x, headerY, { width: columns.horario.width })
        .text("Inicio", columns.inicio.x, headerY, { width: columns.inicio.width })
        .text("Final", columns.final.x, headerY, { width: columns.final.width });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    let y = doc.y;

    electivos.forEach(({ electivo }) => {
    doc.fontSize(10);

    const heights = [
        doc.heightOfString(electivo.titulo, columns.titulo),
        doc.heightOfString(electivo.contenidos, columns.contenido),
        doc.heightOfString(formatDate(electivo.horario), columns.horario),
        doc.heightOfString(electivo.horaInicio, columns.inicio),
        doc.heightOfString(electivo.horaFinal, columns.final),
    ];

    const rowHeight = Math.max(...heights) + 8;

    // Salto de página
    if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
    }

    doc.text(electivo.titulo, columns.titulo.x, y, { width: columns.titulo.width });
    doc.text(electivo.contenidos, columns.contenido.x, y, { width: columns.contenido.width });
    doc.text(formatDate(electivo.horario), columns.horario.x, y, { width: columns.horario.width });
    doc.text(electivo.horaInicio, columns.inicio.x, y, { width: columns.inicio.width });
    doc.text(electivo.horaFinal, columns.final.x, y, { width: columns.final.width });

    y += rowHeight;
    });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return [outputPath, null];
  } catch (error) {
    console.error("Error generando PDF:", error);
    return [null, "Error interno al generar PDF"];
  }
}