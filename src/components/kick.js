const { sendError, sendWarning } = require("../functions/messages");

module.exports = {
  id: "kick",
  async execute(totoro, msg, args) {
    try {
      if (args.length !== 1) {
        await sendWarning(
          totoro,
          msg,
          "Debes proporcionar un número de teléfono para expulsar al usuario. Usa el formato: `kick <numero de telefono>`."
        );
        return;
      }

      const phoneNumber = args[0];
      if (!/^\d{10,15}$/.test(phoneNumber)) {
        // Asegúrate de ajustar el patrón según el formato esperado
        await sendWarning(
          totoro,
          msg,
          "El número de teléfono proporcionado no es válido. Asegúrate de ingresar solo números y que tenga entre 10 y 15 dígitos."
        );
        return;
      }

      const groupId = msg.messages[0].key.remoteJid;
      const groupInfo = await totoro.groupMetadata(groupId);
      const groupName = groupInfo.subject;

      if (groupId.endsWith("@g.us")) {
        // Formatear el número de teléfono al formato de ID
        const participantId = `${phoneNumber}@s.whatsapp.net`;

        // Verificar si el usuario está en el grupo
        const userExists = groupInfo.participants.some(
          (p) => p.id === participantId
        );
        if (!userExists) {
          await sendWarning(
            totoro,
            msg,
            "El participante no está en el grupo."
          );
          return;
        }

        // Expulsar al usuario del grupo
        await totoro.groupParticipantsUpdate(
          groupId,
          [participantId],
          "remove"
        );

        // Obtener el ID del usuario que ejecuta el comando
        const executorId = msg.messages[0].key.participant;

        // Enviar mensaje informando sobre la expulsión
        await totoro.sendMessage(groupId, {
          text:
            `╭─⬣「 Mensaje de Expulsión 」⬣\n` +
            `│  ≡◦ 💔 ${groupName}\n` +
            `╰─⬣\n` +
            `> @${phoneNumber} ha sido expulsado del grupo por @${executorId.split("@")[0]}.`,
          mentions: [participantId, executorId], // Mencionar al usuario expulsado y al ejecutor
        });
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `Error al expulsar el participante: ${error.message}`
      );
    }
  },
};
