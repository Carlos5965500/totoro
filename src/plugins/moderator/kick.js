const {
  sendWarning,
  help,
  sendError,
  sendMediaMessage,
  sendMessage,
} = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "kick",
  description: "Expulsa a un usuario del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `kick <@usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );

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

        if (
          !msg.messages[0].message.extendedTextMessage ||
          !msg.messages[0].message.extendedTextMessage.contextInfo ||
          !msg.messages[0].message.extendedTextMessage.contextInfo.mentionedJid
        ) {
          await sendMessage(
            totoro,
            msg,
            `Totoro necesita saber a quién expulsar.`
          );
          return;
        }

        const mentioned =
          msg.messages[0].message.extendedTextMessage.contextInfo
            .mentionedJid[0];

        if (!mentioned) {
          await help(
            totoro,
            msg,
            "Expulsar Usuario",
            "Totoro necesita saber a quién expulsar.",
            "kick <@usuario>"
          );
          return;
        }

        const isUserAdmin = groupInfo.participants.some(
          (participant) =>
            participant.id === mentioned &&
            (participant.admin ||
              participant.superAdmin ||
              participant.isCreator)
        );

        if (isUserAdmin) {
          await sendWarning(
            totoro,
            msg,
            "No puedo expulsar a un administrador o creador del grupo."
          );
        } else {
          await totoro.groupParticipantsUpdate(group, [mentioned], "remove");
          await totoro.sendMessage(group, {
            text:
              `╭─⬣「 Mensaje de Totoro 」⬣` +
              `│  ≡◦ 🍭 Totoro dice lo siguiente:\n` +
              `╰─⬣\n` +
              `> @${sender.split("@")[0]} ha expulsado a @${mentioned.split("@")[0]} del grupo.`,
            mentions: [mentioned],
          });
        }
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
