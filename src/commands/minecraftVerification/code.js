const {
  SlashCommandStringOption,
  CommandInteraction,
  Client,
  SlashCommandSubcommandBuilder,
} = require("discord.js");
const { bindAction } = require("../../functions/discordAuth/action/bindAction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`code`)
    .setDescription(`Xác minh !`)
    .addStringOption(
      new SlashCommandStringOption().setName(`code`).setDescription(`Mã xác minh !`).setRequired(true)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const verifyCode = interaction.options.get(`code`).value;
    await bindAction(interaction, verifyCode);
  },
};
