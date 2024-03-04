const { SlashCommandSubcommandBuilder, SlashCommandUserOption, Client, BaseInteraction } = require("discord.js");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`global`)
    .setDescription(`Delete all message in guild from user`)
    .addUserOption(new SlashCommandUserOption().setName(`target`).setDescription(`Target user`).setRequired(true)),
  /**
   *
   * @param {BaseInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const guild = interaction.guild;
  },
};
