const { instaVideo } = require("hori-api");
const { help, sendError, sendWarning } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const { verbose } = require("sqlite3");

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
      const video = await instaVideo(url);
      if (!video || !video.download)
        return sendWarning(totoro, msg, "No se encontró el video.");
      msg.reply(
        {
          url: video.download,
        },
        { quoted: msg }
      );
    } catch (error) {
      totoroLog.error(
        totoroLog.verbose,
        "./logs/plugins/downloads/instagram.log",
        `Error al descargar el video de Instagram: ${error.message}`
      );
      sendError(totoro, msg, "No se pudo descargar el video.");
    }
  },
};
