const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const {Wit} = require("node-wit")
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { PassThrough } = require('stream');
const {
  sendError,
  sendSuccess,
  sendMessage,
} = require("../../functions/messages");

//const ASSEMBLYAI_API_KEY = "eb21d4224c83470db38beacebe821f81";

module.exports = {
  name: "Speech to Text",
  description: "🎙️ Transcribe un mensaje de audio.",
  category: "audio",
  subcategory: "voz",
  usage: `+stt <mensaje de audio>`,
  aliases: ["stt"],
  dev: false,
  blockcmd: true,
  execute: async (totoro, msg, args) => {
    try {
        const participant = msg.messages[0].key.participant || msg.messages[0].key.remoteJID;
      const m = msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage ? msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage : msg.messages[0].message;

      // Verificar que el mensaje sea un mensaje de audio
      if (!m.audioMessage) {
        await sendError(
          totoro,
          msg,
          "El mensaje debe ser un mensaje de audio."
        );
        return;
      }


      // Descargar el contenido de audio usando bailey
      const str = await downloadContentFromMessage(m.audioMessage, "audio");

      
      const trsx = await OGGaMP3(str).catch(console.error);
      const transcription = await transcribirAudio(trsx).catch();

      

      // Construir mensaje con la transcripción y el participante
      const message = `🎙️ Transcripción de ${participant}:\n${transcription}`;

      // Enviar la transcripción al chat
      await sendMessage(totoro, msg, message);

      // Enviar mensaje de éxito
      await sendSuccess(totoro, msg, "Transcripción completada exitosamente.");

    } catch (error) {
      console.error(error);

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

        outputStream.on('data', chunk => chunks.push(chunk));
        outputStream.on('end', () => resolve(Buffer.concat(chunks)));
        outputStream.on('error', reject);

        ffmpeg(inputStream)
            .inputFormat('ogg')
            .toFormat('mp3')
            .on('error', reject)
            .pipe(outputStream);
    });
}




async function transcribirAudio(ruta) {
    const client = new Wit({ accessToken: "UL3DRPNHSCXPBSCZQFT2QU3QTQZ3J6S3" });
    
    const fl = new PassThrough();
    fl.end(ruta);

    const response = await client.speech("audio/mpeg", fl).catch(console.error);

    return response?.text;
}
