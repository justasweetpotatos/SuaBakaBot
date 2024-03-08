const { ChannelType, Client } = require("discord.js");
const { configChannel, NoichuGuildManager } = require("../../../functions/noichu/noichuFunction");

module.exports = {
  data: {
    customId: `noichu-exist-channel-selector`,
    placeholder: `Channel để set hoặc thêm xóa game nối chữ !`,
    channelType: ChannelType.GuildText,
  },
  /**
   *
   * @param {import("discord.js").ChannelSelectMenuInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isChannelSelectMenu()) {
      const targetChannel = interaction.channels.first();
      const manager = new NoichuGuildManager(targetChannel.guildId, targetChannel.id);
      await manager.configChannel(interaction, targetChannel.id, client);
    }
  },
};
