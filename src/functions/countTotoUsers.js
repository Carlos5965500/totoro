const totoUser = require("../models/totoUser");

async function countTotoUsers() {
  try {
    const count = await totoUser.count();
    return count;
  } catch (error) {
    console.error("Error al contar usuarios registrados:", error);
    throw error;
  }
}

module.exports = countTotoUsers;
