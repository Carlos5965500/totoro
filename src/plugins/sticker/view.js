const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "view",
  aliases: ["revelar", "ver", "reveal", "see", "v"],
  category: "información",
  subcategory: "visualización única",
  description: "Revela un mensaje de visualización única",
  usage: "view <cita un mensaje de visualización única>",
  cooldown: 10,
  dev: false,
  blockcmd: true,
  cmdPrem: false,

  async execute(totoro, msg, args) {
    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const participant = info.key.participant || info.key.remoteJid; // Asegurarse de obtener el participante

    const quotedMessage =
      info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMessage) {
      return help(
        totoro,
        msg,
        "view",
        "Revela un mensaje de visualización única",
        "view <cita un mensaje de visualización única>"
      );
    }

    const mType = Object.keys(quotedMessage)[0];
    const isQuotedViewOnce =
      mType === "viewOnceMessageV2" || mType === "viewOnceMessageV2Extension";

    if (!isQuotedViewOnce) {
      return sendWarning(msg, "Cita un mensaje de visualización única");
    }

    try {
      let downl;
      let mime;
      let caption = "";

      if (mType === "viewOnceMessageV2") {
        if (Object.keys(quotedMessage[mType].message)[0] === "imageMessage") {
          caption = quotedMessage[mType]?.message?.imageMessage?.caption || "";
          downl = quotedMessage[mType].message.imageMessage;
          mime = "image";
        } else if (
          Object.keys(quotedMessage[mType].message)[0] === "videoMessage"
        ) {
          caption = quotedMessage[mType]?.message?.videoMessage?.caption || "";
          downl = quotedMessage[mType].message.videoMessage;
          mime = "video";
        } else {
          return sendWarning(msg, "Formato de archivo desconocido");
        }
      } else if (mType === "viewOnceMessageV2Extension") {
        if (Object.keys(quotedMessage[mType].message)[0] === "audioMessage") {
          downl = quotedMessage[mType].message.audioMessage;
          mime = "audio";
        } else {
          return sendWarning(msg, "Formato de archivo desconocido");
        }
      }

      let buffer = Buffer.from([]);
      const stream = await downloadContentFromMessage(downl, mime);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const finalCaption = `© ᴍᴀᴅᴇ ʙʏ ᴛᴏᴛᴏʀᴏ ꜱᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ: @${participant.split("@")[0]}`;

      if (mime === "image") {
        await totoro.sendMessage(
          from,
          {
            image: buffer,
            caption: `${caption} ${finalCaption}`,
            mentions: [participant],
          },
          { quoted: info }
        );
      } else if (mime === "video") {
        await totoro.sendMessage(
          from,
          {
            video: buffer,
            caption: `${caption} ${finalCaption}`,
            mentions: [participant],
          },
          { quoted: info }
        );
      } else if (mime === "audio") {
        await totoro.sendMessage(
          from,
          {
            audio: buffer,
            ptt: true,
            caption: finalCaption,
            mentions: [participant],
          },
          { quoted: info }
        );
      }
    } catch (e) {
      console.log(e);
      sendError(msg, "Error al revelar el mensaje");
    }
  },
};
