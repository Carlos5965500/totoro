const totoUser = require("../../models/totoUser");
const totoroLog = require("../../functions/totoroLog");
const {
  sendWarning,
  sendError,
  sendSuccess,
} = require("../../functions/messages");
const axios = require("axios"); // Para enviar datos a la página web

module.exports = {
  name: "delete",
  category: "forms",
  subcategory: "user",
  description: "Desregistra un totoUser de la base de datos",
  usage: "delete <numeroSerial>",
  aliases: ["unreg"],
  dev: false,
  blockcmd: true,

  async execute(totoro, msg, args) {
    try {
      if (args.length < 1) {
        await sendWarning(
          totoro,
          msg,
          "Debes proporcionar un numeroSerial para desregistrarte."
        );
        return;
      }

      const numeroSerial = args[0];
      const remoteJid = msg.messages[0].key.remoteJid;

      // Obtener número de teléfono directamente
      let telf = remoteJid;
      if (telf.includes("g.us")) {
        telf = msg.messages[0].key.participant;
      }

      const phone = telf.split("@")[0];

      // Buscar el usuario
      let user = await totoUser.findOne({
        where: { phone: phone, numeroSerial: numeroSerial },
      });
      if (!user) {
        await sendWarning(
          totoro,
          msg,
          "No estás registrado en Totorolandia con el numeroSerial proporcionado."
        );
        return;
      }

      // Pedir la razón de la desregistración
      await sendWarning(
        totoro,
        msg,
        "Por favor, proporciona la razón para desregistrarte:"
      );

      // Aguardar la respuesta con la razón
      const filter = (response) => response.key.remoteJid === remoteJid;
      const collected = await totoro.awaitMessages(filter, {
        max: 1,
        time: 60000,
        errors: ["time"],
      });
      const razon = collected.first().body;

      // Confirmar la desregistración
      await sendWarning(
        totoro,
        msg,
        `Estás seguro de que quieres desregistrarte por la siguiente razón: "${razon}"? Responde con "confirmar" para continuar.`
      );

      // Aguardar la confirmación
      const collectedConfirm = await totoro.awaitMessages(filter, {
        max: 1,
        time: 60000,
        errors: ["time"],
      });
      const confirm = collectedConfirm.first().body.toLowerCase();

      if (confirm !== "confirmar") {
        await sendWarning(totoro, msg, "Desregistración cancelada.");
        return;
      }

      // Eliminar el usuario de la base de datos
      const result = await totoUser.destroy({
        where: { phone: phone, numeroSerial: numeroSerial },
      });

      if (result === 0) {
        await sendError(
          totoro,
          msg,
          "Error al desregistrar usuario. Inténtalo de nuevo."
        );
        totoroLog.error(
          "./logs/plugins/forms/unregister.log",
          `Error al desregistrar usuario: El usuario con el número de teléfono ${phone} no fue eliminado.`
        );
      } else {
        // Enviar la información a la página web de registros
        await axios.post("https://cinammon.es/totoro/abandonar", {
          phone: phone,
          numeroSerial: numeroSerial,
          razon: razon,
        });

        await sendSuccess(
          totoro,
          msg,
          "Te has desregistrado exitosamente en Totorolandia."
        );
        await msg.react("🗑️");
      }
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/forms/unregister.log",
        `Error al desregistrar usuario: ${error}`
      );
      await sendError(totoro, msg, "Error al desregistrar usuario.");
    }
  },
};
