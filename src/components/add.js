const { sendError, sendWarning } = require("../functions/messages");

module.exports = {
  id: "add",
  async execute(totoro, msg, args) {
    try {
      if (args.length !== 1) {
        await sendWarning(
          totoro,
          msg,
          "Debes proporcionar un número de teléfono para agregar al usuario. Usa el formato: `add <numero de telefono>`."
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

        // Verificar si el usuario ya está en el grupo
        const userExists = groupInfo.participants.some(
          (p) => p.id === participantId
        );
        if (userExists) {
          await sendWarning(
            totoro,
            msg,
            "El participante ya está en el grupo."
          );
          return;
        }

        // Agregar al usuario al grupo
        await totoro.groupParticipantsUpdate(groupId, [participantId], "add");

        // Obtener el ID del usuario que ejecuta el comando
        const executorId = msg.messages[0].key.participant;

        // Enviar mensaje de bienvenida mencionando al usuario
        await totoro.sendMessage(groupId, {
          text:
            `╭─⬣「 Mensaje de Bienvenida 」⬣\n` +
            `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
            `╰─⬣\n` +
            `> ¡Bienvenido/a @${phoneNumber}! @${executorId.split("@")[0]} te ha agregado al grupo.\n`,
          mentions: [participantId, executorId], // Mencionar al nuevo miembro y al ejecutor
        });
      }
    } catch (error) {
      await sendError(
        totoro,
        msg,
        `Error al agregar el participante: ${error.message}`
      );
    }
  },
};
