const { sendWarning, help, sendError } = require("../../functions/messages");
const totoWarn = require("../../models/totoWarn");
const totoUser = require("../../models/totoUser");

module.exports = {
  name: "warns",
  description: "Avisa al usuario mencionado.",
  category: "moderator",
  subcategory: "admin",
  usage: `warn <options>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "REMOVE_PARTICIPANTS"],
  userPermissions: ["ADMINISTRATOR"],
  dev: false,
  blockcmd: true,
  execute: async (totoro, msg, args) => {
    try {
      const sender = msg.messages[0].key.participant;
      const groupInfo = await totoro.groupMetadata(
        msg.messages[0].key.remoteJid
      );
      const key = msg.messages[0].key;
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
        let userToAdd;

        // Verificar si hay un usuario citado
        if (
          msg.messages[0].message.extendedTextMessage.contextInfo.participant
        ) {
          userToAdd =
            msg.messages[0].message.extendedTextMessage.contextInfo.participant;
        }

        // Verificar si hay un número de teléfono en los argumentos
        const typeCmd = args.shift();
        if (!userToAdd && args[0].includes("@")) {
            userToAdd = args.shift().split("@")[1]+"@s.whatsapp.net";
        }
        console.log(userToAdd);
        if (!userToAdd) {
          await help(
            totoro,
            msg,
            "Warn user",
            "No se pudo determinar el usuario a avisar. Asegúrate de citar el mensaje correctamente o proporcionar un número de teléfono.",
            "warns <warn|info> <usuario> | warns <warn|info> <número de teléfono> | warns <warn|info> (respondiendo a un mensaje)"
          );
          return;
        }
        if(typeCmd == "warn"){
            const user = await totoWarn.findOne({ where: { userPhone: userToAdd.split("@")[0] } });
            let userIdx;
            try {
                userIdx = (await totoUser.findOne({ where: { phone: userToAdd.split("@")[0] } })).id;
            } catch (error) {
                return await sendWarning(totoro, msg, "El usuario no está registrado en la base de datos.");
            }
            if (!user) {
                const JSONX = { [key.remoteJid]: {1: {"reason": args.join(" ")}}}
                await totoWarn.create({ userId: userIdx, userPhone: userToAdd.split("@")[0], warnInfo: JSON.stringify(JSONX) });
            } else {
                const warns = JSON.parse(user.warnInfo);
                const warnNumber = Object.keys(warns[key.remoteJid]).length + 1;
                warns[key.remoteJid][warnNumber] = {"reason": args.join(" ")};
                await totoWarn.update({ warnInfo: JSON.stringify(warns) }, { where: { userPhone: userToAdd.split("@")[0] } });
            }
            if(!user?.warnInfo) return msg.reply("El usuario ha sido advertido por primera vez.");
            const warns = JSON.parse(user.warnInfo);
            const warnNumber = Object.keys(warns[key.remoteJid]).length;
            if(Object.keys(warns[key.remoteJid]).length >= 4){
                await totoro.groupParticipantsUpdate(group, [userToAdd], "remove");
                msg.reply("El usuario ha sido eliminado del grupo por acumular 3 advertencias. Se le borró el historial.");
                totoWarn.update({ warnInfo: JSON.stringify({}) }, { where: { userPhone: userToAdd.split("@")[0] } });
            }
        }

        await totoro.groupParticipantsUpdate(group, [userToAdd], "add");



      } else {
        await sendWarning(
          totoro,
          msg,
          "Este comando solo puede ser usado en grupos."
        );
      }
    } catch (error) {
        console.error(error);
      await sendError(
        totoro,
        msg,
        `No se pudo agregar al participante: ${error.message}`
      );
    }
  },
};
