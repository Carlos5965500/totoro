const { help } = require("../../functions/messages");
const totoBlock = require("../../models/totoBlock");
const settings = require("../../../settings.json");

module.exports = {
  name: "Bloquear Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["block"],
  usage: `${settings.prefix}block <on|off>`,
  description: "Bloquea o desbloquea el bot",
  dev: true,

  async execute(totoro, msg, args) {
    const message = msg.messages[0];

    if (!message.key || !message.key.remoteJid) {
      console.error(
        "message.key o message.key.remoteJid no están definidos:",
        message
      );
      return msg.reply("Error: No se pudo obtener la información del grupo.");
    }

    if (!message.key.remoteJid.endsWith("@g.us")) {
      return msg.reply("Este comando solo puede ser utilizado en grupos.");
    }

    msg.react("⌛");

    if (!message.key.participant) {
      console.error("message.key.participant no está definido:", message.key);
      return msg.reply(
        "Error: No se pudo obtener la información del participante."
      );
    }

    const participant = message.key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    const groupMetadata = await totoro.groupMetadata(message.key.remoteJid);
    if (!groupMetadata) {
      console.error(
        "No se pudo obtener los metadatos del grupo para:",
        message.key.remoteJid
      );
      return msg.reply("Error: No se pudo obtener los metadatos del grupo.");
    }

    const groupId = groupMetadata.id;
    const groupName = groupMetadata.subject;

    const groupAdmins = groupMetadata.participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);

    if (
      !settings.dev.includes(userWithDomain) &&
      !groupAdmins.includes(message.key.participant)
    ) {
      msg.react("⚠️");
      return msg.reply({
        text: `${userWithDomain}, solo los desarrolladores y administradores del grupo pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Bloquear Totoro en el grupo`,
        "Falta el estado de bloqueo",
        `${settings.prefix}block <on/off>`
      );
    }

    const block = args[0].toLowerCase();
    if (block !== "on" && block !== "off") {
      return msg.reply({
        text: `@${participant}, ${block} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    let currentBlock = await totoBlock.findOne({
      where: { groupId: groupId },
    });

    if (!currentBlock) {
      currentBlock = await totoBlock.create({
        groupId: groupId,
        groupName: groupName, // Proporcionar el nombre del grupo
        blockId: 1,
        status: "off",
      });
    }

    if (block === currentBlock.status) {
      msg.react("⚠️");
      return msg.reply({
        text: `@${participant}, el estado de bloqueo ya está en ${block} para este grupo.`,
        mentions: [userWithDomain],
      });
    }

    await totoBlock.upsert({
      groupId: groupId,
      groupName: groupName, // Proporcionar el nombre del grupo
      blockId: 1,
      status: block,
    });

    const action = block === "on" ? "bloqueado" : "desbloqueado";
    const time = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
    });

    await msg.react("✅");

    msg.reply({
      text:
        `╭─⬣「 Totoro bloqueado 」\n` +
        `│  ≡◦ Estado: ${block}\n` +
        `│  ≡◦ Acción: ${action}\n` +
        `│  ≡◦ Moderador: @${participant}\n` +
        `│  ≡◦ Grupo: ${groupMetadata.subject}\n` +
        `│  ≡◦ Fecha: ${time}\n` +
        `╰──────────────`,
      mentions: [userWithDomain],
    });
  },
};
