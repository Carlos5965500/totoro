const { fs } = require("fs/promises");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "getSesion",
  category: "Developer",
  subcategory: "WhatsApp",
  description: "Obtener la sesión de WhatsApp",
  usage: "<getSesion>",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      const session = await fs.readFile("auth/momo-auth/creds.json", "utf-8");
      msg.chat,
        {
          document: Buffer.from(auth),
          mimetype: "application/json",
          filename: "creds.json",
        },
        { quoted: msg };

      totoroLog.info(
        "./logs/plugins/developer/getSesion.log",
        "Sesión de WhatsApp obtenida con éxito"
      );
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/developer/getSesion.log",
        `Error al obtener la sesión de WhatsApp: ${error.message}`
      );
      msg.reply("No se pudo obtener la sesión de WhatsApp");
    }
  },
};
