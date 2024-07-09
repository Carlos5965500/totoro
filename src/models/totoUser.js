const { DataTypes } = require("sequelize");
const TotoDB = require("../libs/db/totoDB");
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const phoneRegex = /^\+?\d{1,3}[-. ]?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,4[-. ]?\d{1,4}$/;
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
    regTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100],
        isAlphanumeric: true,
        isLowercase: true,
        notEmpty: true,
        is: /^[a-f0-9]+$/i,
        isHash: function (value) {
          if (value.length !== 32) {
            throw new Error(
              `El serialNumber debe tener 32 caracteres, pero tiene ${value.length}`
            );
          }
        },
      },
    } 
  },
  {
    tableName: "totousers",
    createdAt: "regTime", // Use regTime as createdAt
    timestamps: true, // createdAt, updatedAt
    updatedAt: true, // updatedAt
    deletedAt: true, // deletedAt
  }
);

totoroLog.info(
  "./logs/models/totoUser.log",
  `[MODELS] Modelo ${totoUser.name} creado.`
);
totoUser.getCountryFromPhone = function (phone) {
  const phoneNumber = parsePhoneNumberFromString(phone);
  return phoneNumber.country;
}

module.exports = totoUser;
