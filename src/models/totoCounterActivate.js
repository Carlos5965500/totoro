const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoCounterActivate = tDB.sequelize.define(
  "totoCounterActivate",
  {
    counterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
  },
  {
    tableName: "totoCounterActivate",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      afterSync: async (options) => {
        const count = await totoCounterActivate.count();
        if (count === 0) {
          await totoCounterActivate.create({
            counterId: 1,
            status: "off",
          });
        }
      },
    },
  }
);

totoroLog.info(
  "./logs/models/totoCounterActivate.log",
  `[MODELS] Modelo totoCounterActivate creado.`
);

module.exports = totoCounterActivate;
