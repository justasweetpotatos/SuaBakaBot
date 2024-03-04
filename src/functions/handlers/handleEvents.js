const fs = require("fs");
const logger = require("../../utils/logger");

module.exports = (client) => {
  client.handleEvents = async () => {
    const eventFolders = fs.readdirSync("./src/events");
    for (const folder of eventFolders) {
      const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith(".js"));

      switch (folder) {
        case "client":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);
            if (event.once) {
              client.once(event.name, (...args) => event.execute(...args, client));
              logger.log.eventRegiter(`Event "${event.name}" loaded successfully.`);
            } else {
              client.on(event.name, (...args) => event.execute(...args, client));
            }
          }
          break;
        case "noichu":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);
            if (event.name && event.execute) {
              if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
              else client.on(event.name, (...args) => event.execute(...args, client));

              logger.log.eventRegiter(`Event "${event.name}" loaded successfully.`);
            } else logger.error(`Invalid event file: ${file}. Missing required properties.`);
          }
          break;
        case "prefixCommands":
          for (const file of eventFiles) {
            const event = require(`../../events/${folder}/${file}`);

            if (event.name && event.execute) {
              if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
              else client.on(event.name, (...args) => event.execute(...args, client));
              logger.log.eventRegiter(`Event "${event.name}" loaded successfully.`);
            } else logger.error(`Invalid event file: ${file}. Missing required properties.`);
          }
        // Add additional cases for other event folders if needed
      }
    }
  };
};
