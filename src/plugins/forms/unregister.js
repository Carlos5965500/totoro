const totoUser = require("../../models/totoUser");
const totoroLog = require("../../functions/totoroLog");
const {
  sendWarning,
  sendError,
  sendSuccess,
} = require("../../functions/messages");

module.exports = {
  name: "unregister",
  description: "Desregistra un totoUser de la base de datos",
  usage: "unregister",
  aliases: ["unreg"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;

      // Obtener número de teléfono directamente
      let telf = remoteJid;
      if (telf.includes("g.us")) {
        telf = msg.messages[0].key.participant;
      }

      const phone = telf.split("@")[0];

      // Buscar el usuario
      let user = await totoUser.findOne({ where: { phone: phone } });
      if (!user) {
        await sendWarning(totoro, msg, "No estás registrado en Totorolandia.");
        return;
      }

      console.log(
        `Desregistrando usuario con el número de teléfono ${phone}...`
      );

      // Eliminar el usuario de la base de datos
      const result = await totoUser.destroy({ where: { phone: phone } });

      if (result === 0) {
        await sendError(
          totoro,
          msg,
          "Error al desregistrar usuario. Inténtalo de nuevo."
        );
        console.log(
          `Error al desregistrar usuario: El usuario con el número de teléfono ${phone} no fue eliminado.`
        );
      } else {
        // Verificar si el usuario realmente fue eliminado
        user = await totoUser.findOne({ where: { phone: phone } });
        if (user) {
          await sendError(
            totoro,
            msg,
            "Error al desregistrar usuario. Inténtalo de nuevo."
          );
          console.log(
            `Error al desregistrar usuario: El usuario con el número de teléfono ${phone} no fue eliminado.`
          );
        } else {
          await sendSuccess(
            totoro,
            msg,
            "Te has desregistrado exitosamente en Totorolandia."
          );
          await msg.react("🗑️");
        }
      }
    } catch (error) {
      console.error(error);
      await sendError(totoro, msg, "Error al desregistrar usuario.");
    }
  },
};
