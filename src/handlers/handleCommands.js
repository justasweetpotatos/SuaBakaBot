const fs = require("fs").promises;
const path = require("path");
const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { registCommands } = require("../registry/commandRegister.js");
const logger = require("../utils/logger.js");

/**
 * @param {import('discord.js').Client} client
 */
module.exports = async (client) => {
  client.handleCommands = async () => {
    logger.log.command(`Handling commands progress...`);
    try {
      const commandFolders = await fs.readdir(path.join(__dirname, "../commands/"));

      for (const folder of commandFolders) {
        const commandFiles = await fs.readdir(path.join(__dirname, `../commands/${folder}`));

        for (const file of commandFiles) {
          if (!file.endsWith(".js")) continue;

          const commandPath = path.join(__dirname, `../commands/${folder}/${file}`);
          const command = require(commandPath);

          if (command.data instanceof SlashCommandBuilder) {
            let { commands, commandJSONArray, commandNameList } = client;
            commands.set(command.data.name, command);
            commandJSONArray.push(command.data.toJSON());

            if (command.data.options.length !== 0) {
              command.data.options.forEach((item) => {
                if (item instanceof SlashCommandSubcommandBuilder) {
                  commandNameList.push({
                    name: `${command.data.name} ${item.name}`,
                    value: `${command.data.name} ${item.name}`,
                  });
                  client.commandPaths.set(`${command.data.name} ${item.name}`, commandPath);
                }
              });
            } else {
              commandNameList.push({
                name: `${command.data.name} `,
                value: `${command.data.name} `,
              });
              client.commandPaths.set(command.data.name, commandPath);
            }
            logger.log.command(`Command "${command.data.name}" has been passed through the handlers`);
          } else {
            let { subcommands, subcommandJSONArray } = client;
            subcommands.set(command.data.name, command);
            subcommandJSONArray.push(command.data.toJSON());

            logger.log.command(`Subcommand "${command.data.name}" has been passed through the handlers`);
          }
        }
      }

      await registCommands(client);
    } catch (error) {
      console.error("An error occurred while handling commands:", error);
    }
  };
};
