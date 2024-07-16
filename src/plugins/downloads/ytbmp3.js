const Scraper = require("@SumiFX/Scraper");
const verifyUser = require("../../utils/verifyuser");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "ytm3",
  aliases: ["yt", "yta"],
  category: "multimedia",
  subcategory: "downloads",
  description: "Descarga audios de YouTube.",
  usage: "ytmp3 <yt url>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  async execute(totoro, msg, args) {
    // Aseguramos que el objeto msg y sus propiedades están definidas
    const participant = msg.messages?.[0]?.key?.participant;
    const remoteJid = msg.messages?.[0]?.key?.remoteJid;

    // Verificamos la existencia de ambos participant y remoteJid
    if (!participant && !remoteJid) {
      return sendError(
        totoro,
        msg,
        "No se pudo obtener el número del usuario o el chat."
      );
    }

    // Verificamos que se ha pasado una URL de YouTube
    if (!args[0] || !args[0].match(/youtu/gi)) {
      return help(
        totoro,
        msg,
        "ytmp3",
        "Descarga audios de YouTube.",
        "ytmp3 <yt url>"
      );
    }

    let user;
    try {
      user = await verifyUser(participant || remoteJid);
    } catch (error) {
      if (
        error.message ===
        "No estás registrado. Por favor, regístrate antes de usar este comando."
      ) {
        return sendWarning(totoro, msg, error.message);
      } else {
        return sendError(totoro, msg, error.message);
      }
    }

    try {
      let { title, size, quality, thumbnail, dl_url } = await Scraper.ytmp3(
        args[0]
      );
      if (size.includes("GB") || parseFloat(size.replace(" MB", "")) > 100) {
        return sendWarning(
          totoro,
          msg,
          "El archivo pesa más de 100 MB, se canceló la descarga."
        );
      }

      let txt = `╭─⬣「 *YouTube Audio Download* 」⬣\n`;
      txt += `│  ≡◦ *🍭 Titulo ∙* ${title}\n`;
      txt += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
      txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
      txt += `╰─⬣`;

      await totoro.sendMessage(
        remoteJid || participant,
        {
          image: { url: thumbnail },
          document: { url: dl_url },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption: txt,
        },
        { quoted: msg.messages[0], asDocument: user.useDocument }
      );
      await msg.react("🍭");
    } catch (error) {
      totoroLog.error(
        "./logs/ytmp3.log",
        `Error al descargar audio de YouTube: ${error}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al intentar descargar el audio."
      );
    }
  },
};
