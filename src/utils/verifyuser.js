const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");
async function verifyUser(participant) {
  if (!totoUser) {
    totoroLog.error(
      "./logs/verifyUser.log",
      "La base de datos de usuarios no está definida."
    );
    throw new Error("La base de datos de usuarios no está definida.");
  }

  const phone = participant.split("@")[0];
  totoroLog.info(
    "./logs/verifyUser.log",
    `Buscando usuario con phone: ${phone}`
  );

  const user = await totoUser.findOne({ where: { phone: phone } });
  if (!user) {
    totoroLog.warn(
      "./logs/verifyUser.log",
      "Usuario no encontrado en la base de datos."
    );
    throw new Error(
      "No estás registrado. Por favor, regístrate antes de usar este comando."
    );
  }

  return user;
}

module.exports = verifyUser;
