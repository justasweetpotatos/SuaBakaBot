const { ButtonStyle, ButtonInteraction, Client, EmbedBuilder, Colors } = require("discord.js");
const { NoituChecker } = require("../../../functions/noichu/noichuFunction");

module.exports = {
  data: {
    customId: `word-confirm-get-suggestion-btn`,
    label: `Confirm`,
    buttonStyle: ButtonStyle.Success,
  },

  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   * @param {*} execute
   */
  async execute(interaction, client, execute) {
    const beforeInteractionMessage = interaction.message;
    await interaction.deferReply({ fetchReply: true });

    const checker = new NoituChecker(interaction.channelId, interaction.guildId);

    if (!(await checker.syncConfig())) {
      const interactionMessage = await interaction.editReply({
        embeds: [new EmbedBuilder().setTitle(`Config doesn't exist !`).setColor(Colors.Red)],
      });
      beforeInteractionMessage.deletable ? await beforeInteractionMessage.delete() : "";
      setTimeout(async () => {
        interactionMessage.deletable ? await interactionMessage.delete() : "";
      }, 5000);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Gợi ý:`)
      .setDescription(`***${await checker.getRamdomSuggetion()}***`)
      .setColor(Colors.Green);

    await interaction.editReply({ content: `<@${interaction.user.id}>`, embeds: [embed] });
    beforeInteractionMessage.deletable ? await beforeInteractionMessage.delete() : "";
  },
};
