const { SlashCommandBuilder, CommandInteraction, Client } = require("discord.js");
const goiy = require("./goiy");

module.exports = {
  data: new SlashCommandBuilder().setName(`noitu`).setDescription(`any`).addSubcommand(goiy.data),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {},
};
