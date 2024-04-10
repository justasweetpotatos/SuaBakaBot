const { Client, GuildMember } = require("discord.js");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    if (member.user.bot) return;

    const user = member.user;

    if (member.guild !== "811939594882777128") return;

    const channelId = "1188481027946070097";
    const channel = await client.channels.fetch(channelId);

    await channel.send(
      `Xin chào <@${member.id}>, hãy react role trong kênh <#1165897689947443240> để gia nhập kênh chat chung !`
    );
  },
};
