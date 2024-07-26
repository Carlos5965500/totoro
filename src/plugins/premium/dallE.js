const { OpenAI } = require("openai");
const { sendError, infoPremium } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");
const totoPremium = require("../../models/totoPremium");
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

      if (!totoPremium) {
        infoPremium(totoro, msg, "Este comando es solo para usuarios premium.");
        return;
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const dallE = await openai.images.generate({
        prompt: content,
        model: "dall-e-2",
        quality: "standard",
        response_format: "url",
      });

      totoro.sendMessage(from, { image: { url: dallE.data[0].url } });
    } catch (e) {
      totoroLog.error("./logs/plugins/premium/dallE.log", `${e.message}`);
      sendError(totoro, msg, `Error al generar imagen: ${e.message}`);
    }
  },
};
