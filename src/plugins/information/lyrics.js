const axios = require("axios");
const { help } = require("../../functions/messages");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "lyrics",
  aliases: ["letra", "l"],
  category: "information",
  subcategory: "music",
  usage: `${prefix}lyrics <nombre de la canción>`,
  example: `${prefix}lyrics Bohemian Rhapsody`,
  description: "Obtén la letra de una canción.",
  cmdPrem: true,
  dev: false,
  blockcmd: true,

  async execute(totoro, msg, args) {
    const songName = args.join(" ");

    if (!songName) {
      help(
        totoro,
        msg,
        "Lyrics",
        "Obtén la letra de una canción.",
        `${prefix}lyrics Bohemian Rhapsody`
      );
      return;
    }

    try {
      // Buscar la canción en iTunes para obtener el nombre del artista
      const searchResponse = await axios.get(
        `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&limit=1`
      );
      
      if (searchResponse.data.results.length === 0) {
        totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "Sin resultados, por favor verifica el nombre de la canción.",
        });
        return;
      }

      const artist = searchResponse.data.results[0].artistName;
      const trackName = searchResponse.data.results[0].trackName;

      // Buscar la canción en lyrics.ovh
      const lyricsResponse = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(trackName)}`
      );

      const lyrics = lyricsResponse.data.lyrics;
      if (!lyrics) {
        totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "Sin resultados, por favor verifica el nombre del artista y la canción.",
        });
        return;
      }

      const participant = msg.messages[0]?.key?.participant;
      const lyricMessage =
        `╭─⬣「 *Letra de la Canción* 」\n` +
        `│  ≡◦ 🎵 Título: \`${trackName}\`\n` +
        `│  ≡◦ 👤 Artista: \`${artist}\`\n` +
        `╰─⬣\n\n` +
        `${lyrics}\n\n` +
        `> © ᴍᴀᴅᴇ ʙʏ ᴛᴏᴛᴏʀᴏ ꜱᴏʟɪᴄɪᴛᴀᴅᴏ ᴘᴏʀ: @${participant.split("@")[0]}`;

      msg.reply({
        text: lyricMessage,
        mentions: [participant],
      });
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 404) {
        totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "Sin resultados, por favor verifica el nombre de la canción.",
        });
      } else {
        totoro.sendMessage(msg.messages[0]?.key?.remoteJid, {
          text: "¡Ups! Sucedió un error al obtener la letra de la canción.",
        });
      }
    }
  },
};
