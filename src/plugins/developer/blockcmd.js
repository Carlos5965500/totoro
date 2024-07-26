const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");
const settingsPath = path.join(__dirname, "../../../settings.json");

// Verifica si settings.json existe antes de requerirlo
let settings;
try {
  settings = require(settingsPath);
} catch (error) {
  console.error("Error al cargar settings.json:", error);
  settings = { prefix: "!", blockCmd: [] }; // Valores por defecto
}

module.exports = {
  name: "blockCmd",
  category: "developer",
  subcategory: "owner",
  aliases: ["blockcmd", "blockcommand", "bloquearcmd"],
  usage: `${settings.prefix}blockCmd <cmdName>`,
  description: "Bloquea un comando agregándolo a blockCmd en settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    await msg.react("⏳");
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        await msg.react("❌");
        return help(
          totoro,
          msg,
          "blockCmd",
          "Falta el nombre del comando a bloquear",
          `${settings.prefix}blockCmd <cmdName>`
        );
      }

      const cmdName = args[0]; // Obtenemos el nombre del comando del primer argumento

      // Verificamos si blockCmd ya existe, si no, lo creamos
      if (!Array.isArray(settings.blockCmd)) {
        settings.blockCmd = [];
      }

      // Verificamos si el comando ya está bloqueado
      if (settings.blockCmd.includes(cmdName)) {
        await msg.react("❌");
        return msg.reply("El comando ya está bloqueado.");
      }

      // Agregamos el nuevo comando a blockCmd
      settings.blockCmd.push(cmdName);

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      await msg.react("✅");
      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Comando bloqueado correctamente.");
    } catch (error) {
      console.error("Error al actualizar settings.json:", error);
      await msg.react("❌");
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
