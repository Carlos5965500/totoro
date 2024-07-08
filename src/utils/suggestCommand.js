const { distance } = require("fastest-levenshtein");

module.exports = (sock, label) => {
  const plugins = sock.plugins
    .filter(({ dev }) => !dev)
    .map((value) => ({
      name: value.name,
      distance: distance(label, value.name),
    }));

  plugins.sort((a, b) => a.distance - b.distance);

  if(label.length <= 1) return;
  
  if (!plugins.length || plugins[0].distance >= 4) {
    return "No se encontró el plugin.";
  }

  return `No se encontró el plugin.\n¿Tal vez te referías a \`${plugins[0].name}\`?`;
};
