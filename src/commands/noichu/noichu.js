const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const noichuConfig = require("./noichuConfig");
const noichuReset = require(`./noichuReset`);
const noichuSetChannel = require("./noichuSetChannel");
const noichuRemoveChannel = require("./noichuRemoveChannel");
const noichuSetMaxWords = require("./noichuSetMaxWords");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noichu")
    .setDescription("Game nối từ tiếng anh !")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((command) =>
      command.setName(noichuSetChannel.data.name).setDescription(noichuSetChannel.data.description)
    )
    .addSubcommand(noichuReset.data)
    .addSubcommand(noichuConfig.data)
    .addSubcommand(noichuRemoveChannel.data)
    .addSubcommand(noichuSetMaxWords.data),
  async execute(interaction, client) {},
};
