const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "removeAdmin",
  category: "developer",
  subcategory: "owner",
  aliases: ["adminremove"],
  usage: "adminremove <numero del admin>",
  description: "Elimina un admin de settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Verifica si se proporcionó un argumento
      if (!args.length) {
        return help(
          totoro,
          msg,
          "removeAdmin",
          "Falta el valor de admin",
          "+removeAdmin <admin>"
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

      // Eliminar el valor de admin
      const index = settings.admin.indexOf(adminValue);
      if (index !== -1) {
        settings.admin.splice(index, 1);
      } else {
        return msg.reply(
          "El valor especificado no existe en la lista de admin."
        );
      }

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Admin eliminado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
