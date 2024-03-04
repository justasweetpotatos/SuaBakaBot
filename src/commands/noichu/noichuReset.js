const { SlashCommandSubcommandBuilder, SlashCommandChannelOption } = require("discord.js");
const { reset } = require("../../functions/noichu/noichuFunction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("reset")
    .setDescription("Reset nối chữ game")
    .addChannelOption(
      new SlashCommandChannelOption().setName(`channel`).setDescription(`Reset game nối chữ !`).setRequired(true)
    ),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction, client) {
    await reset(interaction, interaction.options.get(`channel`).value);
  },
};
