const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoBlock = tDB.sequelize.define(
  "totoBlock",
  {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
  },
  {
    tableName: "totoBlock",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

totoroLog.info(
  "./logs/models/totoBlock.log",
  `[MODELS] Modelo totoBlock creado.`
);

module.exports = totoBlock;
