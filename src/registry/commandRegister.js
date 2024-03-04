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
        await client.rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: client.commandJSONArray,
        });
      }
      logger.log.command("Successfully reloaded application (/) commands.");
    } catch (error) {
      logger.error(error);
    }
  },
};
