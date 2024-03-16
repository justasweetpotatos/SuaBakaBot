const { SlashCommandBuilder, CommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName(`reaction-role`).setDescription(`any`),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {},
};
