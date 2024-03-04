const { SlashCommandBuilder, Client, Interaction } = require("discord.js");
const unloadCommand = require("./unloadCommandModule");
const reloadCommandModule = require("./reloadCommandModule");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`command`)
    .setDescription(`any`)
    .addSubcommand(unloadCommand.data)
    .addSubcommand(reloadCommandModule.data),
  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {},
};
