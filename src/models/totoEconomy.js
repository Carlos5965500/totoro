const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const totoUser = require("./totoUser"); // Importa el modelo de usuario

const tDB = new TotoDB();

const totoEconomy = tDB.sequelize.define(
  "totoEconomy",
  {
    income: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expenses: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    savings: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    investments: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: totoUser, // Nombre del modelo al que se hace referencia
        key: "id", // Nombre de la columna en el modelo referenciado
      },
    },
  },
  {
    tableName: "totoeconomies",
  }
);

// Establecer la relación entre totoEconomy y totoUser
totoUser.hasMany(totoEconomy, { foreignKey: "userId" });
totoEconomy.belongsTo(totoUser, { foreignKey: "userId" });

module.exports = totoEconomy;