const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const tDB = new TotoDB();
const totoUser = require("./totoUser");

const totoWhitelist = tDB.sequelize.define(
  "totoWhitelist",
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
  },
  {
    tableName: "totoWhitelist",
    timestamps: false,
  }
);

totoroLog.info(
  "./logs/models/totoWhitelist.log",
  `[MODELS] Modelo ${totoWhitelist.name} creado.`
);

module.exports = totoWhitelist;
