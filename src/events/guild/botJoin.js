const { Client, Guild } = require("discord.js");
const { GuildConfig } = require("../../typings");

module.exports = {
  name: "guildCreate",
  /**
   *
   * @param {Guild} guild
   * @param {Client} client
   */
  async execute(guild, client) {
    const config = new GuildConfig(guild.id, guild.name);
    if (!(await client.guildConfigRepository.sync(config))) client.guildConfigRepository.createDB(config);
  },
};
