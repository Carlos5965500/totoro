const verifyUser = require("../../utils/verifyuser");

module.exports = {
  name: "ping",
  description: "Muestra la latencia del bot.",
  aliases: ["ping"],
  category: "general",
  subcategory: "info",
  usage: "<ping>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "SEND_REACTIONS"],
  userPermissions: [],
  dev: false,
  blockcmd: true,
  async execute(totoro, msg, _) {
    // Registrar el tiempo de inicio
    const start = Date.now();

    // Enviar un mensaje para indicar que se está midiendo la latencia
    await totoro.sendMessage(msg.messages[0].key.remoteJid, {
      text: ` 🍭  Totoro midiendo la latencia`,
    });

    // Registrar el tiempo de finalización
    const end = Date.now();

    // Responder con la latencia medida
    msg.reply(
      `╭──⬣「 Pong! 」⬣\n` + `│  ≡◦  🍭  \`${end - start}ms\`\n` + `╰──⬣`
    );

    // Añadir una reacción al mensaje
    await msg.react("🏓");
  },
};
