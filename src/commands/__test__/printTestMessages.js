const { SlashCommandBuilder, SlashCommandNumberOption, Interaction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`print-sample`)
    .setDescription(`any`)
    .addNumberOption(new SlashCommandNumberOption().setName(`amount`).setDescription(`any`).setRequired(true)),
  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    for (let i = 1; i <= interaction.options.get(`amount`).value; i++) {
      await interaction.channel.send(i.toString());
    }
    await interaction.editReply({ content: `done` });
  },
};
