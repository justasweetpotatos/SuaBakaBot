const { SlashCommandSubcommandBuilder, CommandInteraction, Client } = require("discord.js");
const { unbindAction } = require("../../functions/discordAuth/actions/unbindAction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`unlink`)
    .setDescription(`Unlink với tài khoản minecraft !`),

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await unbindAction(interaction);
  },
};
