const totoCounterActivate = require("./totoCounterActivate");
const totoGroupMantainance = require("./totoGroupMantainance");
const totoGroupSettings = require("./totoGroupSettings");
const totoMantainance = require("./totoMantainance");
const totoBlacklist = require("./totoBlackList");
const totoWhitelist = require("./totoWhiteList");
const totoPremium = require("./totoPremium");
const totoCounter = require("./totoCounter");
const totoStatus = require("./totoStatus");
const totoCifrar = require("./totoCifrar");
const totoPlugin = require("./totoPlugin");
const totoWelcm = require("./totoWelcm");
const totoBlock = require("./totoBlock");
const totoAdmin = require("./totoAdmin");
const totoUser = require("./totoUser");
const totoWarn = require("./totoWarn");
const totoDev = require("./totoDev");
const totoAfk = require("./totoAfk");

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
  totoCounterActivate,
  totoGroupMantainance,
  totoGroupSettings,
  totoMantainance,
  totoBlacklist,
  totoWhitelist,
  totoPremium,
  totoCounter,
  totoCifrar,
  totoStatus,
  totoPlugin,
  totoAdmin,
  totoBlock,
  totoWelcm,
  totoUser,
  totoWarn,
  totoAfk,
  totoDev,
};
