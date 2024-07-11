// Importación de módulos necesarios
const axios = require("axios");
const cheerio = require("cheerio");
const { help, sendError, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
module.exports = {
  name: "igdl",
  description: "Descarga un video de Instagram.",
  usage: "igdl <link>",
  aliases: ["igdownload", "igvideo"],

  async execute(totoro, msg, args) {
    if (!args.length) return help(totoro, msg, this);
    const url = args[0];
    if (!url.includes("instagram"))
      return sendWarning(
        totoro,
        msg,
        "Debes proporcionar un enlace de Instagram."
      );

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const video = $("meta[property='og:video']").attr("content");
      if (!video)
        return sendWarning(
          totoro,
          msg,
          "No se encontró un video en el enlace proporcionado."
        );
      msg.reply({ url: video }, { quoted: msg });
    } catch (error) {
      totoroLog.error(
        totoroLog.verbose,
        "./logs/plugins/downloads/instagram.log",
        `[PLUGINS] Error al descargar el video de Instagram: ${error}`
      );
      sendError(totoro, msg, "Error al descargar el video de Instagram");
    }
  },
};
