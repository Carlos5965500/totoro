const { OpenAI } = require("openai");

module.exports = {
  name: "dalle",
  aliases: [],
  category: "Ai 🤖",
  description: "Genera imagenes con AI.",
  cmdPrem: true,

  async execute(client, msg, args) {
    const content = args.join(" ");

    const info = msg.messages[0];
    const from = info.key.remoteJid;
    const reply = (text) => {
      client.sendMessage(from, { text: text }, { quoted: info });
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

      client.sendMessage(from, { image: { url: dallE.data[0].url } });
    } catch (e) {
      console.log(e);
      reply("*🏮 Error al enviar la reseña*");
    }
  },
};
