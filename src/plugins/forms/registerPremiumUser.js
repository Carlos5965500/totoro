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
  usage: "registerPremium <nombre>.<edad>",
  aliases: ["regprem", "regpremium", "regp"],

  async execute(totoro, msg, args) {
    try {
      const remoteJid = msg.messages[0].key.remoteJid;
      const participant = msg.messages[0].key.participant;

      const [nombre, edad] = args.join(" ").split(".");
      if (!nombre || !edad || isNaN(edad)) {
        await help(
          totoro,
          msg,
          "Registro de Usuario Premium",
          "Ingresa tu nombre y edad",
          "+regPremium Nia.22"
        );
        await msg.react("❓");
        return;
      }

      // Validación de edad
      const edadInt = parseInt(edad, 10);
      if (edadInt < 12 || edadInt > 40) {
        await sendError(
          totoro,
          msg,
          `No puede registrarse como usuario premium con ${edadInt} años.`
        );
        return;
      }

      const telf = participant || remoteJid;
      const phone = telf.split("@")[0];

      // Validación del formato del número de teléfono
      if (!/^\d+$/.test(phone)) {
        await sendError(
          totoro,
          msg,
          `Número de teléfono ${phone} no es válido.`
        );
        return;
      }

      try {
        const user = await totoUser.findOne({ where: { phone } });

        if (!user) {
          // Si el usuario no existe, crear un nuevo usuario y marcarlo como premium
          const newUser = await totoUser.create({
            phone,
            name: nombre,
            age: edadInt,
            premium: true, // Marcar como premium directamente al crear el usuario
            registered: true,
          });

          // Crear un registro en la tabla totoPremium
          const premiumRecord = await totoPremium.create({
            totoUserId: newUser.id,
            serialNumber: uuidv4(), // Generar la UUID
          });

          await sendPrem(
            totoro,
            remoteJid,
            phone,
            nombre,
            edadInt,
            premiumRecord.serialNumber,
            await totoUser.count({ where: { premium: true } }) // Cuenta de usuarios premium
          );

          await sendSuccess(
            totoro,
            msg,
            `Usuario premium ${nombre} registrado con éxito.`
          );
        } else {
          // Si el usuario ya existe, actualizar su estado a premium
          await totoUser.update({ premium: true }, { where: { phone } });

          // Verificar si el usuario ya tiene un registro en totoPremium
          const premiumRecord = await totoPremium.findOne({
            where: { totoUserId: user.id },
          });
          if (!premiumRecord) {
            // Crear un registro en la tabla totoPremium
            const newPremiumRecord = await totoPremium.create({
              totoUserId: user.id,
              serialNumber: uuidv4(), // Generar la UUID
            });

            await sendPrem(
              totoro,
              remoteJid,
              phone,
              nombre,
              edadInt,
              newPremiumRecord.serialNumber,
              await totoUser.count({ where: { premium: true } }) // Cuenta de usuarios premium
            );
          }
        }
        await msg.react("✅");
      } catch (error) {
        console.error("Error al registrar el usuario premium:", error);
        await sendError(totoro, msg, "Error al registrar el usuario premium.");
      }
    } catch (error) {
      console.error("Error al procesar el comando:", error);
      await sendError(totoro, msg, "Error al procesar el comando.");
    }
  },
};
