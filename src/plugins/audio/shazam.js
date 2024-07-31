const { Shazam } = require("node-shazam");
const shazam = new Shazam();
const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { help, sendError, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "shazam",
  category: "audio",
  subcategory: "music",
  aliases: ["sh"],
  description:
    "Identifica la canción de un audio o video y te muestra la letra de la canción y el nombre del artista y la canción",
  use: "shazam",

  async execute(totoro, msg, args) {
    const message = msg.messages[0];
    const { key, message: msgContent } = message;
    const from = key.remoteJid;
    const pushname = message.pushName;

    // Verificar si el mensaje contiene media o si es un mensaje citado con media
    const isMedia = msgContent.audioMessage || msgContent.videoMessage;
    const quotedMessage =
      msgContent.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedMsgContent = quotedMessage
      ? quotedMessage.audioMessage || quotedMessage.videoMessage
      : null;

    const mimetype = isMedia
      ? msgContent.audioMessage
        ? "audio"
        : "video"
      : quotedMsgContent
        ? quotedMessage.audioMessage
          ? "audio"
          : "video"
        : null;

    let mediaData = null;
    let mediaPath = null;

    const downloadMedia = async (message) => {
      await msg.react("⏳");
      try {
        const search =
          msgContent.audioMessage || msgContent.videoMessage
            ? msgContent.audioMessage || msgContent.videoMessage
            : quotedMessage.audioMessage || quotedMessage.videoMessage;
        const stream = await downloadContentFromMessage(search, "audio");

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        const ext = mimetype === "audio" ? "mp3" : "mp4";
        const filePath = path.join(__dirname, `media.${ext}`);
        fs.writeFileSync(filePath, buffer);
        return filePath;
      } catch (error) {
        console.error("Error al descargar el medio:", error);
        return null;
      }
    };

    if (isMedia) {
      mediaPath = await downloadMedia(message);
    } else if (quotedMsgContent) {
      mediaPath = await downloadMedia(quotedMsgContent);
    } else {
      return sendWarning(
        totoro,
        from,
        "🚩 *Asegúrate de enviar un audio o video*"
      );
    }

    if (!mediaPath || !["audio", "video"].includes(mimetype)) {
      return sendWarning(
        totoro,
        from, // nia: voy a dejar el pc ya. Nia 1 hora después:
        `${mimetype} 🚩 *No se pudo descargar el archivo de audio o video. Por favor, intenta nuevamente.*`
      );
    }

    try {
      const rs = await shazam.fromFilePath(mediaPath, false, "es");
      const track = rs.track;
      if (!rs?.track)
        return help(
          totoro,
          from,
          "🚩 *No se pudo identificar la canción. Por favor, intenta nuevamente.*"
        );

      let txt = `Solicitado por: @${pushname}\n`;
      txt += `La canción identificada es:\n`;
      txt += `> 🎵 *${track.title}*\n`;
      txt += `> 🎤 *${track.subtitle}*`;
      if (track.images && track.images.coverart) {
        const imageUrl = track.images.coverart;
        sendImage(totoro, from, imageUrl, txt);
      } else {
        msg.reply(txt);
      }
      await msg.react("🎵");
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/audio/shazam.log",
        `${error.message || "Ocurrió un error al identificar la canción"}`
      );
      sendError(
        totoro,
        from,
        `${error.message || "Ocurrió un error al identificar la canción"}`
      );
    } finally {
      if (mediaPath) {
        fs.unlinkSync(mediaPath);
      }
    }
  },
};

// Función auxiliar para enviar una imagen con subtítulo
const sendImage = (totoro, to, url, texto) => {
  totoro.sendMessage(to, {
    image: { url: url },
    caption: texto,
  });
};
