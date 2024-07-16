const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");

module.exports = async (totoro) => {
  try {
    const directory = await readdir("./src/plugins");

    for (const folder of directory) {
      const files = await readdir(`./src/plugins/${folder}`);

      for (const file of files) {
        const pluginPath = `../plugins/${folder}/${file}`;
        delete require.cache[require.resolve(pluginPath)];

        // Cargar el módulo del plugin
        const plugin = require(pluginPath);

        // Añadir el nombre principal del plugin al mapa de plugins
        totoro.plugins.set(plugin.name.toLowerCase(), plugin);

        // Añadir aliases (si existen) al mapa de plugins
        if (plugin.aliases && Array.isArray(plugin.aliases)) {
          for (const alias of plugin.aliases) {
            totoro.plugins.set(alias.toLowerCase(), plugin);
          }
        }
      }
    }

    // Registrar en el log la cantidad de plugins cargados
    totoroLog.info(
      "./logs/handlers/plugins.log",
      `[PLUGINS] ${totoro.plugins.size} cargados.`
    );
  } catch (error) {
    console.error("Error al cargar plugins:", error);
    totoroLog.error(
      "./logs/handlers/plugins.log",
      `[ERROR] Error al cargar plugins: ${error.message}`
    );
  }
};
