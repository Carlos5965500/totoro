const { readdir } = require("fs/promises");
const totoroLog = require("../functions/totoroLog");

module.exports = async (totoro) => {
  // Verificar que totoro.functions esté inicializado
  if (!totoro.functions) {
    totoro.functions = new Map();
  }

  // Leer todos los archivos del directorio de funciones
  const files = await readdir("./src/functions");

  for (const file of files) {
    // Limpiar la caché del módulo antes de requerirlo nuevamente
    delete require.cache[require.resolve(`../functions/${file}`)];

    // Requerir y registrar las funciones exportadas
    const funcs = require(`../functions/${file}`); 

    // Si el módulo exporta múltiples funciones, agregarlas todas
    if (typeof funcs === 'object' && funcs !== null) {
      for (const [name, func] of Object.entries(funcs)) {
        totoro.functions.set(name, func);
      }
    } else if (typeof funcs === 'function') {
      // Si el módulo exporta una única función
      totoro.functions.set(funcs.name, funcs);
    }
  }

  // Registrar la cantidad de funciones cargadas
  totoroLog.info(
    "./logs/handlers/function.log",
    `[FUNCTIONS] ${totoro.functions.size} funciones cargadas.`
  );
};