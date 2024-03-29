const { SlashCommandSubcommandBuilder, SlashCommandChannelOption } = require("discord.js");

const { NoichuGuildManager } = require("../../functions/noichu/manager");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Rmove kênh để chơi nối chữ ! (Thao tác không xóa kênh)")
    .addChannelOption(
      new SlashCommandChannelOption().setName(`channel`).setDescription(`Channel`).setRequired(true)
    ),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction, client) {
    await new NoichuGuildManager(interaction.guild).unsetChannel(interaction, interaction.channel);
  },
};
