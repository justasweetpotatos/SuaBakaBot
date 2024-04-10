const {
  CommandInteraction,
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  ChannelType,
  Client,
} = require("discord.js");
const { NoichuChannelManager, NoichuGuildManager } = require("../../functions/noichu/manager");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("config")
    .setDescription("Configuration nối chữ game !")
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`channel`)
        .setDescription(`Chọn kênh để cài đặt.`)
        .addChannelTypes(ChannelType.GuildText)
    ),

  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeram: false });
    const targetChannel = interaction.options.get(`channel`)?.channel;

    if (!targetChannel) {
      await new NoichuGuildManager(interaction.guild, targetChannel).sendMenuSelector(interaction);
      return;
    }

    const channelManager = new NoichuChannelManager(interaction.guild, targetChannel);
    if (!(await channelManager.checkConfigIsAvailable(interaction, false))) return;
    else await channelManager.sendSettingEditInterface(interaction);
  },
};
