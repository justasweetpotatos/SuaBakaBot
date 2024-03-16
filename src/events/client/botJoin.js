const { Client, User } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  name: "guildCreate",
  /**
   *
   * @param {Client} client
   * @param {User} user
   */
  async execute(guild, client) {
    console.log(guild);
  },
};
