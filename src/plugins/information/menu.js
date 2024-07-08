const {
    generateWAMessageFromContent,
    proto
} = require("@whiskeysockets/baileys");

module.exports = {
    name: "menu",
    description: "Muestra el menú de comandos.",
    aliases: ["menu", "help", "ayuda"],
    category: "information",
    subcategory: "help",
    usage: "menu <comando>",
    cooldown: 5,

    async execute(sock, msg, _) {
        const from = msg.messages[0]?.key?.remoteJid;

        if (!from) {
            console.error("msg.messages[0].key.remoteJid no está definido.");
            return;
        }

        const plugins = sock.plugins || [];
        //console.log("Comandos cargados:", plugins); // Mensaje de depuración
        const categories = {};

        plugins.forEach((plugin) => {
            const category = plugin.category ? plugin.category.split("\\")[0] : "Sin Categoría";
            const subcategory = plugin.subcategory || "Sin Subcategoría";
            if (!categories[category]) {
                categories[category] = {};
            }
            if (!categories[category][subcategory]) {
                categories[category][subcategory] = new Set();
            }
            categories[category][subcategory].add(plugin);
        });

        //console.log("Categorías organizadas:", categories); // Mensaje de depuración

        let txt = `╭──⬣「 Menú de Comandos 」⬣\n`;
        for (const category in categories) {
            txt += `│  ≡◦ ${category.toUpperCase()}\n`;
            for (const subcategory in categories[category]) {
                txt += `│  ╭──⊰ ${subcategory} ⊱──────────╮\n`;
                categories[category][subcategory].forEach((plugin) => {
                    txt += `│  │  ≡◦ .${plugin.name} : ${plugin.usage}\n`;
                });
                txt += `│  ╰──────────────────╯\n`;
            }
        }
        txt += `╰──⬣\n\n`;
        txt += `© ᴍᴀᴅᴇ ʙʏ @Nia 🦊\n`;
        txt += `Si necesitas más información sobre un comando, usa: -ayuda <nombre del comando>`;

        //console.log("Texto del menú:", txt); // Mensaje de depuración

        const messageContent = {
            extendedTextMessage: {
                text: txt,
            }
        };

        const protoMessage = proto.Message.fromObject(messageContent);

        const message = generateWAMessageFromContent(
            from,
            protoMessage,
            {
                quoted: msg.messages[0]
            }
        );

        await sock.relayMessage(from, message.message, { messageId: message.key.id });
    },
};
