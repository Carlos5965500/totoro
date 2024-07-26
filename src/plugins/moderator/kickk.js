const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");

module.exports = {
  name: "kickk",
  description: "Expulsa a un usuario del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `kickk <usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
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
        sendWarning(
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
            `Por favor, cita el mensaje del usuario que deseas expulsar.`
          );
          return;
        }

        const quotedUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;

        if (!quotedUser) {
          await help(
            totoro,
            msg,
            "Expulsar Usuario",
            "No se pudo determinar el usuario a expulsar. Asegúrate de citar el mensaje correctamente.",
            "kick <usuario>"
          );
          return;
        }

        await totoro.groupParticipantsUpdate(group, [quotedUser], "remove");

        // Enviar mensaje de expulsión
        await totoro.sendMessage(group, {
          text:
            `╭─⬣「 Mensaje de Expulsión 」⬣\n` +
            `│  ≡◦ 🍭 Totoro te expulsó` +
            `╰─⬣\n` +
            `> Hasta luego @${quotedUser.split("@")[0]}, @${sender.split("@")[0]} lo ha expulsado del grupo ${groupName}.\n`,
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
      await sendError(
        totoro,
        msg,
        `No pude expulsar a este usuario. Error: ${error.message}`
      );
    }
  },
};
