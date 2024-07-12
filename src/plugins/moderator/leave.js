module.exports = {
  name: "leave",
  description: "Salir del grupo actual.",
  category: "utility",
  subcategory: "group",
  usage: `<leave>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "LEAVE_GROUP"],
  userPermissions: ["ADMINISTRATOR"],

  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;

      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro solo puede salir de un grupo.",
        });
        return;
      }

      const group = msg.messages[0].key.remoteJid;

      const groupInfo = await totoro.groupMetadata(group);

      // Validar si el usuario que ejecuta el comando es administrador
      const participant = groupInfo.participants.find((x) => x.id === sender);
      if (!participant || !participant.admin) {
        await totoro.sendMessage(group, {
          text: "Totoro no puede salir del grupo si no eres administrador.",
        });
        return;
      }

      await totoro.sendMessage(group, {
        text: "Totoro está saliendo del grupo, ¡adiós!",
      });

      await totoro.groupLeave(group);
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Totoro está cansado y no pudo salir del grupo. Error: ${error.message}`,
      });
    }
  },
};
