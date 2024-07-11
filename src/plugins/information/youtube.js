const Scraper = require("@SumiFX/Scraper");

module.exports = {
  name: "youtube",
  aliases: ["yts", "ytsearch"],
  category: "multimedia",
  subcategory: "downloads",
  description: "Busca videos de YouTube.",
  usage: "youtube <titulo>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  async execute(totoro, msg, args) {
    const from = msg.messages[0]?.key?.remoteJid;

    if (!from) {
      console.error("msg.messages[0].key.remoteJid no está definido.");
      return;
    }

    if (!args.length) {
      return totoro.sendMessage(
        from,
        {
          text:
            "🍭 Ingresa el título de un video o canción de YouTube.\n\nEjemplo:\n> *" +
            `${this.aliases[0]}* Gemini Aaliyah - If Only`,
        },
        { quoted: msg.messages[0] }
      );
    }

    const text = args.join(" ");
    let results;
    try {
      results = await Scraper.ytsearch(text);
    } catch (error) {
      console.error("Error buscando en YouTube:", error);
      return totoro.sendMessage(
        from,
        { text: "❌ Error al buscar en YouTube." },
        { quoted: msg.messages[0] }
      );
    }

    if (!results || results.length === 0) {
      return totoro.sendMessage(
        from,
        { text: "❌ No se encontraron resultados." },
        { quoted: msg.messages[0] }
      );
    }

    let img = results[0].thumbnail;
    let txt = `╭─⬣「 *YouTube Search* 」⬣\n`;
    results.forEach((video, index) => {
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
