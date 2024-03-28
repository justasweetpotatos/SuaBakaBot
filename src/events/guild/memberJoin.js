const { Client, User } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {Client} client
   * @param {User} user
   */
  async execute(user, client) {
    if (user.bot) return;

    const channelId = `1188481027946070097`;
    const channel = await client.channels.fetch(channelId);

    await channel.send(
      `Xin chào <@${user.id}>, hãy react role trong kênh <#1165897689947443240> để gia nhập kênh chat chung !`
    );
  },
};
