const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const alwaysPresentPhone = ["34638579630", "18297668138"];

// Importar modelos
const {
  totoUser,
  totoPremium,
  totoPlugin,
  totoDev,
  totoWhitelist,
  totoBlacklist,
  totoCounter,
  totoWelcm,
  totoGroupSettings,
  totoStatus,
  totoBlock,
  totoMantainance,
} = require("../models");

class totoDBSync {
  constructor() {
    this.tDB = new TotoDB({
      dialect: "mysql",
      dialectOptions: {
        charset: "utf8mb4",
      },
    });

    // Definir la base de datos de respaldo SQLite
    this.backupDB = new Sequelize({
      dialect: "sqlite",
      storage: process.env.BACKUP_STORAGE_PATH || "./database/totoDB.sqlite",
      logging: process.env.BACKUP_LOGGING === "true" ? console.log : false,
    });

    // Definir los modelos en la base de datos de respaldo
    this.backupModels = {
      totoUser: this.backupDB.define(
        "totoUser",
        totoUser.rawAttributes,
        totoUser.options
      ),
      totoPremium: this.backupDB.define(
        "totoPremium",
        totoPremium.rawAttributes,
        totoPremium.options
      ),
      totoPlugin: this.backupDB.define(
        "totoPlugin",
        totoPlugin.rawAttributes,
        totoPlugin.options
      ),
      totoWhitelist: this.backupDB.define(
        "totoWhitelist",
        totoWhitelist.rawAttributes,
        totoWhitelist.options
      ),
      totoBlacklist: this.backupDB.define(
        "totoBlacklist",
        totoBlacklist.rawAttributes,
        totoBlacklist.options
      ),
      totoDev: this.backupDB.define(
        "totoDev",
        totoDev.rawAttributes,
        totoDev.options
      ),
      totoCounter: this.backupDB.define(
        "totoCounter",
        totoCounter.rawAttributes,
        totoCounter.options
      ),
      totoWelcm: this.backupDB.define(
        "totoWelcm",
        {
          ...totoWelcm.rawAttributes,
          groupId: {
            ...totoWelcm.rawAttributes.groupId,
            references: null, // Quitar referencias para SQLite
          },
        },
        totoWelcm.options
      ),
      totoGroupSettings: this.backupDB.define(
        "totoGroupSettings",
        totoGroupSettings.rawAttributes,
        totoGroupSettings.options
      ),
      totoStatus: this.backupDB.define(
        "totoStatus",
        totoStatus.rawAttributes,
        totoStatus.options
      ),
      totoBlock: this.backupDB.define(
        "totoBlock",
        totoBlock.rawAttributes,
        totoBlock.options
      ),
      totoMantainance: this.backupDB.define(
        "totoMantainance",
        totoMantainance.rawAttributes,
        totoMantainance.options
      ),
    };
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

      // Sincronizar en orden correcto
      await this.syncTables({
        totoUser,
        totoPremium,
        totoPlugin,
        totoWhitelist,
        totoBlacklist,
        totoDev,
        totoCounter,
        totoWelcm,
        totoGroupSettings,
        totoStatus,
        totoBlock,
        totoMantainance,
      });

      syncMessage += `
│ 🔄  Tablas sincronizadas: ${totoUser.getTableName()}, ${totoPremium.getTableName()}, ${totoPlugin.getTableName()}, ${totoWhitelist.getTableName()}, ${totoBlacklist.getTableName()}, ${totoDev.getTableName()}, ${totoCounter.getTableName()}, ${totoWelcm.getTableName()}, ${totoGroupSettings.getTableName()}, ${totoStatus.getTableName()}, ${totoBlock.getTableName()}, ${totoMantainance.getTableName()}`;

      // Leer y actualizar desde settings.json
      const settingsPath = path.resolve(__dirname, "..", "..", "settings.json");
      const settingsData = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
      const devPhones = settingsData.dev.map((phone) =>
        phone.replace("@s.whatsapp.net", "")
      );

      for (const phone of devPhones) {
        // Verificar si el teléfono existe en totoUsers antes de insertar
        const userExists = await totoUser.findOne({ where: { phone: phone } });
        const devExists = await totoDev.findOne({ where: { phone: phone } });

        if (userExists && !devExists) {
          await totoDev.upsert({
            phone: phone,
            role: "Developer",
            active: true,
          });
        } else if (!userExists) {
          syncMessage += `
│ ⚠️  Teléfono no encontrado en totoUsers: ${phone}`;
        }
      }

      syncMessage += `
│ ✅  Datos de desarrolladores sincronizados desde settings.json`;

      await this.removeAbsentDevs(devPhones, totoDev);

      // Cargar y registrar plugins
      const pluginCount = await this.loadAndRegisterPlugins();
      syncMessage += `
│ ✅  ${pluginCount} plugins cargados y registrados`;

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

        await this.syncTables(this.backupModels);
        syncMessage += `
│ 🔄  Tablas sincronizadas: ${this.backupModels.totoUser.getTableName()}, ${this.backupModels.totoPremium.getTableName()}, ${this.backupModels.totoPlugin.getTableName()}, ${this.backupModels.totoWhitelist.getTableName()}, ${this.backupModels.totoBlacklist.getTableName()}, ${this.backupModels.totoDev.getTableName()}, ${this.backupModels.totoCounter.getTableName()}, ${this.backupModels.totoWelcm.getTableName()}, ${this.backupModels.totoGroupSettings.getTableName()}, ${this.backupModels.totoStatus.getTableName()}, ${this.backupModels.totoBlock.getTableName()}, ${this.backupModels.totoMantainance.getTableName()}`;

        // Leer y actualizar desde settings.json en base de datos de respaldo
        for (const phone of devPhones) {
          const userExists = await this.backupModels.totoUser.findOne({
            where: { phone: phone },
          });
          const devExists = await this.backupModels.totoDev.findOne({
            where: { phone: phone },
          });

          if (userExists && !devExists) {
            await this.backupModels.totoDev.upsert({
              phone: phone,
              role: "Developer",
              active: true,
            });
          } else if (!userExists) {
            syncMessage += `
│ ⚠️  Teléfono no encontrado en la base de datos de respaldo: ${phone}`;
          }
        }

        syncMessage += `
│ ✅  Datos de desarrolladores sincronizados desde settings.json en base de datos de respaldo`;

        await this.removeAbsentDevs(devPhones, this.backupModels.totoDev);

        // Cargar y registrar plugins
        const pluginCount = await this.loadAndRegisterPlugins(
          this.backupModels.totoPlugin
        );
        syncMessage += `
│ ✅  ${pluginCount} plugins cargados y registrados en la base de datos de respaldo`;

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
          "./logs/scripts/sync.log",
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

  async syncTables(models) {
    await models.totoGroupSettings.sync({ force: false });
    await models.totoWelcm.sync({ force: false });
    await Promise.all([
      models.totoUser.sync({ force: false }),
      models.totoPremium.sync({ force: false }),
      models.totoPlugin.sync({ force: false }),
      models.totoWhitelist.sync({ force: false }),
      models.totoBlacklist.sync({ force: false }),
      models.totoDev.sync({ force: false }),
      models.totoCounter.sync({ force: false }),
      models.totoStatus.sync({ force: false }),
      models.totoBlock.sync({ force: false }),
      models.totoMantainance.sync({ force: false }),
    ]);
  }

  async removeAbsentDevs(currentDevs, devModel) {
    const allDevs = await devModel.findAll();
    const currentDevPhones = currentDevs.map((phone) =>
      phone.replace("@s.whatsapp.net", "")
    );
    for (const dev of allDevs) {
      if (
        dev.phone !== alwaysPresentPhone &&
        !currentDevPhones.includes(dev.phone)
      ) {
        await devModel.destroy({ where: { phone: dev.phone } });
      }
    }
  }

  async loadAndRegisterPlugins(pluginModel = totoPlugin) {
    const directory = await fs.promises.readdir("./src/plugins");
    let pluginCount = 0;

    // Obtener todos los plugins del directorio
    const plugins = [];

    for (const folder of directory) {
      const files = await fs.promises.readdir(`./src/plugins/${folder}`);

      for (const file of files) {
        const pluginPath = path.join(__dirname, "../plugins", folder, file);

        // Eliminar caché antes de requerir el módulo
        delete require.cache[require.resolve(pluginPath)];

        try {
          const plugin = require(pluginPath);
          if (plugin && plugin.name) {
            plugins.push(plugin); // Agregar plugin a la lista
          }
        } catch (error) {
          console.error(`Error al cargar plugin en ${pluginPath}:`, error);
        }
      }
    }

    // Ordenar plugins alfabéticamente por nombre
    plugins.sort((a, b) => a.name.localeCompare(b.name));

    // Limpiar la base de datos de plugins que ya no existen en el sistema de archivos
    const existingPlugins = await pluginModel.findAll();
    const existingPluginNames = existingPlugins.map((plugin) => plugin.name);
    const pluginNamesInDirectory = plugins.map((plugin) => plugin.name);

    // Eliminar plugins de la base de datos que ya no están en el sistema de archivos
    for (const pluginName of existingPluginNames) {
      if (!pluginNamesInDirectory.includes(pluginName)) {
        await pluginModel.destroy({ where: { name: pluginName } });
      }
    }

    // Insertar los plugins ordenados, reiniciando el ID desde 1
    await pluginModel.destroy({ where: {} }); // Limpiar tabla antes de insertar
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      await pluginModel.create({
        id: i + 1,
        name: plugin.name,
        description: plugin.description || null,
        category: plugin.category || null,
        subcategory: plugin.subcategory || null,
        usage: plugin.usage || null,
        aliases: plugin.aliases ? plugin.aliases.join(",") : null,
      });
      pluginCount++;
    }

    return pluginCount;
  }
}

module.exports = totoDBSync;
