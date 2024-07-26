const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "addd",
  description: "Agrega a un usuario al grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `add <usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "ADD_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const groupName = groupInfo.subject;

      // Validar si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        await sendWarning(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return;
      }

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;

        // Validar si hay un mensaje citado
        const quotedMessage =
          msg.messages[0].message.extendedTextMessage?.contextInfo
            ?.quotedMessage;
        if (!quotedMessage) {
          await sendMessage(
            totoro,
            msg,
            `Por favor, cita el mensaje del usuario que deseas agregar.`
          );
          return;
        }

        const quotedUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;

        if (!quotedUser) {
          await help(
            totoro,
            msg,
            "Agregar Usuario",
            "No se pudo determinar el usuario a agregar. Asegúrate de citar el mensaje correctamente.",
            "add"
          );
          return;
        }

        await totoro.groupParticipantsUpdate(group, [quotedUser], "add");

        // Enviar mensaje de bienvenida
        await totoro.sendMessage(group, {
          text:
            `╭─⬣「 Mensaje de Bienvenida 」⬣\n` +
            `│  ≡◦ 🍭 Bienvenido/a al grupo\n` +
            `╰─⬣\n` +
            `> ¡Bienvenido/a @${quotedUser.split("@")[0]}! @${sender.split("@")[0]} te ha agregado al grupo ${groupName}.\n`,
          mentions: [quotedUser, sender],
        });
      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
      console.error("Error during execution:", error);
      await sendError(
        totoro,
        msg,
        `No pude agregar a este usuario. Error: ${error.message}`
      );
    }
  },
};
