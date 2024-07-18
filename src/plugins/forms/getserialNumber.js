const axios = require("axios");
const {
  sendError,
  sendSerial,
  sendWarning,
} = require("../../functions/messages");
const { totoUser } = require("../../models");

module.exports = {
  name: "getSerialNumber",
  category: "user",
  description: "Generar un número de serie para un usuario",
  usage: "getSerialNumber",
  aliases: ["getserial", "serialnumber", "serial"],

  async execute(totoro, msg, args) {
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
        await sendError(
          totoro,
          msg,
          `Número de teléfono ${phone} no es válido.`
        );
        return;
      }

      const user = await totoUser.findOne({ where: { phone } });

      if (!user) {
        await sendError(
          totoro,
          msg,
          `Usuario con el número ${phone} no encontrado.`
        );
        return;
      }

      // Realiza una solicitud a la API para generar el número de serie
      try {
        const response = await axios.get(
          `https://cinammon.es/totoro/totoLicense.php?phone=${phone}`
        );

        // Verificar la estructura de la respuesta
        if (response.data && response.data.totoLicense) {
          const serialNumber = response.data.totoLicense;

          await sendSerial(msg, user.name, serialNumber);
          msg.reply(`${serialNumber}`);
        } else {
          console.error("Respuesta inesperada de la API:", response.data);
          await sendError(
            totoro,
            msg,
            "Error al generar el número de serie. Respuesta inesperada de la API."
          );
        }
      } catch (apiError) {
        console.error("Error al generar el número de serie:", apiError);
        await sendError(totoro, msg, "Error al generar el número de serie.");
        return;
      }

      await msg.react("✅");
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
