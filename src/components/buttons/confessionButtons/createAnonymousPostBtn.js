const {
  ButtonStyle,
  Client,
  ButtonInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const {
  ConfesisonPostChannelManager,
  ConfessionPost,
} = require("../../../functions/confessionSystem/ConfessionFunction");

module.exports = {
  data: {
    customId: `confession-create-anonymous-post-btn`,
    label: `Anonymous confession`,
    buttonStyle: ButtonStyle.Primary,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const channelManager = new ConfesisonPostChannelManager(
      interaction.channel.parentId,
      interaction.guildId
    );
    await channelManager.sync();

    const postNameInput = new TextInputBuilder()
      .setCustomId(`confession-create-anoymous-post-modal-${interaction.user.id}-post-name-input`)
      .setLabel(`Tên:`)
      .setPlaceholder(`Tên của confession bạn muốn đặt`)
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const postContentInput = new TextInputBuilder()
      .setCustomId(`confession-create-anoymous-post-modal-${interaction.user.id}-post-content-input`)
      .setLabel(`Nội dung:`)
      .setPlaceholder(`Nội dung confession của bạn:`)
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder().addComponents(postNameInput);
    const actionRow2 = new ActionRowBuilder().addComponents(postContentInput);

    const modal = new ModalBuilder()
      .setCustomId(`confession-create-anoymous-post-modal-${interaction.user.id}`)
      .setTitle(`Anonymous Confession`)
      .addComponents([actionRow, actionRow2]);

    await interaction.showModal(modal);

    await interaction.awaitModalSubmit({ time: 600_00 }).then(async (modadSubmitInteraction) => {
      await modadSubmitInteraction.deferReply({ ephemeral: true });
      if (modadSubmitInteraction.customId !== `confession-create-anoymous-post-modal-${interaction.user.id}`)
        return;

      const postName = modadSubmitInteraction.fields.getTextInputValue(
        `confession-create-anoymous-post-modal-${interaction.user.id}-post-name-input`
      );
      const postContent = modadSubmitInteraction.fields.getTextInputValue(
        `confession-create-anoymous-post-modal-${interaction.user.id}-post-content-input`
      );
      const post = new ConfessionPost(
        ``,
        modadSubmitInteraction.user.id,
        channelManager.id,
        channelManager.guildId,
        postName,
        postContent,
        true,
        false
      );
      await channelManager.createPost(modadSubmitInteraction, post);
      await modadSubmitInteraction.editReply({
        embeds: [
          new EmbedBuilder().setTitle(`Thao tác thành công!`).setColor(Colors.Green)
            .setDescription(`Đã tạo post thành công:
              \`Where\`: <#${post.id}>
            `),
        ],
      });
    });
  },
};
