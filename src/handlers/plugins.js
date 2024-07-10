const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");
module.exports = async (totoro) => {
  const directory = await readdir("./src/plugins");

  for (const folder of directory) {
    const files = await readdir(`./src/plugins/${folder}`);

    for (const file of files) {
      delete require.cache[require.resolve(`../plugins/${folder}/${file}`)];

      const plugin = require(`../plugins/${folder}/${file}`);
      totoro.plugins.set(plugin.name, plugin);
    }
  }
  totoroLog.info(
    "./logs/handlers/plugins.log",
    `[PLUGINS] ${totoro.plugins.size} cargados.`
  );
};
