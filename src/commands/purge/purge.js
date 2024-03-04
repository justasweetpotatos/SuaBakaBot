const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const purgeBy = require("./purgeBy");
const purgeBot = require("./purgeBot");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`purge`)
    .setDescription(`any`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(purgeBy.data)
    .addSubcommand(purgeBot.data),
  async execute(interaction, client) {},
};
