const TotoDB = require("../libs/db/totoDB");
const totoUser = require("../models/totoUser");

class totoDBSync {
  constructor() {
    this.tDB = new TotoDB();
    this.totoUser = totoUser;
  }

  async sync() {
    let syncMessage = `
▣───────────────────────────────────────────────···
│ Base de datos: ${this.tDB.sequelize.getDatabaseName()}
│───────────────────────────────────────────────···
│ ⏰  ${new Date().toLocaleString("es-ES", { timeZone: "America/Argentina/Buenos_Aires" })}`;

    try {
      await this.tDB.sequelize.authenticate();
      syncMessage += `
│ 🚀  Conexión exitosa a la base de datos: ${this.tDB.sequelize.getDatabaseName()}`;
      
      await this.totoUser.sync();
      syncMessage += `
│ 🔄  Tabla sincronizada: ${this.totoUser.getTableName()}`;

      await this.tDB.sequelize.sync({ force: false });
      syncMessage += `
│ ✅  Sincronización completada con éxito`;
    } catch (error) {
      syncMessage += `
│ ❌  Error durante la sincronización: ${error.message}`;
    } finally {
      syncMessage += `
▣───────────────────────────────────────────────···
`;
      await this.tDB.sequelize.close();
      console.log(syncMessage);
    }
  }
}

module.exports = totoDBSync;
