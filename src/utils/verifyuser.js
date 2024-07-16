const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");
const { infoRegister, sendError } = require("../functions/messages");
const config = require("../../settings.json");
const dev = config.dev;

async function verifyUser(participant, totoro, msg) {
  try {
    const totoroPrefix = config.prefix;
    const phone = participant.split("@")[0];
    const user = await totoUser.findOne({ where: { phone } });

    if (!user) {
      await infoRegister(
        totoro,
        msg,
        `Por favor, regístrate con el siguiente comando: ${totoroPrefix}reg nombre.edad`
      );

      totoroLog.info(
        "./logs/utils/verifyuser.log",
        `Usuario no registrado: ${phone}`
      );
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error verificando usuario:", error);
    await sendError(
      totoro,
      msg,
      `> Hubo un error al verificar tu registro. Por favor, inténtalo de nuevo más tarde.`
    );

    totoroLog.error(
      "./logs/utils/verifyuser.log",
      `Error verificando usuario: ${error}`
    );
    return null;
  }
}

module.exports = verifyUser;
