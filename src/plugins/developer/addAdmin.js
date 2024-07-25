const fs = require("fs");
const path = require("path");
const { sendSuccess, help } = require("../../functions/messages");

module.exports = {
  name: "addAdmin",
  category: "developer",
  subcategory: "owner",
  aliases: ["adminadd"],
  usage: "<admin>",
  description: "Agrega un nuevo admin a settings.json",
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
      let adminValue = "";
      if (quotedUser) {
        adminValue = quotedUser.replace("@s.whatsapp.net", ""); // Elimina la parte "@s.whatsapp.net"
      } else if (quotedMessage) {
        adminValue = quotedMessage.extendedTextMessage?.text || "";
      } else {
        // Si no hay mensaje citado ni participant, usa el primer argumento del comando
        adminValue = args.join(" ");
      }

      // Verifica si el valor es válido
      if (!adminValue.trim()) {
        return help(
          totoro,
          msg,
          "addAdmin",
          "Falta el valor de admin",
          '+addAdmin "<admin>"'
        );
      }

      // Asegúrate de que el valor incluye '@s.whatsapp.net'
      const fullAdminValue = adminValue.endsWith("@s.whatsapp.net")
        ? adminValue
        : `${adminValue}@s.whatsapp.net`;

      const settingsPath = path.join(__dirname, "../../../settings.json");

      // Leemos el contenido actual de settings.json
      const settingsData = await fs.promises.readFile(settingsPath, "utf8");
      const settings = JSON.parse(settingsData);

      // Agregar el nuevo valor a admin
      if (!settings.admin.includes(fullAdminValue)) {
        settings.admin.push(fullAdminValue);
      } else {
        // Notificar si el admin ya está en la lista
        return msg.reply("El admin ya está en la lista.");
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
