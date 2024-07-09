const TotoDB = require("../libs/db/totoDB");
const totoUser = require("../models/totoUser");
const { Sequelize } = require('sequelize');
const totoroLog = require('../functions/totoroLog');

class totoDBSync {
  constructor() {
    this.tDB = new TotoDB();

    // Definir la base de datos de respaldo SQLite
    this.backupDB = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.BACKUP_STORAGE_PATH || './database/totoDB.sqlite',
      logging: process.env.BACKUP_LOGGING === 'true' ? console.log : false,
    });

    // Definir el modelo en la base de datos de respaldo
    this.backupTotoUser = this.backupDB.define('totoUser', totoUser.rawAttributes, totoUser.options);
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

      await totoUser.sync({ force: false });
      syncMessage += `
│ 🔄  Tabla sincronizada: ${totoUser.getTableName()}`;

      await this.tDB.sequelize.sync({ force: false });
      syncMessage += `
│ ✅  Sincronización completada con éxito en la base de datos principal`;
      totoroLog.info('./logs/scripts/sync.log', 'Sincronización completada con éxito en la base de datos principal')
    } catch (error) {
      syncMessage += `
│ ⚠️   No conectado a ${this.tDB.sequelize.getDatabaseName()}, usando totoDB.sqlite como respaldo.`;
      totoroLog.error('./logs/scripts/sync.log', `Error en la conexión a la base de datos principal: ${error.message}`);
      
      try {
        await this.backupDB.authenticate();
        syncMessage += `
│ 🚀  Conexión exitosa a la base de datos de respaldo: ${this.backupDB.options.storage}`;

        await this.backupTotoUser.sync({ force: false });
        syncMessage += `
│ 🔄  Tabla sincronizada: ${this.backupTotoUser.getTableName()}`;

        await this.backupDB.sync({ force: false });
        syncMessage += `
│ ✅  Sincronización completada con éxito en la base de datos de respaldo`;
        totoroLog.info('./logs/scripts/sync.log', 'Sincronización completada con éxito en la base de datos de respaldo');
      } catch (backupError) {
        syncMessage += `
│ ❌  No se pudo conectar a la base de datos de respaldo.`;
        totoroLog.error(`Error en la conexión a la base de datos de respaldo: ${backupError.message}`);
      }
    } finally {
      syncMessage += `
▣──────────────────────────────────────────────────────────────────────────···
`;
      try {
        await this.tDB.sequelize.close();
      } catch (closeError) {
        totoroLog.error('./logs/scripts/sync.log', `Error cerrando la base de datos principal: ${closeError.message}`);
      }

      try {
        await this.backupDB.close();
      } catch (backupCloseError) {
        totoroLog.error('./logs/scripts/sync.log', `Error cerrando la base de datos de respaldo: ${backupCloseError.message}`);
      }

      totoroLog.info('./logs/scripts/sync.log', 'Proceso de sincronización terminado');
      console.log(syncMessage);
    }
  }
}

module.exports = totoDBSync;
