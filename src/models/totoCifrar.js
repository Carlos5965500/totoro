const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const tDB = new TotoDB();
const totoUser = require("./totoUser");

const totoCifrar = tDB.sequelize.define(
  "totoCifrar",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: totoUser,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: totoUser,
        key: "phone",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "totoCifrar",
    timestamps: false,
  }
);

totoroLog.info(
  "./logs/models/totoCifrar.log",
  `[MODELS] Modelo ${totoCifrar.name} creado.`
);

module.exports = totoCifrar;
