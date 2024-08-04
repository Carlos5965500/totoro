const { help, sendWarning } = require("../../functions/messages");
const totoStatus = require("../../models/totoStatus");
const settings = require("../../../settings.json");

let startTime = null; // Variable para almacenar la fecha de inicio del estado

module.exports = {
  name: "Status Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["activate"],
  usage: `${settings.prefix}activate <on|off>`,
  description: "Activa o desactiva el bot",
  dev: true,

  async execute(totoro, msg, args) {
    // Reaccionar al comando
    await msg.react("⌛");

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
        `Activar Totoro`,
        "Falta el estado de activación",
        `${settings.prefix}activate <on/off>`
      );
    }

    const status = args[0].toLowerCase();
    if (status !== "on" && status !== "off") {
      return msg.reply({
        text: `@${participant}, ${status} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [participant],
      });
    }

    let currentStatus = await totoStatus.findOne({
      where: { statusId: 1 },
    });

    if (!currentStatus) {
      currentStatus = await totoStatus.create({
        statusId: 1,
        status: "off",
      });
    }

    if (status === currentStatus.status) {
      await msg.react("⚠️");
      return sendWarning(
        totoro,
        msg,
        `El bot ya está ${status === "on" ? "activado" : "desactivado"}`
      );
    }

    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    if (status === "on") {
      startTime = now; // Guardamos la fecha de inicio en una variable local

      await currentStatus.update({ status });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Status Totoro 」\n` +
          `│  ≡◦ Estado: ${status}\n` +
          `│  ≡◦ Acción: activado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Fecha de inicio: ${date}\n` +
          `│  ≡◦ Hora de inicio: ${time}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    } else {
      const endTime = now;
      const durationMs = endTime - startTime;

      // Calcular horas, minutos y segundos
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);

      // Formatear la duración en hh:mm:ss
      const duration = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      startTime = null; // Reiniciamos la variable de fecha de inicio

      await currentStatus.update({ status });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Status Totoro 」\n` +
          `│  ≡◦ Estado: ${status}\n` +
          `│  ≡◦ Acción: desactivado\n` +
          `│  ≡◦ Moderador: @${participant}\n` +
          `│  ≡◦ Fecha de finalización: ${date}\n` +
          `│  ≡◦ Hora de finalización: ${time}\n` +
          `│  ≡◦ Duración: ${duration}\n` +
          `╰──────────────`,
        mentions: [userWithDomain],
      });
    }
  },
};
