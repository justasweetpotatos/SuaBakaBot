const { SlashCommandBuilder, CommandInteraction, Client } = require("discord.js");
const createPost = require(`./createConfessionPost`);
const createConfessionChannel = require("./createConfessionChannel");
const createConfessionGenerator_postType = require("./createConfessionGenerator_postType");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`confession`)
    .setDescription(`any`)
    .addSubcommand(createPost.data)
    .addSubcommand(createConfessionChannel.data)
    .addSubcommand(createConfessionGenerator_postType.data),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {},
};
