const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName(`r-role`).setDescription(`Reaction role system.`),
  async execute(interaction, client) {},
};
