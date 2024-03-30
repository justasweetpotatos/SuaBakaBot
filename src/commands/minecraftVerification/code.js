const {
  SlashCommandStringOption,
  CommandInteraction,
  Client,
  SlashCommandSubcommandBuilder,
} = require("discord.js");

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
    await client.authSessionManager.checkAuthCode(interaction, interaction.user, verifyCode);
  },
};
