const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const tesseract = require("tesseract.js");
const axios = require("axios");
const sharp = require("sharp");
const { sendError, help, sendWarning } = require("../../functions/messages");
const fs = require("fs").promises;
require("dotenv").config(); // Requiere y configura dotenv

module.exports = {
  name: "OCR",
  category: "premium",
  subcategory: "ai",
  usage: "ocr <mensaje>",
  aliases: ["ocr", "totoOCR", "totoTexto", "totoTextoAI"],
  description: "Extrae texto de una imagen o documento",
  cmdPrem: true,
  dev: false,
  blockcmd: true,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const sender = info.key.participant;

    msg.react("⌛");

    const content = args.join(" ");
    const quotedMessage =
      info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const documentMessage = quotedMessage?.documentMessage;
    const imageMessage = quotedMessage?.imageMessage;

    if (!content && !documentMessage && !quotedMessage && !imageMessage) {
      return help(
        totoro,
        msg,
        "OCR",
        "Falta el mensaje o el documento/imagen para procesar",
        "ocr <mensaje>"
      );
    }

    try {
      let documentText = "";
      let quotedText = "";
      let ocrText = "";

      if (quotedMessage) {
        if (quotedMessage.conversation) {
          quotedText = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage) {
          quotedText = quotedMessage.extendedTextMessage.text;
        } else if (quotedMessage.audioMessage) {
          quotedText = "Mensaje de audio";
        } else if (documentMessage) {
          const mediaUrl = documentMessage.url;
          if (!mediaUrl)
            throw new Error("No se pudo obtener la URL del documento.");

          console.log(`Descargando documento desde: ${mediaUrl}`);
          const buffer = await axios
            .get(mediaUrl, { responseType: "arraybuffer" })
            .then((res) => Buffer.from(res.data));

          if (documentMessage.mimetype === "application/pdf") {
            const pdfData = await pdfParse(buffer);
            documentText = pdfData.text;
          } else if (
            documentMessage.mimetype === "application/msword" ||
            documentMessage.mimetype ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            const result = await mammoth.extractRawText({ buffer });
            documentText = result.value;
          }
        } else if (imageMessage) {
          const mediaUrl = imageMessage.url;
          if (!mediaUrl)
            throw new Error("No se pudo obtener la URL de la imagen.");

          console.log(`Descargando imagen desde: ${mediaUrl}`);
          const buffer = await axios
            .get(mediaUrl, { responseType: "arraybuffer" })
            .then((res) => Buffer.from(res.data));

          // Convertir la imagen a PNG usando sharp
          const convertedImageBuffer = await sharp(buffer).png().toBuffer();

          // Guardar la imagen temporalmente para asegurar la compatibilidad con Tesseract.js
          const tempImagePath = "/tmp/temp_image.png";
          await fs.writeFile(tempImagePath, convertedImageBuffer);

          const {
            data: { text },
          } = await tesseract.recognize(tempImagePath, "eng");
          ocrText = text;

          // Eliminar la imagen temporal
          await fs.unlink(tempImagePath);
        }
      }

      let combinedText = [documentText, quotedText, ocrText]
        .filter(Boolean)
        .join("\n\n");

      if (combinedText.length === 0) {
        return sendWarning(
          totoro,
          msg,
          "OCR",
          "No se pudo extraer ningún texto del mensaje o documento/imagen."
        );
      }

      msg.react("✅");
      await totoro.sendMessage(
        from,
        {
          text: `> *Texto extraído:*\n> ${combinedText}`,
          mentions: [sender],
        },
        { quoted: info }
      );
    } catch (error) {
      console.error(error);
      let errorMessage = "Error procesando la solicitud.";
      if (error.response) {
        // El servidor respondió con un estado fuera del rango de 2xx
        errorMessage += ` Código de estado: ${error.response.status}.`;
        if (error.response.data) {
          errorMessage += ` Respuesta del servidor: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        errorMessage += " No hubo respuesta del servidor.";
      } else {
        // Ocurrió un error al configurar la solicitud
        errorMessage += ` Mensaje: ${error.message}`;
      }
      sendError(totoro, msg, errorMessage);
    }
  },
};
