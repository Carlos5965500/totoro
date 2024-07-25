const {
  sendWarning,
  help,
  sendError,
  sendMessage,
} = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "add",
  description: "Añade a un usuario al grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `add <número de teléfono>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "ADD_PARTICIPANTS"],
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

        if (!args[0]) {
          await sendMessage(
            totoro,
            msg,
            `Totoro necesita saber a quién añadir.`
          );
          return;
        }

        const phoneNumber = args[0].replace(/\D/g, "");
        const addJid = `${phoneNumber}@s.whatsapp.net`;

        if (!phoneNumber) {
          await help(
            totoro,
            msg,
            "Añadir Usuario",
            "Totoro necesita saber a quién añadir.",
            "add <número de teléfono>"
          );
          return;
        }

        await totoro.groupParticipantsUpdate(group, [addJid], "add");
        await totoro.sendMessage(group, {
          text:
            `╭─⬣「 Mensaje de Totoro 」⬣` +
            `│  ≡◦ 🍭 Totoro dice lo siguiente:\n` +
            `╰─⬣\n` +
            `> @${sender.split("@")[0]} ha añadido a @${addJid.split("@")[0]} al grupo.`,
          mentions: [addJid],
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
        `No pude añadir a este usuario. Error: ${error.message}`
      );
    }
  },
};
