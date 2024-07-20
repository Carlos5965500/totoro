const { Hercai } = require("hercai");
const { help, sendError } = require("../../functions/messages");
const { subcategory } = require("../multimedia/igimage");

module.exports = {
  name: "hercai",
  category: "*Inteligencia Artificial*",
  subcategory: "ai",
  description: "Hercai AI",
  usage: "hercai <message>",
  aliases: ["hercai", "hercai"],
  async execute(totoro, msg, args) {
    try {
      const message = args.join(" ");
      if (!message) {
        await help(
          totoro,
          msg,
          "Hercai AI",
          "Ingresa un mensaje",
          "+hercai <message>"
        );
        await msg.react("❓");
        return;
      }

      const hercai = new Hercai();
      const response = await hercai.question({
        content: message,
        model: "v3",
      });

      // Enviar la respuesta usando msg.reply
      await msg.reply(response.reply);
    } catch (error) {
      await sendError(totoro, msg, error.message);
    }
  },
};
