const { SlashCommandSubcommandBuilder, SlashCommandChannelOption, EmbedBuilder, Colors, Embed } = require("discord.js");

const { removeChannel } = require(`../../functions/noichu/noichuFunction`);

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("remove")
    .setDescription("Rmove kênh để chơi nối chữ ! (Thao tác không xóa kênh)")
    .addChannelOption(new SlashCommandChannelOption().setName(`channel`).setDescription(`Channel`).setRequired(true)),
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction, client) {
    await removeChannel(interaction, interaction.channelId);
  },
};
