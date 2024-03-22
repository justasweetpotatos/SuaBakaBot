const {
  ButtonStyle,
  ButtonInteraction,
  Client,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const logger = require("../../../utils/logger");
const { ConfessionPost } = require("../../../functions/confessionSystem/ConfessionFunction");

module.exports = {
  data: {
    customId: `confession-post-anonymous-reply-btn`,
    label: `Anonymous reply`,
    buttonStyle: ButtonStyle.Primary,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const post = new ConfessionPost(
        interaction.channelId,
        "",
        interaction.channel.parentId,
        interaction.guildId
      );
      if (!post.reSync()) return;

      const replyTextInput = new TextInputBuilder()
        .setCustomId(`confession-post-anonymous-reply-content-input`)
        .setLabel(`Input`)
        .setPlaceholder(`Content`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const actionRow = new ActionRowBuilder().addComponents(replyTextInput);

      const modal = new ModalBuilder()
        .setCustomId(`confession-post-anonymous-reply-modal`)
        .setTitle(`Nội dung này sẽ được trả lời dưới dạng ẩn danh`)
        .addComponents([actionRow]);

      await interaction.showModal(modal);
      await interaction.awaitModalSubmit({ time: 600_00 }).then(async (modalSubmitInteraction) => {
        await modalSubmitInteraction.deferReply({ fetchReply: true });
        const replyContent = modalSubmitInteraction.fields.getTextInputValue(
          `confession-post-anonymous-reply-content-input`
        );
        const embed = new EmbedBuilder()
          .setTitle(`Anonymous reply no: ?`)
          .setDescription(`**${replyContent}**`)
          .setColor(Colors.Blurple)
          .setTimestamp(new Date().getTime());

        await modalSubmitInteraction.editReply({ embeds: [embed] });
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`THao tác thành công !`)
              .setColor(Colors.Green)
              .setDescription(`*Đã gửi anonymous reply.*`),
          ],
        });
      });
    } catch (error) {
      logger.errors.component(`Error on executing event of button ${this.data.customId}: ${error}`);
    }
  },
};
