const {
  ButtonStyle,
  ButtonInteraction,
  Client,
  ThreadOnlyChannel,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
} = require("discord.js");
const logger = require("../../../utils/logger");
const { ConfessionPost } = require("../../../functions/confessionSystem/ConfessionFunction");
const { autoBuildButton } = require("../../../utils/autoBuild");
const { GuildConfig } = require("../../../typings");

module.exports = {
  data: {
    customId: `confession-post-delete-btn`,
    label: `Delete`,
    buttonStyle: ButtonStyle.Danger,
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

      const post = new ConfessionPost(channelPost.id, "", "", interaction.guildId);
      await post.reSync();

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

      const postChannel = interaction.guild.channels.cache.get(post.id);

      const confirmButton = autoBuildButton(client.buttons.get(`confession-post-confirm-delete-btn`).data);
      const actionRow = new ActionRowBuilder().addComponents([confirmButton]);

      const embed = new EmbedBuilder()
        .setTitle(`Bạn có chắc muốn xóa post <#${postChannel.id}> không ?`)
        .setColor(Colors.Yellow);

      await interaction.editReply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      logger.errors.component(`EXECUTE_BUTTON_EVENT_ERROR: id>>${this.data.customId}: ${error}`);
    }
  },
};
