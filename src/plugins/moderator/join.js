module.exports = {
  name: "join",
  description: "Unirse a un grupo usando un enlace de invitación.",
  category: "utility",
  subcategory: "group",
  usage: `join <link>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "JOIN_GROUP"],
  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (!args[0]) {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro necesita un enlace de invitación para unirse al grupo.",
        });
        return;
      }

      const inviteLink = args[0];
      const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
      const match = inviteLink.match(regex);

      if (!match) {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "El enlace de invitación no es válido.",
        });
        return;
      }

      const inviteCode = match[1];

      try {
        await totoro.groupAcceptInvite(inviteCode); // Método correcto para unirse al grupo
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro se ha unido al grupo.",
        });
      } catch (error) {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: `Totoro no pudo unirse al grupo. Error: ${error.message}`,
        });
      }
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Totoro está cansado y no pudo unirse al grupo. Error: ${error.message}`,
      });
    }
  },
};
