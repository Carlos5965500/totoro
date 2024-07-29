const Scraper = require("@SumiFX/Scraper");
const verifyUser = require("../../utils/verifyuser");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "ytbmp3",
  aliases: ["yt3", "ytm3", "ytv3"],
  category: "premium",
  subcategory: "youtube",
  description: "Descarga audios de YouTube.",
  usage: "ytmp3 <yt url o nombre>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,
  dev: false,
  blockcmd: true,
  cmdPrem: true,
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

    // Verificamos que se ha pasado una URL de YouTube o un término de búsqueda
    if (!args[0]) {
      return help(
        totoro,
        msg,
        "ytmp3",
        "Descarga audios de YouTube.",
        "ytmp3 <yt url o nombre>"
      );
    }

    try {
      let videoUrl = args[0];
      if (!videoUrl.match(/youtu/gi)) {
        // Si no es una URL, realizar una búsqueda
        const searchResults = await Scraper.ytsearch(args.join(" "));
        if (searchResults.length === 0) {
          return sendWarning(
            totoro,
            msg,
            "No se encontraron resultados para la búsqueda."
          );
        }
        videoUrl = searchResults[0].url; // Tomamos la primera URL de los resultados
      }

      let { title, size, quality, thumbnail, dl_url } =
        await Scraper.ytmp3(videoUrl);
      if (size.includes("GB") || parseFloat(size.replace(" MB", "")) > 100) {
        return sendWarning(
          totoro,
          msg,
          "El archivo pesa más de 100 MB, se canceló la descarga."
        );
      }

      await msg.react("⏳");

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
        { quoted: msg.messages[0], asDocument: true }
      );
      await msg.react("🎙️");
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
