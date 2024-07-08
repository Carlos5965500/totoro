module.exports = {
  name: "ping",
  description: "Muestra la latencia del bot.",
  aliases: ["ping"],
  category: "general",
  subcategory: "info",
  usage: "<ping>",
  cooldown: 5,

  async execute(sock, msg, _) {
    const start = Date.now();

    await sock.sendMessage(msg.messages[0].key.remoteJid, {
      text: "¡Pong!",
    });

    const end = Date.now();

    msg.reply(`\`${end - start}ms\``);
  },
};
