const { sendMessage, sendError, help } = require("../../functions/messages");

module.exports = {
  name: "admins",
  description: "Lista a todos los administradores del grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: "<admins>",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "MENTION_EVERYONE"],
  userPermissions: [],

  async execute(totoro, msg, args) {
    try {
      if (!msg.messages[0].key.remoteJid.endsWith("@g.us")) {
        await help(totoro, msg, "Lista de Administradores");
        return;
      }

      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const admins = groupInfo.participants.filter(
        (participant) =>
          participant.admin || participant.superAdmin || participant.isCreator
      );

      if (admins.length === 0) {
        await sendMessage(totoro, msg, `No hay administradores en este grupo.`);
        return;
      }

      let adminList = `╭─⬣「 Administradores 」⬣\n`;
      const mentions = [];
      admins.forEach((admin, index) => {
        const prefix = index === admins.length - 1 ? "│  ≡◦  🍭" : "│  ≡◦  🍭";
        adminList += `${prefix} @${admin.id.split("@")[0]}\n`;
        mentions.push(admin.id);
      });
      adminList += `╰─⬣`;

      await sendMessage(totoro, msg, adminList, mentions);

      msg.react("👑");
    } catch (error) {
      console.error(error);
      await sendError(
        totoro,
        msg,
        `Totoro está cansado y no pudo obtener la lista de administradores. Error: ${error.message}`
      );
    }
  },
};
