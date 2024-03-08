const { ButtonStyle, ButtonInteraction, EmbedBuilder, Colors } = require("discord.js");
const { NoichuGuildManager } = require("../../../functions/noichu/noichuFunction");
const { NoichuChannelConfig } = require("../../../typings");

module.exports = {
  data: {
    customId: `noichu-set-repeat`,
    label: `Set Repeat`,
    buttonStyle: ButtonStyle.Primary,
  },
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const targetChannelId = interaction.message.embeds[0].title.match(/\d+/)[0];

    const channelConfig = new NoichuChannelConfig(targetChannelId, interaction.guildId);

    if (!(await channelConfig.sync())) {
      await interaction.message.delete();
      await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setTitle(`Config has been deleted !`).setColor(Colors.Red)],
      });
      return;
    } else {
      await setRepeated(interaction, targetChannelId);
      const newConfigEmbed = new EmbedBuilder()
        .setTitle(`Cài đặt game nối chữ kênh <#${channelConfig.id}> :`)
        .setDescription(
          `***Configuration:***
            Channel id: ${channelConfig.id}
            Last user: ${channelConfig.lastUserId.length === 0 ? "none" : `<@${channelConfig.lastUserId}>`}
            Last word: ${channelConfig.lastWord ? "none" : channelConfig.lastWord}
            Max words: ${channelConfig.limit}
            Repeated: ${channelConfig.repeated === 1 ? "✅" : "❌"}

            ***Hướng dẫn:***
            \`Remove\`: Xóa config nối chữ của kênh !
            \`Set Max\`: Set giới hạn từ trước khi reset game !
            \`Set Repeated\`: Cho phép lặp hoặc không ! 
            `
        )
        .setColor(Colors.Blurple);
      await configMessage.edit({ embeds: [newConfigEmbed] });
    }
  },
};
