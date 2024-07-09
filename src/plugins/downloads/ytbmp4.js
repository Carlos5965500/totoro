const Scraper = require("@SumiFX/Scraper");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "ytmp4",
  aliases: ["yt", "ytv"],
  category: "multimedia",
  subcategory: "downloads",
  description: "Descarga videos de YouTube.",
  usage: "ytmp4 <yt url>",
  botPermissions: ["SEND_MESSAGES", "ATTACH_FILES"],
  userPermissions: [],
  cooldown: 10,

  async execute(totoro, msg, args) {
    const from = msg.messages[0]?.key?.remoteJid;

    if (!from) {
      console.error("msg.messages[0].key.remoteJid no está definido.");
      return;
    }

    if (!args[0]) {
      return totoro.sendMessage(
        from,
        {
          text:
            "🍭 Ingresa el enlace del vídeo de YouTube junto al comando.\n\n`Ejemplo:`\n" +
            `> *${this.usage}* https://youtu.be/QSvaCSt8ixs`,
        },
        { quoted: msg.messages[0] }
      );
    }

    if (!args[0].match(/youtu/gi)) {
      return totoro.sendMessage(
        from,
        { text: "Verifica que el enlace sea de YouTube." },
        { quoted: msg.messages[0] }
      );
    }

    // Asegúrate de que global.db.data.users esté definido
    if (!global.db || !global.db.data || !global.db.data.users) {
      console.error("La base de datos de usuarios no está definida.");
      return totoro.sendMessage(
        from,
        { text: "Hubo un error con la base de datos de usuarios." },
        { quoted: msg.messages[0] }
      );
    }

    let user = global.db.data.users[msg.messages[0].key.participant] || {};
    try {
      let { title, size, quality, thumbnail, dl_url } = await Scraper.ytmp4(args[0]);
      if (size.includes('GB') || size.replace(' MB', '') > 300) {
        return await totoro.sendMessage(
          from,
          { text: "El archivo pesa mas de 300 MB, se canceló la Descarga." },
          { quoted: msg.messages[0] }
        );
      }
      let txt = `╭─⬣「 *YouTube Download* 」⬣\n`;
      txt += `│  ≡◦ *🍭 Titulo ∙* ${title}\n`;
      txt += `│  ≡◦ *🪴 Calidad ∙* ${quality}\n`;
      txt += `│  ≡◦ *⚖ Peso ∙* ${size}\n`;
      txt += `╰─⬣`;
      await totoro.sendMessage(from, { image: { url: thumbnail }, caption: txt }, { quoted: msg.messages[0] });
      await totoro.sendMessage(from, { document: { url: dl_url }, mimetype: 'video/mp4', fileName: `${title}.mp4` }, { quoted: msg.messages[0], asDocument: user.useDocument });
    } catch (error) {
      totoroLog.error("./logs/plugins/downloads/ytmp4.log", `Error al descargar video de YouTube: ${error}`);
      await totoro.sendMessage(
        from,
        { text: "Hubo un error al intentar descargar el video." },
        { quoted: msg.messages[0] }
      );
    }
  }
};
