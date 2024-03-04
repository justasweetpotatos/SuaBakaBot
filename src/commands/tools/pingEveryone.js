const { SlashCommandBuilder, PermissionFlagsBits, Client } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`ping-all`)
    .setDescription(`any`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const message = await interaction.channel.send(`@everyone`);
    await message.delete();
  },
};
