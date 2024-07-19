module.exports = {
  id: "sendmp4",
  name: "sendmp4",

  async execute(totoro, msg, args) {
    await totoro.sendMessage(
      remoteJid || participant,
      {
        document: { url: dl_url },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: txt,
      },
      { quoted: msg.messages[0], asDocument: user.useDocument }
    );
    await msg.react("🍭");
  },
};
