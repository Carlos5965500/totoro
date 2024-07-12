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
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro no puede expulsar a alguien si no eres administrador.",
        });
        return;
      }

      if (msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        const group = msg.messages[0].key.remoteJid;

        if (
          !msg.messages[0].message.extendedTextMessage ||
          !msg.messages[0].message.extendedTextMessage.contextInfo ||
          !msg.messages[0].message.extendedTextMessage.contextInfo.mentionedJid
        ) {
          await totoro.sendMessage(group, {
            text: "Totoro necesita saber a quién expulsar.",
          });
          return;
        }

        const mentioned =
          msg.messages[0].message.extendedTextMessage.contextInfo
            .mentionedJid[0];

        if (!mentioned) {
          await totoro.sendMessage(group, {
            text: "Totoro necesita saber a quién expulsar.",
          });
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
          await totoro.sendMessage(group, {
            text: "Totoro no puede expulsar a un administrador.",
          });
        } else {
          await totoro.groupParticipantsUpdate(group, [mentioned], "remove");
          await totoro.sendMessage(group, {
            text: `@${mentioned.split("@")[0]} ha sido expulsado del grupo.`,
            mentions: [mentioned],
          });
        }
      } else {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro solo puede expulsar a alguien en un grupo.",
        });
      }
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Totoro está cansado y no pudo expulsar a este usuario. Error: ${error.message}`,
      });
    }
  },
};
