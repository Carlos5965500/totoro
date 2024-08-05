const activateTotoCounter = require("./activateTotoCounter");
const totoGroupSettings = require("./totoGroupSettings");
const totoMantainance = require("./totoMantainance");
const totoBlacklist = require("./totoBlackList");
const totoWhitelist = require("./totoWhiteList");
const totoPremium = require("./totoPremium");
const totoCounter = require("./totoCounter");
const totoStatus = require("./totoStatus");
const totoPlugin = require("./totoPlugin");
const totoWelcm = require("./totoWelcm");
const totoBlock = require("./totoBlock");
const totoAdmin = require("./totoAdmin");
const totoUser = require("./totoUser");
const totoDev = require("./totoDev");
//const totoAfk = require("./totoAfk");

// Relación uno a uno
totoUser.hasOne(totoPremium, {
  foreignKey: "totoUserId",
  sourceKey: "id",
});

totoPremium.belongsTo(totoUser, {
  foreignKey: "totoUserId",
  targetKey: "id",
});

// Relación uno a muchos
totoUser.hasMany(totoPlugin, {
  foreignKey: "totoUserId",
  sourceKey: "id",
});

totoPlugin.belongsTo(totoUser, {
  foreignKey: "totoUserId",
  targetKey: "id",
});

module.exports = {
  activateTotoCounter,
  totoGroupSettings,
  totoMantainance,
  totoBlacklist,
  totoWhitelist,
  totoPremium,
  totoCounter,
  totoStatus,
  totoPlugin,
  totoAdmin,
  totoBlock,
  totoWelcm,
  totoUser,
  //totoAfk,
  totoDev,
};
