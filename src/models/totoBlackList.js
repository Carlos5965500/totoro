const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser");

const tDB = new TotoDB();

const totoBlacklist = tDB.sequelize.define(
  "totoBlacklist",
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
    tableName: "totoBlacklist",
    timestamps: false,
  }
);

totoUser.hasOne(totoBlacklist, { foreignKey: "userId" });
totoBlacklist.belongsTo(totoUser, { foreignKey: "userId" });

module.exports = totoBlacklist;
