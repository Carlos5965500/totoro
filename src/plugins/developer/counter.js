// commands/activateTotoCounter.js

const { help, sendWarning } = require("../../functions/messages");
const ActivateTotoCounter = require("../../models/activateTotoCounter");
const settings = require("../../../settings.json");

module.exports = {
  name: "activateTotoCounter",
  category: "developer",
  subcategory: "settings",
  aliases: ["counter"],
  usage: `${settings.prefix}counter <on|off>`,
  description: "Activa o desactiva el contador del bot de manera global",
  dev: true,

  async execute(totoro, msg, args) {
    // Obtener el número de teléfono del participante
    const participant = msg.messages[0].key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    // Verificación de si el participante es un desarrollador autorizado
    if (!settings.dev.includes(userWithDomain)) {
      await msg.react("⚠️");
      return msg.reply({
        text: `${userWithDomain}, solo los desarrolladores pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
    }

    // Verificar si se ha proporcionado el argumento necesario
    if (!args.length) {
      return help(
        totoro,
        msg,
        `Activar Contador Totoro`,
        "Falta el estado de activación",
        `${settings.prefix}counter <on/off>`
      );
    }
    await msg.react("⌛");
    const status = args[0].toLowerCase();
    if (status !== "on" && status !== "off") {
      return msg.reply({
        text: `@${participant}, ${status} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [participant],
      });
    }

    let currentStatus = await ActivateTotoCounter.findOne({
      where: { counterId: 1 },
    });

    if (!currentStatus) {
      currentStatus = await ActivateTotoCounter.create({
        counterId: 1,
        status: "off",
      });
    }

    if (status === currentStatus.status) {
      await msg.react("⚠️");
      return sendWarning(
        totoro,
        msg,
        `El contador ya está ${status === "on" ? "activado" : "desactivado"}`
      );
    }

    await currentStatus.update({ status });

    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    await msg.react("✅");
    msg.reply({
      text:
        `╭─⬣「 Counter Totoro 」\n` +
        `│  ≡◦ Estado: ${status}\n` +
        `│  ≡◦ Acción: ${status === "on" ? "activado" : "desactivado"}\n` +
        `│  ≡◦ Moderador: @${participant}\n` +
        `│  ≡◦ Fecha: ${date}\n` +
        `│  ≡◦ Hora: ${time}\n` +
        `╰──────────────`,
      mentions: [userWithDomain],
    });
  },
};
