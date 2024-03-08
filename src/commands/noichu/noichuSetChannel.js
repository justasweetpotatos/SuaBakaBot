const { SlashCommandSubcommandBuilder, SlashCommandChannelOption, EmbedBuilder, Colors } = require("discord.js");

const { setChannel, NoichuGuildManager } = require(`../../functions/noichu/noichuFunction`);

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("set")
    .setDescription("Set kênh để chơi nối chữ !")
    .addChannelOption(new SlashCommandChannelOption().setName(`channel`).setDescription(`Channel`)),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction, client) {
    await new NoichuGuildManager().setChannel(interaction, interaction.options?.get(`channel`));
  },
};
