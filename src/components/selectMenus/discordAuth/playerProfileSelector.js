const { StringSelectMenuInteraction, Client } = require("discord.js");

module.exports = {
  data: {
    customId: `minecraft-player-profile-selector`,
  },
  /**
   *
   * @param {StringSelectMenuInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const option = interaction.values[0];
    await client.authSessionManager.createAuthSession(interaction, interaction.user, option);
  },
};
