const totoUser = require("../models/totoUser");
const totoroLog = require("../functions/totoroLog");

async function registerTotoUser(phone, nombre, edad, serialNumber, country) {
  try {
    const user = new totoUser({
      phone: phone,
      name: nombre,
      age: edad,
      serialNumber: serialNumber,
      country: country,
      regTime: new Date(),
    });
    await user.save();
    return user;
  } catch (error) {
    totoroLog.error(
      './logs/plugins/register/register.js',
      `Error al registrar usuario: ${error}`
    );
  }
}

module.exports = registerTotoUser;