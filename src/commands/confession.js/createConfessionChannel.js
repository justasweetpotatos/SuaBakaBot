const {
  CommandInteraction,
  Client,
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  ChannelType,
  EmbedBuilder,
  Colors,
  SlashCommandStringOption,
  ForumChannel,
} = require("discord.js");
const logger = require("../../utils/logger");
const { ConfesisonPostChannelManager } = require("../../functions/confessionSystem/Confession");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`create-channel`)
    .setDescription(`Create a confeesion channel !`)
    .addStringOption(new SlashCommandStringOption().setName(`name`).setDescription(`Name of channel.`))
    .addChannelOption(
      new SlashCommandChannelOption().setName(`category-channel`).setDescription(`Category channel to create !`)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ fetchReply: true });

      const name = interaction.options.get(`name`)?.value;

      const forum = await interaction.guild.channels.create({
        name: name ? name : "Confession",
        type: ChannelType.GuildForum,
        availableTags: [{ name: `confession` }, { name: `Anonymous confession` }],
      });

      const channelManager = new ConfesisonPostChannelManager(forum.id, interaction.guildId);
      forum.availableTags.forEach((tag) => {
        channelManager.tagIdList.push(tag.id);
      });

      await channelManager.update();

      // Create fist post in channel
      await channelManager.createPostGeneratorView_postType(interaction);

      await interaction.editReply({ content: `done !` });
    } catch (error) {
      if (error.code === `50024`) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thất bại !`)
              .setDescription(`*Server của bạn không thể tạo kênh diễn đàn !`)
              .setColor(Colors.Red),
          ],
        });
        return;
      }
      logger.errors.command(`Error on executing command ${this.data.name}: ${error.code}`);
    }
  },
};
