"use strict";
import fs from "fs";
import path from "path";
import { generarPDFListaAprobada } from "../services/pdfListaAprobada.service.js";

export async function descargarPDFListaAprobada(req, res) {
  try {
    const alumnoId = req.user.id;

    const tmpDir = path.join(process.cwd(), "tmp");
    const outputPath = path.join(
      tmpDir,
      `lista_aprobados_${alumnoId}.pdf`
    );

    // Asegurar carpeta tmp (defensivo)
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const [filePath, error] = await generarPDFListaAprobada(
      alumnoId,
      outputPath
    );

    if (error) {
      return res.status(404).json({ message: error });
    }

    res.download(filePath, "Lista_Electivos_Aprobados.pdf", (err) => {
      if (err) {
        console.error("Error al enviar PDF:", err);
      }

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error al borrar PDF temporal:", unlinkErr);
        }
      });
    });
  } catch (error) {
    console.error("Error en controlador PDF:", error);
    res.status(500).json({ message: "Error al descargar PDF" });
  }
}