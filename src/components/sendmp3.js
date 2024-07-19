module.exports = {
  id: "sendmp3",
  name: "sendmp3",

  async execute(totoro, msg, args) {
    
    await totoro.sendMessage(
      remoteJid || participant,
      {
        document: { url: dl_url },
        mimetype: "audio/mp3",
        fileName: `${title}.mp3`,
        caption: txt,
      },
      { quoted: msg.messages[0], asDocument: user.useDocument }
    );
    await msg.react("🍭");
  },
};
