const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const totoroLog = require("../functions/totoroLog");

const tDB = new TotoDB();

const totoUser = tDB.sequelize.define(
  "totoUser",
  {
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 9,
        max: 70,
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    premium: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: true,
      },
    },
    registered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
    },
    serialNumber: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
  },
  {
    tableName: "totousers",
    timestamps: false,
  }
);

totoroLog.info(
  "./logs/models/totoUser.log",
  `[MODELS] Modelo ${totoUser.name} creado.`
);

totoUser.getCountryFromPhone = function (phone) {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber.country;
};

module.exports = totoUser;
