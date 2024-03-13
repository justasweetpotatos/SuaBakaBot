const { SlashCommandBuilder, CommandInteraction, Client } = require("discord.js");
const channelComamnd = require("./channel");

module.exports = {
  data: new SlashCommandBuilder().setName(`backup`).setDescription(`any`).addSubcommand(channelComamnd.data),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {},
};
