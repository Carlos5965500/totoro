const { sendWarning, sendError, sendMessage } = require("../functions/messages");

module.exports = {
  id: "kick",
  async execute(totoro, msg, args) {
    try {
      const quotedMessage =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage) {
        return sendWarning(
          totoro,
          msg,
          "Por favor, cita el mensaje del usuario que deseas expulsar."
        );
      }

      const quotedUser =
        msg.messages[0].message.extendedTextMessage.contextInfo.participant;
      const group = msg.messages[0].key.remoteJid;

      if (!quotedUser) {
        return sendWarning(
          totoro,
          msg,
          "No se pudo determinar el usuario a expulsar. Asegúrate de citar el mensaje correctamente."
        );
      }

      await totoro.groupParticipantsUpdate(group, [quotedUser], "remove");

      await sendMessage(
        totoro,
        msg,
        `@${quotedUser.split("@")[0]} ha sido expulsado del grupo.`,
        [quotedUser]
      );
    } catch (error) {
      return sendError(
        totoro,
        msg,
        `No pude expulsar al usuario. Error: ${error.message}`
      );
    }
  },
};
