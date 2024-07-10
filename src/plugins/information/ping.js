module.exports = {
  name: "ping",
  description: "Muestra la latencia del bot.",
  aliases: ["ping"],
  category: "general",
  subcategory: "info",
  usage: "<ping>",
  cooldown: 5,

  async execute(totoro, msg, _) {
    const start = Date.now();

    await totoro.sendMessage(msg.messages[0].key.remoteJid, {
      text: ` 🍭  Totoro midiendo la latencia`,
    });

    const end = Date.now();

    msg.reply(
      `╭──⬣「 Pong! 」⬣\n`+
      `│  ≡◦  🍭  \`${end - start}ms\`\n` +
      `╰──⬣`
    )

    await msg.react("🏓")
  },
};
