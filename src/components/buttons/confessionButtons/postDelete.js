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
const { ConfessionPost } = require("../../../functions/confessionSystem/Confession");
const { GuildGlobalConfig } = require("../../../functions/guildConfig/guildGlobalConfig");
const { autoBuildButton } = require("../../../utils/autoBuild");

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

      const guildConfig = new GuildGlobalConfig(interaction.guildId, interaction.guild.name);
      if (!(await guildConfig.sync())) await guildConfig.update();

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
      logger.errors.component(`Error on executing button event ${this.data.customId}: ${error}`);
    }
  },
};
