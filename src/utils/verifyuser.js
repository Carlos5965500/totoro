const totoroLog = require("../functions/totoroLog");
const totoUser = require("../models/totoUser");

async function verifyUser(serialNumber) {
  if (!serialNumber) {
    totoroLog.error(
      `./logs/utils/verifyuser.log`,
      "No se proporcionó un número de serie."
    );
    return {
      registered: false,
      message: "⚠️ El número de serie proporcionado no es válido.",
    };
  }

  try {
    const user = await totoUser.findOne({
      where: { serialNumber: serialNumber },
    });

    if (!user) {
      return {
        registered: false,
        message:
          "⚠️ No estás registrado. Por favor, regístrate para usar este comando.",
      };
    }

    if (!user.registered) {
      return {
        registered: false,
        message:
          "⚠️ No estás registrado. Por favor, completa tu registro para usar este comando.",
      };
    }

    return { registered: true, user: user };
  } catch (error) {
    console.error(error);
    return {
      registered: false,
      message:
        "⚠️ Ocurrió un error al verificar tu registro. Por favor, inténtalo de nuevo más tarde.",
    };
  }
}

module.exports = verifyUser;
