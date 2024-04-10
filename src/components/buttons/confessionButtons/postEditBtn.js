const {
  ButtonStyle,
  ButtonInteraction,
  Client,
  TextInputBuilder,
  ModalBuilder,
  EmbedBuilder,
  Colors,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const logger = require("../../../utils/logger");
const {
  ConfessionPost,
  ConfesisonPostChannelManager,
} = require("../../../functions/confessionSystem/ConfessionFunction");
const { GuildConfig } = require("../../../typings");

module.exports = {
  data: {
    customId: `confession-post-edit-btn`,
    label: `Edit`,
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
      const channelPost = interaction.channel;
      const postMessage = interaction.message;

      const post = new ConfessionPost(channelPost.id, "", interaction.channel.parentId, interaction.guildId);
      await post.reSync();

      const postChannelManager = new ConfesisonPostChannelManager(channelPost.parentId, channelPost.guildId);
      await postChannelManager.sync();

      const guildConfig = new GuildConfig(interaction.guildId, interaction.guild.name);
      if (!(await interaction.client.guildConfigRepository.sync(guildConfig)))
        await interaction.client.guildConfigRepository.update(guildConfig);

      if (post.authorId !== interaction.user.id) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thất bại !`)
              .setDescription(`*Bạn không phải người viết confession !*`)
              .setColor(Colors.Yellow),
          ],
        });
        return;
      }

      const postNameInput = new TextInputBuilder()
        .setCustomId(`confession-edit-post-modal-${interaction.user.id}-post-name-input`)
        .setLabel(`Tên:`)
        .setPlaceholder(`Tên của confession bạn muốn đặt`)
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

      const postContentInput = new TextInputBuilder()
        .setCustomId(`confession-edit-post-modal-${interaction.user.id}-post-content-input`)
        .setLabel(`Nội dung:`)
        .setPlaceholder(`Nội dung confession của bạn:`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const actionRow = new ActionRowBuilder().addComponents(postNameInput);
      const actionRow2 = new ActionRowBuilder().addComponents(postContentInput);

      const modal = new ModalBuilder()
        .setCustomId(`confession-edit-post-modal-${interaction.user.id}`)
        .setTitle(`${post.anonymous ? "Anonymous confession" : "Confession"}`)
        .addComponents([actionRow, actionRow2]);

      await interaction.showModal(modal);

      await interaction.awaitModalSubmit({ time: 600_00 }).then(async (modadSubmitInteraction) => {
        await modadSubmitInteraction.deferReply({ ephemeral: true });
        if (modadSubmitInteraction.customId !== `confession-edit-post-modal-${interaction.user.id}`) return;

        const postName = modadSubmitInteraction.fields.getTextInputValue(
          `confession-edit-post-modal-${interaction.user.id}-post-name-input`
        );
        const postContent = modadSubmitInteraction.fields.getTextInputValue(
          `confession-edit-post-modal-${interaction.user.id}-post-content-input`
        );

        post.name = postName;
        post.content = postContent;

        await postChannelManager.editAndUpdatePost(modadSubmitInteraction, postMessage, post);

        await modadSubmitInteraction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thành công!`)
              .setColor(Colors.Green)
              .setDescription(`*Edit post hoàn tất !*`),
          ],
        });
      });
    } catch (error) {
      logger.errors.component(`EXECUTE_BUTTON_EVENT_ERROR: id>>${this.data.customId}: ${error}`);
    }
  },
};
