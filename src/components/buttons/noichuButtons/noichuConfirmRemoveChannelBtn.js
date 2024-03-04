const { ButtonStyle, EmbedBuilder, Colors, ActionRowBuilder } = require("discord.js");
const { removeChannel } = require("../../../functions/noichu/noichuFunction");
const { autoBuildButton } = require("../../../utils/autoBuild");

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
    const beforeInteractionMessage = interaction.message;
    await removeChannel(interaction, interaction.message.embeds[0].title.match(/\d+/)[0]);
    await beforeInteractionMessage.delete();
  },
};
