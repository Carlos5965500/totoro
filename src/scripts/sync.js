const TotoDB = require("../libs/db/totoDB");
const totoUser = require("../models/totoUser");
const totoPremium = require("../models/totoPremium");
const totoCommands = require("../models/totoCommands");
const Blacklist = require("../models/totoBlackList");
const Whitelist = require("../models/totoWhiteList"); 
const { Sequelize } = require("sequelize");
const totoroLog = require("../functions/totoroLog");

class totoDBSync {
  constructor() {
    this.tDB = new TotoDB();

    // Definir la base de datos de respaldo SQLite
    this.backupDB = new Sequelize({
      dialect: "sqlite",
      storage: process.env.BACKUP_STORAGE_PATH || "./database/totoDB.sqlite",
      logging: process.env.BACKUP_LOGGING === "true" ? console.log : false,
    });

    // Definir los modelos en la base de datos de respaldo
    this.backupTotoUser = this.backupDB.define(
      "totoUser",
      totoUser.rawAttributes,
      totoUser.options
    );
    this.backupTotoPremium = this.backupDB.define(
      "totoPremium",
      totoPremium.rawAttributes,
      totoPremium.options
    );
    this.backupTotoCommands = this.backupDB.define(
      "totoCommands",
      totoCommands.rawAttributes,
      totoCommands.options
    );
    this.backupBlacklist = this.backupDB.define(
      "Blacklist",
      Blacklist.rawAttributes,
      Blacklist.options
    );
    this.backupWhitelist = this.backupDB.define(
      "Whitelist",
      Whitelist.rawAttributes,
      Whitelist.options
    );
  }

  async sync() {
    let syncMessage = `
▣─────────────────────────────────────────────────────────────────···
│ Base de datos: ${this.tDB.sequelize.getDatabaseName()}
│─────────────────────────────────────────────────────────────────···
│ ⏰  ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`;

    try {
      await this.tDB.sequelize.authenticate();
      syncMessage += `
│ 🚀  Conexión exitosa a la base de datos principal: ${this.tDB.sequelize.getDatabaseName()}`;

      await Promise.all([
        totoUser.sync({ force: false }),
        totoPremium.sync({ force: false }),
        totoCommands.sync({ force: false }),
        Blacklist.sync({ force: false }),
        Whitelist.sync({ force: false }),
      ]);
      syncMessage += `
│ 🔄  Tablas sincronizadas: ${totoUser.getTableName()}, ${totoPremium.getTableName()}, ${totoCommands.getTableName()}, ${Blacklist.getTableName()}, ${Whitelist.getTableName()}`;

      await this.tDB.sequelize.sync({ force: false });
      syncMessage += `
│ ✅  Sincronización completada con éxito en la base de datos principal`;
      totoroLog.info(
        "./logs/scripts/sync.log",
        "Sincronización completada con éxito en la base de datos principal"
      );
    } catch (error) {
      syncMessage += `
│ ⚠️   No conectado a ${this.tDB.sequelize.getDatabaseName()}, usando totoDB.sqlite como respaldo.`;
      totoroLog.error(
        "./logs/scripts/sync.log",
        `Error en la conexión a la base de datos principal: ${error.message}`
      );

      try {
        await this.backupDB.authenticate();
        syncMessage += `
│ 🚀  Conexión exitosa a la base de datos de respaldo: ${this.backupDB.options.storage}`;

        await Promise.all([
          this.backupTotoUser.sync({ force: false }),
          this.backupTotoPremium.sync({ force: false }),
          this.backupTotoCommands.sync({ force: false }),
          this.backupBlacklist.sync({ force: false }),
          this.backupWhitelist.sync({ force: false }),
        ]);
        syncMessage += `
│ 🔄  Tablas sincronizadas: ${this.backupTotoUser.getTableName()}, ${this.backupTotoPremium.getTableName()}, ${this.backupTotoCommands.getTableName()}, ${this.backupBlacklist.getTableName()}, ${this.backupWhitelist.getTableName()}`;

        await this.backupDB.sync({ force: false });
        syncMessage += `
│ ✅  Sincronización completada con éxito en la base de datos de respaldo`;
        totoroLog.info(
          "./logs/scripts/sync.log",
          "Sincronización completada con éxito en la base de datos de respaldo"
        );
      } catch (backupError) {
        syncMessage += `
│ ❌  No se pudo conectar a la base de datos de respaldo.`;
        totoroLog.error(
          `Error en la conexión a la base de datos de respaldo: ${backupError.message}`
        );
      }
    } finally {
      syncMessage += `
▣──────────────────────────────────────────────────────────────────────────···
`;
      try {
        await this.tDB.sequelize.close();
      } catch (closeError) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `Error cerrando la base de datos principal: ${closeError.message}`
        );
      }

      try {
        await this.backupDB.close();
      } catch (backupCloseError) {
        totoroLog.error(
          "./logs/scripts/sync.log",
          `Error cerrando la base de datos de respaldo: ${backupCloseError.message}`
        );
      }

      totoroLog.info(
        "./logs/scripts/sync.log",
        "Proceso de sincronización terminado"
      );
      console.log(syncMessage);
    }
  }
}

module.exports = totoDBSync;
