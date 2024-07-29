const axios = require("axios");
const {
  sendError,
  sendLicence,
  sendWarning,
} = require("../../functions/messages");
const { totoUser } = require("../../models");
const { prefix } = require("../../../settings.json").prefix;

module.exports = {
  name: "getLicense",
  category: "forms",
  subcategory: "register",
  description: "Generar un número de serie para un usuario",
  usage: `${prefix}license`,
  aliases: ["License", "license", "Licencia", "licencia", "lice"],
  dev: false,
  blockcmd: true,

  async execute(totoro, msg, args) {
    await msg.react("🔍");
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;

      if (remoteJid.endsWith("@g.us")) {
        await sendWarning(
          totoro,
          msg,
          "Este comando no está permitido en grupos."
        );
        return;
      }
      const telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      // Validación del formato del número de teléfono
      if (!/^\d+$/.test(phone)) {
        await help(
          totoro,
          msg,
          "Licencia",
          "Obtienes tu licencia",
          `${prefix}license`
        );
        return;
      }

      const user = await totoUser.findOne({ where: { phone } });

      if (!user) {
        await sendWarning(
          totoro,
          msg,
          "Para obtener un número de serie, primero debe registrarse con el comando /register."
        );
        return;
      }

      // Realiza una solicitud a la API para generar el número de serie
      try {
        const response = await axios.get(
          `https://cinammon.es/totoro/totoLicense.php?phone=${phone}`
        );

        if (!response.data.serial) {
          await sendLicence(
            msg,
            user.name,
            "Envíanos un correo a totorobot.wa@gmail.com"
          );
          return;
        }
      } catch (apiError) {
        await sendError(totoro, msg, "Error al generar el número de serie.");
        return;
      }
      await msg.react("✅");
    } catch (error) {
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
