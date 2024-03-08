const {
  ButtonStyle,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  ButtonInteraction,
  Client,
  TextInputStyle,
  Colors,
  EmbedBuilder,
} = require("discord.js");
const { NoichuChannelConfig } = require("../../../typings");
const { NoichuGuildManager } = require("../../../functions/noichu/noichuFunction");

module.exports = {
  data: {
    customId: `noichu-set-max-words`,
    label: `Set Max`,
    buttonStyle: ButtonStyle.Primary,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const embed = interaction.message.embeds[0];
    const targetChannelId = embed.title.match(/\d+/)[0];

    const channelConfig = new NoichuChannelConfig(targetChannelId, interaction.guildId);
    if (!(await channelConfig.sync(targetChannelId))) {
      await interaction.message.delete();
      await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setTitle(`Config has been deleted !`).setColor(Colors.Red)],
      });
      return;
    }

    const amoutInput = new TextInputBuilder()
      .setCustomId(`amout-input`)
      .setLabel(`Config for chanenl id: ${targetChannelId}`)
      .setPlaceholder(`Giới hạn số từ có thể chơi trong kênh trước khi reset !`)
      .setStyle(TextInputStyle.Short);

    const actionRow = new ActionRowBuilder().addComponents(amoutInput);

    const modal = new ModalBuilder()
      .setCustomId(`noichu-max-words-modal-${targetChannelId}`)
      .setTitle(`Nhập số lượng`)
      .addComponents(actionRow);

    await interaction.showModal(modal);

    await interaction.awaitModalSubmit({ time: 60_000 }).then(async (modalInteraction) => {
      if (modalInteraction.customId !== `noichu-max-words-modal-${targetChannelId}`) return;
      const amount = modalInteraction.fields.getTextInputValue(`amout-input`);

      if (!/^\d+$/.test(amount)) {
        const repliedMessage = await modalInteraction.reply({
          embeds: [new EmbedBuilder().setTitle(`Đầu vào bắt buộc phải là số !`).setColor(Colors.Yellow)],
        });
        setTimeout(async () => {
          await repliedMessage.delete();
        }, 5000);
        return;
      }

      const mn = new NoichuGuildManager(interaction.guildId, targetChannelId);
      await mn.setMaxWords(modalInteraction, targetChannelId, amount.valueOf());
      const channelConfig = await getNoichuChannelConfig(targetChannelId);
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

      await interaction.editReply({ embeds: [newConfigEmbed] });
    });
  },
};
