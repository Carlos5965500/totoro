const { help, sendWarning } = require("../../functions/messages");
const ActivateTotoCounter = require("../../models/activateTotoCounter");
const TotoCounter = require("../../models/totoCounter");
const settings = require("../../../settings.json");
const totoroLog = require("../../functions/totoroLog");

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
      if (typeof msg.react === "function") {
        await msg.react("⚠️");
      }
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
    if (typeof msg.react === "function") {
      await msg.react("⌛");
    }

    const status = args[0].toLowerCase();
    if (status !== "on" && status !== "off") {
      return msg.reply({
        text: `@${participant}, ${status} no es un estado válido. Debe ser 'on' o 'off'.`,
        mentions: [participant],
      });
    }

    // Obtener el estado actual del contador
    let currentStatus = await ActivateTotoCounter.findOne({
      where: { counterId: 1 },
    });

    // Si no existe un estado actual, crearlo con estado "off" por defecto
    if (!currentStatus) {
      currentStatus = await ActivateTotoCounter.create({
        counterId: 1,
        status: "off",
      });
    }

    // Verificar si el estado solicitado ya está establecido
    if (status === currentStatus.status) {
      if (typeof msg.react === "function") {
        await msg.react("⚠️");
      }
      return sendWarning(
        totoro,
        msg,
        `El contador ya está ${status === "on" ? "activado" : "desactivado"}`
      );
    }

    // Actualizar el estado del contador
    await currentStatus.update({ status });

    if (status === "on") {
      // Obtener el ID del usuario desde el número de teléfono
      const totoUserId = await getUserIdFromPhoneNumber(participant);

      // Si el contador se activa, agregar o incrementar el registro del usuario y plugin en totoCounters
      const [counter, created] = await TotoCounter.findOrCreate({
        where: { totoUserId, pluginName: "activateTotoCounter" },
        defaults: {
          counterId: 1, // Siempre establecer counterId en 1
          count: 0,
        },
      });

      if (created) {
        totoroLog.info(
          "./logs/functions/totoCounter.log",
          `Nuevo contador creado para el comando 'activateTotoCounter' y el usuario con ID ${totoUserId}.`
        );
      }

      counter.count += 1;
      await counter.save();

      totoroLog.info(
        "./logs/functions/totoCounter.log",
        `Contador incrementado para el comando 'activateTotoCounter' y el usuario con ID ${totoUserId}. Nuevo valor: ${counter.count}`
      );
    } else {
      // Si el contador se desactiva, no realizar ninguna acción adicional
      totoroLog.info(
        "./logs/functions/totoCounter.log",
        `El contador se ha desactivado para el comando 'activateTotoCounter' y el usuario con ID ${participant}.`
      );
    }

    // Obtener la fecha y hora actual en la zona horaria de Madrid
    const now = new Date();
    const date = now.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
    const time = now.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" });

    // Enviar confirmación al usuario
    if (typeof msg.react === "function") {
      await msg.react("✅");
    }
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
