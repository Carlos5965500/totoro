const { sendError, sendSuccess, help } = require("../../functions/messages");
const { totoUser, totoPremium } = require("../../models");

module.exports = {
  name: "getSerialNumber",
  category: "user",
  description: "Obtener el número de serie de un usuario premium",
  usage: "getSerialNumber",
  aliases: ["getserial", "serialnumber", "serial"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;

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

      try {
        const user = await totoUser.findOne({ where: { phone } });

        if (!user) {
          await sendError(
            totoro,
            msg,
            `Usuario con el número ${phone} no encontrado.`
          );
          return;
        }

        if (!user.premium) {
          await sendError(
            totoro,
            msg,
            `El usuario ${user.name} no es un usuario premium.`
          );
          return;
        }

        const premiumRecord = await totoPremium.findOne({
          where: { totoUserId: user.id },
        });

        if (!premiumRecord) {
          await sendError(
            totoro,
            msg,
            `No se encontró un registro premium para el usuario ${user.name}.`
          );
          return;
        }

        await sendSuccess(
          totoro,
          msg,
          `El número de serie de ${user.name} es ${premiumRecord.serialNumber}.`
        );
        await msg.react("✅");
      } catch (error) {
        console.error("Error al obtener el número de serie:", error);
        await sendError(totoro, msg, "Error al obtener el número de serie.");
      }
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
