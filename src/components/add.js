const { sendError } = require("../functions/messages");

module.exports = {
  id: "add",
  async execute(totoro, msg) {
    try {
      const groupId = msg.messages[0].key.remoteJid;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

      // Validar si el usuario que ejecuta el comando es administrador
      const executorId = msg.messages[0].key.participant;
      const executor = groupInfo.participants.find((x) => x.id === executorId);
      if (!executor || !executor.admin) {
        sendError(
          totoro,
          msg,
          "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando."
        );
        return; 
      }

      if (groupId.endsWith("@g.us")) {
        // Obtener el identificador del participante a agregar desde el mensaje
        const participantId =
          msg.messages[0].message.extendedTextMessage?.contextInfo?.participant;

        if (!participantId) {
          await totoro.sendMessage(groupId, {
            text: `Por favor, menciona al usuario que deseas agregar al grupo.`,
          });
          return;
        }

        // Agregar al usuario al grupo
        await totoro.groupParticipantsUpdate(groupId, [participantId], "add");

        // Enviar mensaje de éxito
        await totoro.sendMessage(groupId, {
          text:
            `╭─⬣「 Mensaje de Bienvenida 」⬣\n` +
            `│  ≡◦ 🍭 Bienvenido/a al grupo\n` +
            `╰─⬣\n` +
            `> ¡Bienvenido/a @${participantId.split("@")[0]}! @${executorId.split("@")[0]} te ha agregado al grupo ${groupName}.\n`,
          mentions: [participantId, executorId],
        });
      }
    } catch (error) {
      sendError(totoro, msg, error);
    }
  },
};
