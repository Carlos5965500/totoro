const totoUser = require("./totoUser");
const totoPremium = require("./totoPremium");
const totoPlugin = require("./totoPlugin");
const totoWhitelist = require("./totoWhiteList");
const totoBlacklist = require("./totoBlackList");
const totoDev = require("./totoDev");
const totoCounter = require("./totoCounter");
const totoGroupSettings = require("./totoGroupSettings");
const totoWelcm = require("./totoWelcm");
const totoStatus = require("./totoStatus");
const totoBlock = require("./totoBlock");
const totoMantainance = require("./totoMantainance");


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
  totoGroupSettings,
  totoMantainance,
  totoBlacklist,
  totoWhitelist,
  totoPremium,
  totoCounter,
  totoPlugin,
  totoStatus,
  totoBlock,
  totoWelcm,
  totoUser,
  totoDev,
};
