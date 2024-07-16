const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "addAdmin",
  category: "developer",
  subcategory: "owner",
  aliases: ["adminadd"],
  usage: "<adminadd>",
  description: "Agrega un nuevo admin a settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "addAdmin",
          "Falta el valor de admin",
          "+addAdmin <admin>"
        );
      }

      let adminValue = args[0]; // Obtenemos el valor de admin del primer argumento

      // Asegúrate de que el valor incluye '@s.whatsapp.net'
      if (!adminValue.endsWith("@s.whatsapp.net")) {
        adminValue += "@s.whatsapp.net";
      }

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Agregar el nuevo valor a admin
      if (!settings.admin.includes(adminValue)) {
        settings.admin.push(adminValue);
      }

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Admin actualizado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
