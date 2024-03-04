const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `noichu-close-message-btn`,
    label: `Close`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client, execute) {
    await interaction.message.delete();
  },
};
