const { sendSuccess } = require("../../functions/messages");
module.exports = {
  name: "ping",
  description: "Muestra la latencia del bot.",
  aliases: ["ping"],
  category: "general",
  subcategory: "info",
  usage: "<ping>",
  cooldown: 5,

  async execute(totoro, msg) {
    const start = Date.now();
    await totoro.sendMessage(msg.messages[0].key.remoteJid, {
      text: ` 🍭  Totoro midiendo la latencia`
    });
    const end = Date.now();
    const ping = end - start;
    sendSuccess(
      totoro,  
      msg.reply(
        `╭──⬣「 Pong! 」⬣\n`+
        `│  ≡◦  🍭  ${ping}ms\n`+
        `╰──────────────`
      )
    ); 
  }
};
