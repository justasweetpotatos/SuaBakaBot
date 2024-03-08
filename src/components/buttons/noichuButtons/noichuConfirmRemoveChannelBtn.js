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
    const mn = new NoichuGuildManager(interaction.guildId, interaction.channelId);
    const beforeInteractionMessage = interaction.message;
    await mn.removeChannel(interaction, interaction.message.embeds[0].title.match(/\d+/)[0]);
    await beforeInteractionMessage.delete();
  },
};
