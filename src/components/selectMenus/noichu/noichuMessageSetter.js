const { ChannelType, Client } = require("discord.js");
const { NoichuChannelManager } = require("../../../functions/noichu/manager");

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
      const channelManager = new NoichuChannelManager(interaction.guild, targetChannel);

      await channelManager.sendSettingEditInterface(interaction);
    }
  },
};
