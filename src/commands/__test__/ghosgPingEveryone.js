const { SlashCommandBuilder, CommandInteraction, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName(`ping-everyone`).setDescription(`any`),

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const msg = await interaction.channel.send({ content: `@everyone` });
    await msg.delete();
    await interaction.reply({ content: `Done`, ephemeral: true });
  },
};
