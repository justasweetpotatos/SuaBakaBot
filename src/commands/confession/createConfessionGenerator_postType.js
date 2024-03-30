const {
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  ChannelType,
  CommandInteraction,
  Client,
} = require("discord.js");
const { ConfesisonPostChannelManager } = require("../../functions/confessionSystem/ConfessionFunction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`create-post-generator`)
    .setDescription(`Create post generator interface for user !`)
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`forum`)
        .setDescription(`Confession forum`)
        .addChannelTypes(ChannelType.GuildForum)
        .setRequired(true)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ fetchReply: true });

      const targerForum = interaction.options.get(`forum`);
      const channelManager = new ConfesisonPostChannelManager(targerForum.value, interaction.guildId);

      if (!(await channelManager.sync())) throw new Error(`Not confession channel !`);
      await channelManager.createPostGeneratorView_postType(interaction);
    } catch (error) {}
  },
};
