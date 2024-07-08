const { readdir } = require("fs/promises");

module.exports = async (sock) => {
  const folder = await readdir("./src/events");

  for (const file of folder) {
    const event = require(`../events/${file}`);

    sock.ev.on(event.name, (...args) => {
      event.load(...args, sock);
    });
  }

  console.log(`- ${folder.length} [EVENTS] cargados.`);
};
