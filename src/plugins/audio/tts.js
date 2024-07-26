const axios = require("axios");
const {
  sendWarning,
  sendError,
  sendMessage,
  sendSuccess,
} = require("../../functions/messages");

module.exports = {
  name: "Text to Speech",
  category: "audio",
  subcategory: "voz",
  usage: "tts <texto>",
  aliases: ["tts"],
  description: "Convierte texto a voz y envía un audio",

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;

    if (!args.length) {
      return help(
        totoro,
        msg,
        "tts",
        "Debes escribir un texto para convertir a voz",
        "+tts <texto>"
      );
    }

    const text = args.join(" ");

    const voices = ["Elena", "Tomas"];
    const selectedVoice = voices[Math.floor(Math.random() * voices.length)];

    const apiUrl = `https://api.kastg.xyz/api/ai/tts?lang=Spanish&voice=${selectedVoice}&input=${encodeURIComponent(text)}`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.status === "true" && response.data.result.length > 0) {
        const audioUrl = response.data.result[0].url;
        const audioResponse = await axios.get(audioUrl, {
          responseType: "arraybuffer",
        });
        const audioBuffer = Buffer.from(audioResponse.data, "binary");
        await msg.react("🔊");

        await totoro.sendMessage(from, {
          audio: audioBuffer,
          mimetype: "audio/mp4",
          ptt: true,
        });

        await msg.react("🔊");
      } else {
        sendWarning(totoro, msg, `${response.data.message}`);
      }
    } catch (error) {
      console.error(error);
      sendError(totoro, msg, `Error convirtiendo texto a voz: ${error}`);
    }
  },
};
