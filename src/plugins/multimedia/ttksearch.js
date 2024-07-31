const axios = require("axios");
const { sendError, help, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "ttksearch",
  category: "multimedia",
  subcategory: "tiktok",
  usage: "ttksearch <término>",
  description: "Busca videos en TikTok",
  dev: false,
  blockcmd: true,
  cmdPrem: false,
  async execute(totoro, msg, args) {
    msg.react("⏳");
    const message = msg.messages[0];
    const remoteJid = message.key.remoteJid;

    // Unir los argumentos en una sola cadena de búsqueda
    const searchTerm = args.join(" ");

    if (!searchTerm) {
      return help(
        totoro,
        msg,
        "ttksearch",
        "Busca videos en TikTok",
        "ttksearch <término>"
      );
    }

    try {
      // Hacer una petición a una API pública de búsqueda de TikTok
      const res = await axios.get(
        `https://api.tiktok.com/search?q=${encodeURIComponent(searchTerm)}`
      );

      if (res.data.status === "success") {
        let txt = `╭─⬣「 *Resultados de búsqueda de TikTok* 」⬣\n`;
        res.data.results.forEach((video, index) => {
          txt += `│ ${index + 1}. *${video.title}*\n`;
          txt += `│    ${video.url}\n`;
        });
        txt += `╰─⬣`;

        // Enviar el mensaje con los resultados de búsqueda
        await totoro.sendMessage(remoteJid, { text: txt }, { quoted: message });
      } else {
        return sendWarning(
          totoro,
          msg,
          "*🏮 Ocurrió un error en la búsqueda :/*"
        );
      }
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/multimedia/ttksearch.js",
        `Error al buscar videos en TikTok: ${error}`
      );
      sendError(
        totoro,
        msg,
        "Error al buscar videos en TikTok. Por favor, vuelve a intentarlo."
      );
    }
  },
};
