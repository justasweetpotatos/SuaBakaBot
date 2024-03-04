const { ButtonStyle, ButtonInteraction, EmbedBuilder, Embed, Colors } = require("discord.js");
const { getNoichuChannelConfig } = require("../../../database/guildData");
const { setRepeated } = require("../../../functions/noichu/noichuFunction");

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
    const configMessage = interaction.message;
    const targetChannelId = configMessage.embeds[0].title.match(/\d+/)[0];
    let channelConfig = await getNoichuChannelConfig(targetChannelId);
    if (!channelConfig) {
      await configMessage.delete();
    } else {
      await setRepeated(interaction, targetChannelId);
      channelConfig = await getNoichuChannelConfig(targetChannelId);
      const newConfigEmbed = new EmbedBuilder()
        .setTitle(`Cài đặt game nối chữ kênh <#${channelConfig.id}> :`)
        .setDescription(
          `***Configuration:***
            Channel id: ${channelConfig.id}
            Last user: ${channelConfig.last_user_id.length === 0 ? "none" : `<@${channelConfig.last_user_id}>`}
            Last word: ${channelConfig.last_word ? "none" : channelConfig.last_word}
            Max words: ${channelConfig.max_words}
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
