const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "removeDev",
  category: "developer",
  subcategory: "owner",
  aliases: ["devdelete", "devremove", "devdel", "rdev"],
  usage: "<dev>",
  description: "Elimina un dev de settings.json",
  dev: true,

  async execute(totoro, msg, args) {
    try {
      // Extrae la información del contexto para obtener el teléfono del participante
      const quotedUser =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.participant ||
        "";

      // Si hay un mensaje citado, también podemos usar el texto del mensaje
      const quotedMessage =
        msg.messages[0].message.extendedTextMessage?.contextInfo?.quotedMessage;

      // Usa el número de teléfono del participant citado si está presente
      let devValue = "";
      if (quotedUser) {
        devValue = quotedUser.replace("@s.whatsapp.net", ""); // Elimina la parte "@s.whatsapp.net"
      } else if (quotedMessage) {
        devValue = quotedMessage.extendedTextMessage?.text || "";
      } else {
        // Si no hay mensaje citado ni participant, usa el primer argumento del comando
        devValue = args.join(" ");
      }

      // Verifica si el valor es válido
      if (!devValue.trim()) {
        return help(
          totoro,
          msg,
          "removeDev",
          "Falta el valor de dev",
          '+removeDev "<dev>"'
        );
      }

      // Asegúrate de que el valor incluye '@s.whatsapp.net'
      const fullDevValue = `${devValue.trim()}@s.whatsapp.net`;

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Depuración: muestra los valores en settings.json
      console.log(`Valores en settings.json: ${JSON.stringify(settings.dev)}`);

      // Filtramos el nuevo array de devs para eliminar el valor
      const newDevArray = settings.dev.filter((dev) => dev !== fullDevValue);

      // Si el array no ha cambiado, notificamos al usuario
      if (settings.dev.length === newDevArray.length) {
        return msg.reply("El dev especificado no se encuentra en la lista.");
      }

      // Actualizamos el array de devs en settings.json
      settings.dev = newDevArray;

      // Escribimos los cambios de vuelta en settings.json
      await fs.promises.writeFile(
        settingsPath,
        JSON.stringify(settings, null, 2)
      );

      // Notificamos al usuario que la operación fue exitosa
      sendSuccess(totoro, msg, "Dev eliminado correctamente.");
    } catch (error) {
      console.error(error);
      msg.reply("Hubo un error al intentar actualizar settings.json.");
    }
  },
};
