const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const {
  sendError,
  sendSuccess,
  sendMessage,
} = require("../../functions/messages");

const ASSEMBLYAI_API_KEY = "eb21d4224c83470db38beacebe821f81";

module.exports = {
  name: "stt",
  description: "🎙️ Transcribe un mensaje de audio.",
  category: "*Audio*",
  subcategory: "Voz",
  usage: `+stt`,
  aliases: ["stt"],
  run: async (totoro, msg, args) => {
    try {
      const m = msg.messages[0];

      // Verificar que el mensaje sea un mensaje de audio
      if (!m.message.audioMessage) {
        await sendError(
          totoro,
          msg,
          "El mensaje debe ser un mensaje de audio."
        );
        return;
      }

      const participant = m.key.participant || m.key.remoteJid;

      // Descargar el contenido de audio usando baileys
      const buffer = await downloadAudioContent(totoro, m);

      // Guardar el archivo de audio temporalmente
      const audioFile = "./temp_audio.opus";
      fs.writeFileSync(audioFile, buffer);

      // Subir el archivo de audio a AssemblyAI
      const uploadUrl = await uploadAudioToAssemblyAI(audioFile);

      // Enviar el audio a AssemblyAI para transcripción
      const transcriptionId = await requestTranscription(uploadUrl);

      // Esperar la transcripción
      const transcription = await waitForTranscription(transcriptionId);

      // Construir mensaje con la transcripción y el participante
      const message = `🎙️ Transcripción de ${participant}:\n${transcription}`;

      // Enviar la transcripción al chat
      await sendMessage(totoro, msg, message);

      // Enviar mensaje de éxito
      await sendSuccess(totoro, msg, "Transcripción completada exitosamente.");

      // Limpiar archivos temporales
      fs.unlinkSync(audioFile);
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

// Función para descargar el contenido de audio usando baileys
async function downloadAudioContent(totoro, m) {
  try {
    const stream = await downloadContentFromMessage(
      m.message.audioMessage,
      "audio"
    );
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  } catch (error) {
    console.error("Error al descargar el mensaje de audio:", error);
    throw new Error("Error al descargar el mensaje de audio");
  }
}

// Función para subir el archivo de audio a AssemblyAI
async function uploadAudioToAssemblyAI(filePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    formData,
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        ...formData.getHeaders(),
      },
    }
  );

  console.log("Upload response:", response.data);
  return response.data.upload_url;
}

// Función para solicitar la transcripción
async function requestTranscription(audioUrl) {
  const response = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    {
      audio_url: audioUrl,
    },
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
    }
  );

  console.log("Transcription request response:", response.data);
  return response.data.id;
}

// Función para esperar la transcripción
async function waitForTranscription(transcriptionId) {
  while (true) {
    const response = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptionId}`,
      {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      }
    );

    console.log("Transcription status:", response.data);
    if (response.data.status === "completed") {
      return response.data.text;
    } else if (response.data.status === "failed") {
      throw new Error("Transcripción fallida");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
