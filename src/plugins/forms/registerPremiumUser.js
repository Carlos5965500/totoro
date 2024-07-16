const { v4: uuidv4 } = require("uuid");
const {
  sendError,
  sendSuccess,
  help,
  sendPrem,
} = require("../../functions/messages");
const { totoUser, totoPremium } = require("../../models");

module.exports = {
  name: "registerPremium",
  category: "user",
  description: "Registra un usuario premium",
  usage: "premium <serial>",
  aliases: ["premium"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;
      const [serial] = args;

      if (!serial) {
        await help(
          totoro,
          msg,
          "Registro de Usuario Premium",
          "Ingresa tu número serial",
          "+regPremium <serial>"
        );
        await msg.react("❓");
        return;
      }

      const telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      if (!/^\d+$/.test(phone)) {
        await sendError(
          totoro,
          msg,
          `Número de teléfono ${phone} no es válido.`
        );
        return;
      }

      const user = await totoUser.findOne({ where: { phone } });

      if (!user) {
        await sendError(
          totoro,
          msg,
          `Usuario con teléfono ${phone} no encontrado.`
        );
        return;
      } else {
        await totoUser.update({ premium: true }, { where: { phone } });

        const premiumRecord = await totoPremium.findOne({
          where: { totoUserId: user.id },
        });

        if (!premiumRecord) {
          await totoPremium.create({
            totoUserId: user.id,
            serialNumber: serial,
          });
        }

        await sendPrem(
          totoro,
          remoteJid,
          user.name,
          user.age,
          user.phone,
          user.country,
          serial,
          await totoUser.count({ where: { premium: true } })
        );
      }

      await msg.react("✅");
    } catch (error) {
      console.error("Error al registrar el usuario premium:", error);
      await sendError(totoro, msg, "Error al registrar el usuario premium.");
    }
  },
};
