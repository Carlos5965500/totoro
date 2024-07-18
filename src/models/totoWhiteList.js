const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");

const tDB = new TotoDB();

const totoWhitelist = tDB.sequelize.define(
  "totoWhitelist",
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: totoUser,
        key: "id",
      },
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
  },
  {
    tableName: "totoWhitelist",
    timestamps: false,
  }
);

totoUser.hasOne(totoWhitelist, { foreignKey: "userId" });
totoWhitelist.belongsTo(totoUser, { foreignKey: "userId" });

module.exports = totoWhitelist;
