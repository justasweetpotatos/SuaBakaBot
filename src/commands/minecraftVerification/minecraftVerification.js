const { SlashCommandBuilder } = require("discord.js");
const link = require("./link");
const code = require("./code");
const unlink = require("./unlink");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mc-server")
    .setDescription("any")
    .addSubcommand(link.data)
    .addSubcommand(code.data)
    .addSubcommand(unlink.data),
  async execute(interaction, client) {},
};
