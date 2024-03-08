const { ButtonStyle, EmbedBuilder, Colors, ActionRowBuilder } = require("discord.js");
const { NoichuGuildManager } = require("../../../functions/noichu/noichuFunction");

module.exports = {
  data: {
    customId: `noichu-confirm-remove-channel-btn`,
    label: `Confirm`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {import("discord.js").ButtonInteraction} interaction
   * @param {*} client
   * @returns
   */
  async execute(interaction, client) {
    await new NoichuGuildManager().removeChannel(interaction, interaction.message.embeds[0].title.match(/\d+/)[0]);
    await interaction.message.delete();
  },
};
