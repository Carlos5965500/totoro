const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");
const totoUser = require("./totoUser");

const tDB = new TotoDB();

const totoPremium = tDB.sequelize.define(
  "totoPremium",
  {
    totoUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: totoUser,
        key: "id",
      },
    },
    serialNumber: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    // Puedes agregar más campos específicos de usuarios premium si los necesitas
  },
  {
    tableName: "totoPremiumUsers",
    timestamps: false,
  }
);

totoroLog.info(
  "./logs/models/totoPremium.log",
  `[MODELS] Modelo ${totoPremium.name} creado.`
);

module.exports = totoPremium;
