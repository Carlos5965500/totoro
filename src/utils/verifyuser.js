const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");
const { sendError } = require("../functions/messages");

async function verifyUser(participant) {
  if (!totoUser) {
    totoroLog.error(
      "./logs/verifyUser.log",
      "La base de datos de usuarios no está definida."
    );
    sendError(
      totoro,
      msg,
      "No se pudo verificar tu usuario. Por favor, intenta de nuevo más tarde."
    );
  }

  const phone = participant.split("@")[0];

  const user = await totoUser.findOne({ where: { phone: phone } });
  if (!user) {
    totoroLog.warn(
      "./logs/verifyUser.log",
      "Usuario no encontrado en la base de datos."
    );
    sendError(
      totoro,
      msg,
      "No estás registrado. Por favor, regístrate antes de usar este comando."
    );
  }

  if (!user.registered) {
    totoroLog.warn("./logs/verifyUser.log", "Usuario no está registrado.");
    sendError(
      totoro,
      msg,
      "No estás registrado. Por favor, regístrate antes de usar este comando."
    );
  }

  if (!user.premium) {
    totoroLog.warn("./logs/verifyUser.log", "Usuario no es premium.");
    sendError(
      totoro,
      msg,
      "No tienes acceso a esta función. Por favor, adquiere una suscripción premium para usarla."
    );
  }

  return user;
}

module.exports = verifyUser;
