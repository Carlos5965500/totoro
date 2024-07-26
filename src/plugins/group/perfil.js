const totoUser = require("../../models/totoUser");
const verifyUser = require("../../utils/verifyuser");
const totoroLog = require("../../functions/totoroLog");
const { sendWarning, sendError } = require("../../functions/messages");
const formatPhoneNumber = require("../../utils/formatPhoneNumber"); // Función para formatear números

module.exports = {
  name: "perfil",
  category: "group",
  subcategory: "tools",
  description: "Muestra el perfil de un usuario",
  usage: "perfil <@usuario>",
  aliases: ["profile", "p"],

  async execute(totoro, msg, args) {
    try {
      // Aseguramos que el objeto msg y sus propiedades están definidas
      const participant = msg.messages?.[0]?.key?.participant;
      const remoteJid = msg.messages?.[0]?.key?.remoteJid;
      const pushname = msg.pushName;

      // Verificamos la existencia de ambos participant y remoteJid
      if (!participant && !remoteJid) {
        return sendError(
          totoro,
          msg,
          "No se pudo obtener el número del usuario o el chat."
        );
      }

      // Verificamos si el usuario está registrado
      let user;
      try {
        user = await verifyUser(participant || remoteJid);
      } catch (error) {
        if (
          error.message ===
          "No estás registrado. Por favor, regístrate antes de usar este comando."
        ) {
          return sendWarning(
            totoro,
            msg,
            `No estás registrado. Por favor, regístrate antes de usar el comando ${this.name}.`
          );
        } else {
          return sendError(totoro, msg, error.message);
        }
      }

      let totoU;
      if (args[0]) {
        // Si se menciona a otro usuario, buscamos su perfil
        const mentionedPhone = args[0];
        totoU = await totoUser.findOne({ where: { phone: mentionedPhone } });

        if (!totoU) {
          return sendWarning(
            totoro,
            msg,
            "No se encontró el usuario solicitado."
          );
        }
      } else {
        // Si no se menciona a otro usuario, mostramos el perfil del usuario que ejecutó el comando
        totoU = await totoUser.findOne({ where: { phone: user.phone } });
      }

      const formattedPhone = formatPhoneNumber(totoU.phone);
      const profileMessage =
        `╭─⬣「 *Perfil de ${totoU.name}* 」⬣\n` +
        `│  ≡◦ *🍭 Nombre*: ${totoU.name} (${pushname})\n` +
        `│  ≡◦ *🍭 Número de teléfono*: ${formattedPhone}\n` +
        `│  ≡◦ *🍭 LINK*: wa.me/${totoU.phone.replace(/\D/g, "")}\n` +
        `│  ≡◦ *🍭 Edad*: ${totoU.age} años\n` +
        `│  ≡◦ *🍭 Registrado*: ${totoU.registered ? "Sí" : "No"}\n` + // Indica si el usuario está registrado
        `│  ≡◦ *🍭 Premium*: ${totoU.isPremium ? "Sí" : "No"}\n` +
        `│  ≡◦ *🍭 Número de serie*: ${totoU.serialNumber}\n` +
        `╰─⬣\n\n` +
        `> 🍭 Gracias por usar Totoro`;

      await totoro.sendMessage(remoteJid || participant, {
        text: profileMessage,
      });
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/group/perfil.log",
        `Error enviando mensaje de perfil: ${error}`
      );
      await sendError(
        totoro,
        msg,
        "Hubo un error al intentar mostrar el perfil del usuario."
      );
    }
  },
};
