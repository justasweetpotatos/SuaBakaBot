const { ButtonStyle } = require("discord.js");

module.exports = {
  data: {
    customId: `close-btn`,
    label: `Hủy bỏ`,
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
