const { Client, SlashCommandBuilder } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const logger = require("../utils/logger");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async registCommands(client) {
    const { clientId, guildIdList } = client;
    try {
      logger.log.command("Started refreshing application (/) commands.");
      for (const guildId of guildIdList) {
        // Register regular commands
        try {
          await client.rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: client.commandJSONArray,
          });
        } catch (error) {
          ogger.error(error);
        }
      }
      logger.log.command("Successfully reloaded application (/) commands.");
    } catch (error) {
      logger.errors.command(`Error on reloading commands: ${error}`);
    }
  },
};
