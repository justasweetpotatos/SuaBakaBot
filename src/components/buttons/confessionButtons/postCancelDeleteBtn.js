const { ButtonStyle, ButtonInteraction, Client } = require("discord.js");
const logger = require("../../../utils/logger");

module.exports = {
  data: {
    customId: `confession-post-cancel-delete-btn`,
    label: `Cancel`,
    buttonStyle: ButtonStyle.Success,
  },

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.message?.delete();
    } catch (error) {
      logger.errors.component(`Error on executing event button ${this.data.customId}: ${error}`);
    }
  },
};
