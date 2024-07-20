const Scraper = require("@SumiFX/Scraper");
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "igmedia",
  category: "multimedia",
  subcategory: "instagram",
  usage: "igimage <enlace>",
  description: "Descarga imágenes de Instagram",

  async execute(totoro, msg, args) {
    msg.react("⏳");
    if (!args[0]) {
      return help(
        totoro,
        msg,
        "igmedia",
        "Descarga imágenes de Instagram",
        "igmedia <enlace>"
      );
    }

    try {
      let { dl_url } = await Scraper.igdl(args[0]);
      if (!dl_url) {
        totoroLog.info(
          "./logs/plugins/multimedia/igimage.log",
          "Error al obtener el enlace de descarga."
        );
        return sendWarning(
          totoro,
          msg,
          "No se pudo obtener el enlace de descarga."
        );
      }

      // solo quiero se pueda descargar la imagen
      if (!dl_url.match(/.jpg|.jpeg|.png/gi)) {
        totoroLog.info(
          "./logs/plugins/multimedia/igimage.log",
          "No se pudo obtener el enlace de descarga."
        );
        return sendWarning(totoro, msg, `Solo se pueden descargar imágenes.`);
      }

      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      let txt = `╭─⬣「 *Instagram Image Download* 」⬣\n`;
      txt += `│  ≡◦ *🍭 Enlace ∙* ${args[0]}\n`;
      txt += `╰─⬣`;

      await totoro.sendMessage(
        remoteJid,
        {
          image: { url: dl_url },
          caption: txt,
        },
        { quoted: message }
      );

      await msg.react("📷");
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/multimedia/igimage.js",
        `Error al descargar la imagen de Instagram: ${error}`
      );
      sendError(
        totoro,
        msg,
        "Error al descargar la imagen de Instagram. Por favor, vuelve a intentarlo."
      );
    }
  },
};
