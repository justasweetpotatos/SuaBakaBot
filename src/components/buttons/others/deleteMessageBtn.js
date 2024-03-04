const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `delete-message-btn`,
    label: `Delete Message`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client, execute) {
    const message = interaction.message.delete();
  },
};
