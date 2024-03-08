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

      await new NoichuGuildManager().setMaxWords(modalInteraction, targetChannelId, amount.valueOf());
      await channelConfig.sync();
      await interaction.editReply({ embeds: [channelConfig.createConfigEmbed()] });
    });
  },
};
