const totoUsers = require("../../models/totoUser");
const totoCommands = require("../../models/totoCommands");
const { Sequelize } = require("sequelize");
const { devs } = require("../../../settings.json");
const { sendError } = require("../../functions/messages");

// Definir asociaciones
totoUsers.hasMany(totoCommands, { foreignKey: "userId" });
totoCommands.belongsTo(totoUsers, { foreignKey: "userId" });

module.exports = {
  name: "botinfo",
  description: "Obtener información del bot.",
  category: "information",
  subcategory: "help",
  usage: "botinfo",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  aliases: ["toinfo", "infobot", "info", "totoro"],

  async execute(msg, totoro) {
    try {
      // Contar el total de usuarios
      const totalUsers = await totoUsers.count();
      console.log("Total Users:", totalUsers); // Debugging

      // Contar el total de usuarios premium
      const premiumUsers = await totoUsers.count({
        where: {
          premium: true,
        },
      });
      console.log("Premium Users:", premiumUsers); // Debugging

      // Contar el total de comandos, excluyendo los de devs
      const totalCommands = await totoCommands.count({
        where: {
          userId: {
            [Sequelize.Op.notIn]: devs,
          },
        },
      });
      console.log("Total Commands:", totalCommands); // Debugging

      // Crear el mensaje
      let txt = `╭─⬣「 * Totoro Info * 」\n`;
      txt += `│  ≡◦ *👥 Total Usuarios ∙* ${totalUsers}\n`;
      txt += `│  ≡◦ *🌟 Usuarios Premium ∙* ${premiumUsers}\n`;
      txt += `│  ≡◦ *📝 Total Comandos Ejecutados ∙* ${totalCommands}\n`;
      txt += `╰─⬣`;

      // Enviar mensaje de respuesta
      await msg.reply(txt);
    } catch (error) {
      console.error("Error Details:", error); // Debugging
      sendError(totoro, msg, error);
    }
  },
};
