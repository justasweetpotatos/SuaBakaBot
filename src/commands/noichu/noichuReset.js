const {
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  CommandInteraction,
} = require("discord.js");
const { NoichuChannelManager } = require("../../functions/noichu/manager");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("reset")
    .setDescription("Reset nối chữ game")
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`channel`)
        .setDescription(`Reset game nối chữ !`)
        .setRequired(true)
    ),
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction, client) {
    await new NoichuChannelManager(interaction.guild, interaction.options.get(`channel`).channel).reset(
      interaction
    );
  },
};
