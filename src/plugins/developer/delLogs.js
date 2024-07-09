const { exec } = require("child_process");
const path = require("path");
const totoroLog = require("../../functions/totoroLog");
const { sendError } = require("../../functions/messages");

module.exports = {
  name: "deletelogs",
  category: "developer",
  subcategory: "owner",
  usage: "<deletelogs>",
  description: "Elimina todos los archivos de logs generados en la carpeta logs",

  async execute(totoro, msg, _) {
    try {
      const logsPath = path.join(__dirname, "../../../logs");

      // Detectar el sistema operativo y construir el comando adecuado
      let command;
      if (process.platform === "win32") {
        command = `rd /s /q "${logsPath}"`;
      } else {
        command = `rm -rf "${logsPath}"`;
      }

      // Ejecutar el comando
      exec(command, (error, stdout, stderr) => {
        if (error) {
          totoroLog.error(
            "./logs/handlers/plugins.log",
            `[PLUGINS] Error al eliminar los archivos y carpetas de logs: ${error.message}`
          );
          sendError(totoro, msg, `Error al eliminar los archivos y carpetas de logs: ${error.message}`);
          return;
        }
        
        if (stderr) {
          totoroLog.error(
            "./logs/handlers/plugins.log",
            `[PLUGINS] Error al eliminar los archivos y carpetas de logs: ${stderr}`
          );
          sendError(totoro, msg, `Error al eliminar los archivos y carpetas de logs: ${stderr}`);
          return;
        }

        if (stdout) {
          totoroLog.info(
            "./logs/handlers/plugins.log",
            `[PLUGINS] ${stdout}`
          );
        }

        totoroLog.info(
          "./logs/handlers/plugins.log",
          `[PLUGINS] Todos los archivos y carpetas de logs eliminados.`
        );
        msg.reply(`Todos los archivos y carpetas de logs han sido eliminados.`);
      });
    } catch (error) {
      totoroLog.error(
        "./logs/handlers/plugins.log",
        `[PLUGINS] Error al eliminar los archivos y carpetas de logs: ${error.message}`
      );
      sendError(totoro, msg, `Error al eliminar los archivos y carpetas de logs: ${error.message}`);
    }
  }
};
