const { SlashCommandBuilder } = require("discord.js");
const link = require("./link");
const code = require("./code");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-server")
    .setDescription("any")
    .addSubcommand(link.data)
    .addSubcommand(code.data),
  async execute(interaction, client) {},
};
