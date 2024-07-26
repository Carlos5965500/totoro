const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");

const tDB = new TotoDB();

const totoCommands = tDB.sequelize.define(
  "totoCommands",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'totoUsers', // Nombre de la tabla referenciada
        key: 'id', // Nombre de la columna referenciada
      },
    },
    command: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // Otros campos omitidos para simplicidad
  },
  {
    tableName: "totoCommands",
    timestamps: false,
  }
);

module.exports = totoCommands;
