const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoGroupSettings = tDB.sequelize.define( 
  "totoGroupSettings",
  {
    groupId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    welcomeEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "totoGroupSettings", // Asegúrate de que el nombre de la tabla sea correcto
    timestamps: false,
  }
);

totoroLog.info(
  "./logs/models/totoGroupSettings.log",
  `[MODELS] Modelo ${totoGroupSettings.name} creado.`
);

module.exports = totoGroupSettings;
