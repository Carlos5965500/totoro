const {
  generateWAMessageFromContent,
  proto,
} = require("@whiskeysockets/baileys");
const blockcmd = require("../developer/blockcmd");
const dev = require("../../../settings.json").dev[0];
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "menu",
  description: "Muestra el menú de comandos.",
  aliases: ["menu", "help", "ayuda", "cmds", "cmd", "h"],
  category: "general",
  subcategory: "information",
  usage: "menu <comando>",
  cooldown: 5,
  dev: false,
  blockcmd: true,

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

    // Organizar los comandos en categorías y subcategorías
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

    // Ordenar las categorías, subcategorías y comandos alfabéticamente
    const sortedCategories = Object.keys(categories).sort();
    sortedCategories.forEach((category) => {
      const subcategories = Object.keys(categories[category]).sort();
      subcategories.forEach((subcategory) => {
        categories[category][subcategory].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
    });

    // Crear el texto del menú con emojis originales
    const categoryEmojis = {
      audio: "🎙️",
      developer: "🚀",
      forms: "✏️",
      general: "🔖",
      group: "📢",
      "inteligencia artificial": "🧠",
      information: "📘",
      moderator: "🛡️",
      multimedia: "🎬",
      payment: "💳",
      premium: "💎",
      search: "🖥️",
      "Sin Categoría": "🌀",
      user: "🔑",
      util: "🧩",
      utilities: "🔨",
      utility: "⚙️",
    };

    let info = `╭─ 🪼 *INFO* ─✧\n`;
    info += `│  ➙  🔹*Prefijo*: \`${prefix}\`\n`;
    info += `│  ➙  🔹 *Plugins*: ${total}\n`;
    info += `│  ➙  🔹 *Categorías*: ${sortedCategories.length}\n`;
    info += `│  ➙  🔹 *Ayuda*: -ayuda <comando>\n`;
    info += `│  ➙  🔹 *Dev*: @${dev.replace(/@.+/, "")}\n`;
    info += `╰────────✧\n\n`;

    let txt = `*─🪼 Comandos de Totoro 🪼─*\n\n`;

    sortedCategories.forEach((category) => {
      const emoji = categoryEmojis[category] || "🔹";
      const categoryCount = Object.values(categories[category]).flat().length;
      txt += `*╭─ ${emoji} ${category} (${categoryCount}) ─✧*\n`; // Título de la categoría con emoji y cantidad de comandos

      const subcategories = Object.keys(categories[category]).sort();
      subcategories.forEach((subcategory) => {
        const subcategoryCount = categories[category][subcategory].length;
        txt += ` │  ➙  *${subcategory}* (${subcategoryCount})\n`; // Subcategoría con cantidad de comandos
        categories[category][subcategory].forEach((plugin) => {
          txt += ` │        » \`${prefix}${plugin.name}\`\n`; // Comando y uso
        });
      });

      txt += "╰────────✧\n"; // Cierre de la categoría
    });

    txt += `> Contacta a @${dev.replace(/@.+/, "")} si tienes alguna duda.`;

    // Crear el contenido del mensaje
    const messageContent = {
      extendedTextMessage: {
        text: info + txt,
        contextInfo: {
          mentionedJid: [dev], // Añadir el JID del owner a las menciones
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
