const Scraper = require("@SumiFX/Scraper");
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
module.exports = {
  name: "igmp4",
  category: "multimedia",
  subcategory: "instagram",
  usage: "igmp4 <enlace>",
  description: "Descarga video de ig",

  async execute(totoro, msg, args) {
    msg.react("⏳");
    if (!args[0]) {
      return help(
        totoro,
        msg,
        "igmp4",
        "Descarga video de ig",
        "igmp4 <enlace>"
      );
    }

    try {
      let { dl_url } = await Scraper.igdl(args[0]); 
      if (!dl_url) {
        totoroLog.info(
          "./logs/plugins/multimedia/igmp4.log",
          "Error al obtener el enlace de descarga."
        );
        return sendWarning(
          totoro,
          msg,
          "No se pudo obtener el enlace de descarga."
        );
      }

      // solo quiero se pueda descargar la imagen
      if (dl_url.match(/.jpg|.jpeg|.png/gi)) {
        // Cambiar a .mp4
        totoroLog.info(
          "./logs/plugins/multimedia/igmp4.log",
          "No se pudo obtener el enlace de descarga."
        );
        return sendWarning(totoro, msg, `No se pueden descargar imágenes.`);
      } else if (dl_url.match(/.mp4/gi)) {
        totoroLog.info(
          "./logs/plugins/multimedia/igmp4.log",
          "Enlace de descarga obtenido."
        );
      }

      const message = msg.messages[0];
      const remoteJid = message.key.remoteJid;

      let txt = `╭─⬣「 *Instagram Video Download* 」⬣\n`;
      txt += `│  ≡◦ *🍭 Enlace ∙* ${args[0]}\n`;
      txt += `╰─⬣`;

      // Enviar el mensaje de video
      await totoro.sendMessage(
        remoteJid,
        {
          video: { url: dl_url },
          caption: txt,
        },
        { quoted: message }
      );

      // Reaccionar al mensaje original
      await msg.react("📽️");
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/multimedia/igmp4.js",
        `Error al descargar el video de Instagram: ${error}`
      );
      sendError(
        totoro,
        msg,
        "Error al descargar el video de Instagram. Por favor, vuelve a intentarlo."
      );
    }
  },
};
