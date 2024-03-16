const { ButtonStyle, ButtonInteraction, Client } = require("discord.js");

module.exports = {
  data: {
    customId: `word-cancel-get-suggestion-btn`,
    label: `Cancel`,
    buttonStyle: ButtonStyle.Primary,
  },

  /**
   * 
   * @param {ButtonInteraction} interaction 
   * @param {Client} client 
   * @param {any} execute 
   */
  async execute(interaction, client, execute) {
    await interaction.message.delete();
  },
};
