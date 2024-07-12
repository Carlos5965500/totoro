module.exports = {
  name: "demote",
  category: "moderator",
  subcategory: "admin",
  description: "Degrada a un usuario a miembro regular.",
  usage: `demote <@usuario>`,
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES", "SEND_VIDEO"],
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
          text: "No tienes permisos para ejecutar este comando. Solo los administradores pueden usar este comando.",
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
            text: "Totoro necesita saber a quién degradar",
          });
          return;
        }

        const mentioned =
          msg.messages[0].message.extendedTextMessage.contextInfo
            .mentionedJid[0];

        if (!mentioned) {
          await totoro.sendMessage(group, {
            text: "Totoro necesita saber a quién degradar.",
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

        if (!isUserAdmin) {
          await totoro.sendMessage(group, {
            text: "Totoro no puede degradar a un usuario que no es administrador.",
          });
        } else {
          try {
            await totoro.groupParticipantsUpdate(group, [mentioned], "demote");
            
            await totoro.sendMessage(group, {
              video: {
                url: "https://media.tenor.com/H4oO6lqStHYAAAPo/mushoku-tensei-anime.mp4",
              },
              caption: `@${mentioned.split("@")[0]}  Has sido degradado.`,
              mentions: [mentioned],
            });
          } catch (updateError) {
            if (updateError.data === 403) {
              await totoro.sendMessage(group, {
                text: "Totoro no tiene permisos para degradar a este usuario.",
              });
            } else {
              await totoro.sendMessage(group, {
                text: `Totoro no pudo degradar a este usuario. Error: ${updateError.message}`,
              });
            }
          }
        }
      } else {
        await totoro.sendMessage(msg.messages[0].key.remoteJid, {
          text: "Totoro solo puede degradar a un usuario en un grupo.",
        });
      }
    } catch (error) {
      console.error(error);
      await totoro.sendMessage(msg.messages[0].key.remoteJid, {
        text: `Totoro está cansado y no pudo degradar a este usuario. Error: ${error.message}`,
      });
    }
  },
};
