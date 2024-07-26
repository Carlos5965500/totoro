const { OpenAI } = require("openai");
const { sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
module.exports = {
  name: "dalle",
  aliases: [],
  category: "premium",
  subcategory: "IA",
  description: "Genera imagenes con AI.",
  cmdPrem: true,

  async execute(totoro, msg, args) {
    const content = args.join(" ");

    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      totoro.sendMessage(from, { text: text }, { quoted: info });
    };

    try {
      if (!content) {
        reply("Falta el prompt.");
        return;
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const dallE = await openai.images.generate({
        prompt: content,
        model: "dall-e-2",
        quality: "standard",
        response_format: "url",
      });

      reply(dallE.data.url);
    } catch (e) {
      totoroLog.error("./logs/plugins/premium/dallE.log", `${e.message}`);
      sendError(totoro, msg, `Error al generar imagen: ${e.message}`);
    }
  },
};
