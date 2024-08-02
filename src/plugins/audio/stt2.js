require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { PassThrough } = require("stream");
const { sendError } = require("../../functions/messages");

ffmpeg.setFfmpegPath(ffmpegPath);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = {
  name: "Speech to Text 2",
  description: "🎙️ Transcribe un mensaje de audio.",
  category: "audio",
  subcategory: "voz",
  usage: `+stt2 <mensaje de audio>`,
  aliases: ["stt2"],
  dev: false,
  blockcmd: true,
  execute: async (totoro, msg, args) => {
    try {
      await msg.react("⏳");

      const participant =
        msg.messages[0].key.participant || msg.messages[0].key.remoteJID;
      const participantName = msg.messages[0].pushName || "Usuario desconocido";
      const m =
        msg.messages[0].message.extendedTextMessage?.contextInfo
          ?.quotedMessage || msg.messages[0].message;

      if (!m.audioMessage) {
        await sendError(
          totoro,
          msg,
          "El mensaje debe ser un mensaje de audio."
        );
        return;
      }

      const str = await downloadContentFromMessage(m.audioMessage, "audio");

      const trsx = await OGGaMP3(str).catch(console.error);
      if (!trsx) {
        await sendError(totoro, msg, "Error en la conversión de audio.");
        return;
      }

      const transcription = await transcribirAudio(trsx).catch(console.error);
      if (!transcription) {
        await sendError(totoro, msg, "Error en la transcripción del audio.");
        return;
      }

      await msg.react("🗣️");
      const message = `*Transcripción del audio para* ${participantName}:\n\n> ${transcription}`;
      msg.reply(message);
    } catch (error) {
      await sendError(
        totoro,
        msg,
        "Error al transcribir el audio: " + error.message
      );
    }
  },
};

async function OGGaMP3(inputStream) {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough();
    const chunks = [];

    inputStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    inputStream.on("end", () => {
      if (chunks.length === 0) {
        reject(new Error("El flujo de entrada está vacío."));
        return;
      }

      const buffer = Buffer.concat(chunks);
      const newInputStream = new PassThrough();
      newInputStream.end(buffer);

      outputStream.on("data", (chunk) => chunks.push(chunk));
      outputStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          reject(
            new Error("El archivo de audio convertido es demasiado pequeño.")
          );
        } else {
          resolve(buffer);
        }
      });
      outputStream.on("error", reject);

      ffmpeg(newInputStream)
        .inputFormat("ogg")
        .toFormat("mp3")
        .on("error", reject)
        .pipe(outputStream);
    });

    inputStream.on("error", reject);
  });
}

async function transcribirAudio(audioBuffer) {
  if (!audioBuffer || audioBuffer.length < 100) {
    throw new Error("El buffer de audio es demasiado pequeño.");
  }

  const form = new FormData();
  form.append("file", audioBuffer, "audio.mp3");
  form.append("model", "whisper-1");
  form.append("language", "es");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const transcription = response.data.text;
    return transcription;
  } catch (error) {
    throw error;
  }
}