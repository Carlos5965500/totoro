const { Sequelize } = require("sequelize");
const { totoUser, totoPlugin, totoDev, totoCounter } = require("../../models");
const { sendError } = require("../../functions/messages");
const totoroLog = require("../../functions/totoroLog");

module.exports = {
  name: "botinfo",
  description: "Obtener información del bot.",
  category: "general",
  subcategory: "help",
  usage: "botinfo",
  cooldown: 5,
  botPermissions: ["SEND_MESSAGES"],
  userPermissions: [],
  aliases: ["toinfo", "infobot", "info", "totoro"],
  dev: false,
  blockcmd: true,
  async execute(totoro, msg, args) {
    try {
      console.log("Executing botinfo command");

      // Obtener teléfonos de desarrolladores
      const devUsers = await totoDev.findAll({ attributes: ["phone"] });
      const devPhones = devUsers.map((dev) =>
        dev.phone.replace("@s.whatsapp.net", "")
      );

      // Obtener IDs de usuarios desarrolladores
      const devUserRecords = await totoUser.findAll({
        attributes: ["id"],
        where: {
          phone: {
            [Sequelize.Op.in]: devPhones,
          },
        },
      });
      const devUserIds = devUserRecords.map((user) => user.id);

      // Contar el total de usuarios excluyendo desarrolladores
      const totalUsers = await totoUser.count({
        where: {
          id: {
            [Sequelize.Op.notIn]: devUserIds,
          },
        },
      });
      console.log("Total Users:", totalUsers);

      // Contar el total de usuarios premium excluyendo desarrolladores
      const premiumUsers = await totoUser.count({
        where: {
          id: {
            [Sequelize.Op.notIn]: devUserIds,
          },
          premium: true,
        },
      });

      // Contar el total de plugins
      const totalPlugins = await totoPlugin.count();

      const pluginRecords = await totoCounter.findAll();
      const plugins = pluginRecords.map((record) =>
        record.pluginName.toLowerCase()
      );

      let totalPluginsExec = 0;
      const count = await totoCounter.findAll();
      count.forEach((user) => {
        if (plugins.includes(user.pluginName.toLowerCase())) {
          totalPluginsExec += user.count;
        }
      });

      // Crear el mensaje
      let txt = `╭─⬣「 *Totoro Info* 」\n`;
      txt += `│  ≡◦ *🔌 Plugins Totales ∙* ${totalPlugins}\n`;
      txt += `│  ≡◦ *👥 Total Usuarios ∙* ${totalUsers}\n`;
      txt += `│  ≡◦ *🌟 Usuarios Premium ∙* ${premiumUsers}\n`;
      txt += `│  ≡◦ *🧩 Plugin Ejecutados∙* ${totalPluginsExec}\n`;
      txt += `╰─⬣`;

      // Enviar mensaje de respuesta como reply
      const info = msg.messages[0];
      const remoteJid = info.key.remoteJid;
      await totoro.sendMessage(remoteJid, { text: txt }, { quoted: info });
    } catch (error) {
      totoroLog.error(
        "./logs/plugins/information/botinfo.log",
        `Error en botinfo: ${error}`
      );
      sendError(totoro, msg, error);
    }
  },
};
