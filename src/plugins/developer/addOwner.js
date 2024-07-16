const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "addDev",
  category: "developer",
  subcategory: "owner",
  aliases: ["devadd"],
  usage: "<dev>",
  description: "Agrega un nuevo dev a settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "addDev",
          "Falta el valor de dev",
          "+addDev <dev>"
        );
      }

      let devValue = args[0]; // Obtenemos el valor de dev del primer argumento

      // Asegúrate de que el valor incluye '@s.whatsapp.net'
      if (!devValue.endsWith("@s.whatsapp.net")) {
        devValue += "@s.whatsapp.net";
      }

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Agregar el nuevo valor a dev
      if (!settings.dev.includes(devValue)) {
        settings.dev.push(devValue);
      }

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Dev actualizado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
