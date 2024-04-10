const { SlashCommandSubcommandBuilder, SlashCommandChannelOption } = require("discord.js");

const { NoichuGuildManager } = require("../../functions/noichu/manager");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("set")
    .setDescription("Set kênh để chơi nối chữ !")
    .addChannelOption(new SlashCommandChannelOption().setName(`channel`).setDescription(`Channel`)),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction, client) {
    const targetChannel = interaction.channel;
    await new NoichuGuildManager(interaction.guild).setChannel(interaction, targetChannel);
  },
};
