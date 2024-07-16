const { v4: uuidv4 } = require("uuid");
const { sendError, sendSerial } = require("../../functions/messages");
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

      // Verificación de roles
      const userRoles = user.roles || []; // Asumiendo que los roles se guardan en un array
      if (
        userRoles.includes(totoro.config.dev) ||
        userRoles.includes(totoro.config.admin)
      ) {
        await sendError(
          totoro,
          msg,
          `El usuario ${phone} es un desarrollador o administrador y no puede generar un número de serie.`
        );
        return;
      }

      const serialNumber = uuidv4();

      await sendSerial(msg, user.name, serialNumber);
      msg.reply(`${serialNumber}`);

      await msg.react("✅");
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
