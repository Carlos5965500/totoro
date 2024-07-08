const { readdir } = require("fs/promises");

module.exports = async (sock) => {
  const directory = await readdir("./src/plugins");

  for (const folder of directory) {
    const files = await readdir(`./src/plugins/${folder}`);

    for (const file of files) {
      delete require.cache[require.resolve(`../plugins/${folder}/${file}`)];

      const plugin = require(`../plugins/${folder}/${file}`); 
      sock.plugins.set(plugin.name, plugin);
    }
  }

  console.log(`- ${sock.plugins.size} [PLUGINS] cargados.`);
};
