const { EmbedBuilder } = require("@discordjs/builders");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandNumberOption,
  SlashCommandChannelOption,
  Client,
} = require("discord.js");
const { setMaxWords, NoichuGuildManager } = require(`../../functions/noichu/noichuFunction`);

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`max-words`)
    .setDescription(`Set max words to reset game.`)
    .addChannelOption(
      new SlashCommandChannelOption().setName(`channel`).setDescription(`Kênh nối chữ được set`).setRequired(true)
    )
    .addNumberOption(new SlashCommandNumberOption().setName(`amount`).setDescription(`Number`).setRequired(true)),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await NoichuGuildManager().setMaxWords(
      interaction,
      interaction.options.get(`channel`).value,
      interaction.options.get(`amount`).value
    );
  },
};
