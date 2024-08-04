const { help } = require("../../functions/messages");
const totoMantainance = require("../../models/totoMantainance");
const settings = require("../../../settings.json");

let startTime = null; // Variable para almacenar la fecha de inicio del mantenimiento

module.exports = {
  name: "Mantenimiento Totoro",
  category: "developer",
  subcategory: "settings",
  aliases: ["mantainance"],
  usage: `${settings.prefix}mantainance <on|off>`,
  description: "Activa o desactiva el estado de mantenimiento del bot",
  dev: true,

  async execute(totoro, msg, args) {
    msg.react("⌛");

    const participant = msg.messages[0].key.participant.split("@")[0];
    const userWithDomain = `${participant}@s.whatsapp.net`;

    if (!settings.dev.includes(userWithDomain)) {
      msg.react("⚠️");
      msg.reply({
        text: `${userWithDomain}, solo los desarrolladores pueden ejecutar este comando.`,
        mentions: [userWithDomain],
      });
      return;
    }

    if (!args.length) {
      return help(
        totoro,
        msg,
        `Estado de mantenimiento`,
        "Falta el estado de mantenimiento",
        `${settings.prefix}mantainance <on/off>`
      );
    }

    const maintenance = args[0].toLowerCase();

    if (maintenance !== "on" && maintenance !== "off") {
      return msg.reply({
        text: `@${participant}, ${maintenance} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [userWithDomain],
      });
    }

    let currentMaintenance = await totoMantainance.findOne({
      where: { maintenanceId: 1 },
    });

    if (!currentMaintenance) {
      currentMaintenance = await totoMantainance.create({
        maintenanceId: 1,
        status: "off",
      });
    }

    if (maintenance === currentMaintenance.status) {
      msg.react("⚠️");
      msg.reply({
        text: `@${participant}, el estado de mantenimiento ya está en ${maintenance}.`,
        mentions: [userWithDomain],
      });
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    if (maintenance === "on") {
      startTime = now; // Guardamos la fecha de inicio en una variable local

      await totoMantainance.upsert({
        maintenanceId: 1,
        status: maintenance,
      });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro en mantenimiento 」\n` +
          `│  ≡◦ Estado: ${maintenance}\n` +
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

      await totoMantainance.upsert({
        maintenanceId: 1,
        status: maintenance,
      });

      await msg.react("✅");
      msg.reply({
        text:
          `╭─⬣「 Totoro fuera de mantenimiento 」\n` +
          `│  ≡◦ Estado: ${maintenance}\n` +
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
