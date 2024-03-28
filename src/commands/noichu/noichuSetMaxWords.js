const {
  SlashCommandSubcommandBuilder,
  SlashCommandNumberOption,
  SlashCommandChannelOption,
  Client,
  CommandInteraction,
} = require("discord.js");
const { NoichuChannelManager } = require("../../functions/noichu/manager");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`max-words`)
    .setDescription(`Set max words to reset game.`)
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`channel`)
        .setDescription(`Kênh nối chữ được set`)
        .setRequired(true)
    )
    .addNumberOption(
      new SlashCommandNumberOption().setName(`amount`).setDescription(`Number`).setRequired(true)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const targetChannel = interaction.options.get(`channel`).channel;
    const amount = interaction.options.get(`amount`).value;

    await new NoichuChannelManager(interaction.guild, targetChannel).setLimit(interaction, amount);
  },
};
