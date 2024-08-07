const { sendError, help, sendMessage } = require("../../functions/messages");
const { totoGroupSettings } = require("../../models");
const totoroLog = require("../../functions/totoroLog");
const prefix = require("../../../settings.json").prefix;

module.exports = {
  name: "welcome",
  aliases: [],
  category: "settings",
  subcategory: "setup",
  usage: "<on / off>",
  example: "setwelcome on",
  description: "Activa las bienvenidas en este grupo.",
  onlyAdmin: true,
  onlyGroup: true,

  async execute(totoro, msg, args) {
    try {
      // Verificar si hay mensajes en el objeto msg
      if (!msg.messages || msg.messages.length === 0) {
        throw new Error("No hay mensajes en el objeto msg.");
      }

      const info = msg.messages[0];
      const from = info.key.remoteJid;
      const groupId = from.split("@")[0];
      const mode = args.join(" ").toLowerCase();

      // Si no se proporciona un modo, mostrar la ayuda
      if (!mode) {
        return help(
          totoro,
          msg,
          "welcome",
          "Activa las bienvenidas en este grupo.",
          `${prefix}welcome <on / off>`
        );
      }

      // Buscar configuración del grupo
      let groupConfig = await totoGroupSettings.findOne({
        where: { groupId: groupId },
      });

      // Si no existe, crear una nueva entrada en totoGroupSettings
      if (!groupConfig) {
        groupConfig = await totoGroupSettings.create({
          groupId: groupId,
          welcomeEnabled: false,
        });
      }

      // Activar o desactivar la bienvenida según el modo proporcionado
      if (mode === "on") {
        if (groupConfig.welcomeEnabled) {
          return sendMessage(totoro, msg, "Las bienvenidas ya están activadas");
        } else {
          await totoGroupSettings.update(
            { welcomeEnabled: true },
            { where: { groupId: groupId } }
          );
          return sendMessage(
            totoro,
            msg,
            "Se activaron las bienvenidas para este grupo"
          );
        }
      } else if (mode === "off") {
        if (!groupConfig.welcomeEnabled) {
          return sendMessage(
            totoro,
            msg,
            "Las bienvenidas ya están desactivadas"
          );
        } else {
          await totoGroupSettings.update(
            { welcomeEnabled: false },
            { where: { groupId: groupId } }
          );
          return sendMessage(
            totoro,
            msg,
            "Se desactivaron las bienvenidas para este grupo"
          );
        }
      } else {
        // Si el modo no es ni "on" ni "off", mostrar la ayuda
        return help(
          totoro,
          msg,
          "welcome",
          "Activa las bienvenidas en este grupo.",
          `${prefix}welcome <on / off>`
        );
      }
    } catch (err) {
      // Registrar el error y enviar un mensaje de error
      totoroLog.error(
        "./logs/plugins/setup/welcome.log",
        `Error en ejecutar welcome: ${err.message}`
      );
      sendError(
        totoro,
        msg,
        `Hubo un error al ejecutar el comando: ${err.message}`
      );
    }
  },
};
