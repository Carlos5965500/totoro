const { sendWarning, help, sendError } = require("../../functions/messages");

module.exports = {
  name: "add",
  description: "Agrega a un usuario al grupo.",
  category: "moderator",
  subcategory: "admin",
  usage: `add <usuario>`,
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

        const quotedUser =
          msg.messages[0].message.extendedTextMessage.contextInfo.participant;

        if (!quotedUser) {
          await help(
            totoro,
            msg,
            "Agregar Usuario",
            "No se pudo determinar el usuario a agregar. Asegúrate de citar el mensaje correctamente.",
            "add <usuario>"
          );
          return;
        }

        await totoro.groupParticipantsUpdate(group, [quotedUser], "add");

        // Enviar mensaje de expulsión interactivo
        const message = {
          interactiveMessage: {
            header: {
              hasMediaAttachment: false,
            },
            body: {
              text:
                `╭─⬣「 Mensaje de Bienvenida 」⬣\n` +
                `│  ≡◦ 🍭 Bienvenido/a al grupo ${groupName}\n` +
                `╰─⬣\n` +
                `>  ¡Bienvenido/a @${quotedUser.split("@")[0]}! @${sender.split("@")[0]} te ha agregado al grupo.\n`,
              mentions: [quotedUser, sender],
            },
            footer: { text: "Agregado por Totoro" },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: `Expulsar Usuario`,
                    id: `kick+${quotedUser.split("@")[0]}`,
                  }),
                },
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: `Ver Política del Grupo`,
                    url: "https://example.com/group-policy", // Reemplaza con la URL de la política del grupo
                  }),
                },
              ],
              messageParamsJson: "",
            },
          },
          mentions: [quotedUser, sender],
        };

        try {
          await totoro.relayMessage(
            group,
            { viewOnceMessage: { message } },
            { quoted: msg.messages[0] }
          );
        } catch (relayError) {
          console.error("Error al enviar el mensaje interactivo:", relayError);
          return sendWarning(
            totoro,
            msg,
            `Error al enviar el mensaje interactivo.`
          );
        }
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
        `No se pudo agregar al participante: ${error.message}`
      );
    }
  },
};
