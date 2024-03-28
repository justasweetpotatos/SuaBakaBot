const { Client, Guild } = require("discord.js");
const logger = require("../../utils/logger");
const { GuildDBInitial } = require("../../utils/initial/createGuildDB");

module.exports = {
  name: "guildCreate",
  /**
   *
   * @param {Guild} guild
   * @param {Client} client
   */
  async execute(guild, client) {
    const guildDBInitial = new GuildDBInitial(guild.id);
    if (!(await guildDBInitial.isExistDB())) await guildDBInitial.createGuildDB();
  },
};
