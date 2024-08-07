// models/totoWelcm.js
const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");
const totoroLog = require("../functions/totoroLog");
const TotoGroupSettings = require("./totoGroupSettings");

const tDB = new TotoDB();

const totoWarn = tDB.sequelize.define(
  "totoWarn",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: totoUser,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: 'phone',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    warnInfo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "{}",
    },
  },
  {
    tableName: "totoWarn",
    timestamps: false, 
  }
);

totoroLog.info(
  "./logs/models/totoWarn.log",
  `[MODELS] Modelo ${totoWarn.name} creado.`
);

totoWarn.belongsTo(TotoGroupSettings, {
  foreignKey: "groupId",
  targetKey: "groupId",
});

module.exports = totoWarn;
