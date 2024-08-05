const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const activateTotoCounter = tDB.sequelize.define(
  "activateTotoCounter",
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
    tableName: "activateTotoCounter",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    hooks: {
      afterSync: async (options) => {
        const count = await activateTotoCounter.count();
        if (count === 0) {
          await activateTotoCounter.create({
            counterId: 1,
            status: "off",
          });
        }
      },
    },
  }
);

totoroLog.info(
  "./logs/models/activateTotoCounter.log",
  `[MODELS] Modelo activateTotoCounter creado.`
);

module.exports = activateTotoCounter;
