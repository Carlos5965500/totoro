const Scraper = require("@SumiFX/Scraper");
const { sendError, help } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "ytbsearch",
  aliases: ["yts", "ytsearch", "ytsrch"],
  category: "multimedia",
  subcategory: "youtube",
  description: "Busca videos de YouTube.",
  usage: "youtube <nombre|url>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  async execute(totoro, msg, args) {
    const from = msg.messages[0]?.key?.remoteJid;

    if (!args.length) {
      return help(
        totoro,
        msg,
        "youtube",
        "Busca videos de YouTube.",
        "youtube <nombre|url>"
      );
    }

    const text = args.join(" ");
    let results;
    try {
      results = await Scraper.ytsearch(text);
    } catch (error) {
      totoroLog(
        "../logs/ytbsearch.log",
        `Error en YouTube search: ${error.message}`
      );
      return sendError(totoro, msg, error.message);
    }

    if (!results || results.length === 0) {
      return sendError(totoro, msg, "No se encontraron resultados.");
    }
    await msg.react("🔍");

    let img = results[0].thumbnail;
    let txt = `         「 *YouTube Search* 」\n\n`;
    results.forEach((video, index) => {
      txt += ` ╭─⬣「 *YouTube Search ${index + 1}* 」⬣\n`;
      txt += ` │  ≡◦ *🐢 Nro ∙* ${index + 1}\n`;
      txt += ` │  ≡◦ *🍭 Titulo ∙* ${video.title}\n`;
      txt += ` │  ≡◦ *🕜 Duración ∙* ${video.duration}\n`;
      txt += ` │  ≡◦ *🪴 Publicado ∙* ${video.published}\n`;
      txt += ` │  ≡◦ *📚 Autor ∙* ${video.author}\n`;
      txt += ` │  ≡◦ *⛓ Url ∙* ${video.url}\n`;
      txt += ` ╰──────────⬣\n\n`;
    });

    await totoro.sendMessage(
      from,
      { image: { url: img }, caption: txt },
      { quoted: msg.messages[0] }
    );
  },
};
