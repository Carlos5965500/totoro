const {
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "menu",
  description: "Muestra el menú de comandos.",
  aliases: ["menu", "help", "ayuda", "cmds", "cmd", "h"],
  category: "information",
  subcategory: "help",
  usage: "menu <comando>",
  cooldown: 5,

  async execute(totoro, msg, _) {
    const from = msg.messages[0]?.key?.remoteJid;

    if (!from) {
      console.error("msg.messages[0].key.remoteJid no está definido.");
      return;
    }

    const plugins = totoro.plugins || [];
    const categories = {};

    // total de comandos
    let total = 0;
    plugins.forEach((plugin) => {
      total++;
    });

    // Organizar los comandos en categorías
    plugins.forEach((plugin) => {
      const category = plugin.category
        ? plugin.category.split("\\")[0]
        : "Sin Categoría";
      const subcategory = plugin.subcategory || "Sin Subcategoría";
      if (!categories[category]) {
        categories[category] = {};
      }
      if (!categories[category][subcategory]) {
        categories[category][subcategory] = [];
      }
      categories[category][subcategory].push(plugin);
    });

    // Crear el texto del menú con emojis originales
    const categoryEmojis = {
      "Inteligencia Artificial": "🧠",
      Audio: "🎙️",
      developer: "🚀",
      utility: "⚙️",
      forms: "✏️",
      payment: "💳",
      user: "🔑",
      group: "📢",
      information: "📘",
      general: "🔖",
      moderator: "🛡️",
      multimedia: "🎬",
      search: "🖥️",
      util: "🧩",
      utilities: "🔨",
      "Sin Categoría": "🌀",
    };

    let txt = `💡 *Menú de Comandos* (${total} disponibles)\n\n`;

    for (const category in categories) {
      const emoji = categoryEmojis[category] || "🔹";
      txt += `*╭─ ${emoji} ${category} ─✧*\n`; // Título de la categoría con emoji

      for (const subcategory in categories[category]) {
        txt += ` │  ➙  *${subcategory}*\n`; // Subcategoría
        categories[category][subcategory].forEach((plugin) => {
          txt += ` │        » \`${prefix}${plugin.name}\`\n`; // Comando y uso
        });
      }
      txt += "╰────────✧\n"; // Cierre de la categoría
    }

    txt += `\n© ᴍᴀᴅᴇ ʙʏ @Nia 🦊\n`;
    txt += `Para más info sobre un comando, usa: -ayuda <nombre del comando>`;

    // Crear el contenido del mensaje
    const messageContent = {
      extendedTextMessage: {
        text: txt,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363317595204735@newsletter",
            newsletterName: "Canal de Totoro 🪼",
            serverMessageId: -1,
          },
        },
      },
    };

    const protoMessage = proto.Message.fromObject(messageContent);
    const message = generateWAMessageFromContent(from, protoMessage, {
      quoted: msg.messages[0],
    });

    // Enviar el mensaje
    await totoro.relayMessage(from, message.message, {
      messageId: message.key.id,
    });
  },
};
