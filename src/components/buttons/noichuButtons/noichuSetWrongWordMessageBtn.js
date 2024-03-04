const { ButtonStyle, EmbedBuilder, Colors } = require("discord.js");
const { NoichuChannelConfig } = require("../../../typings");

module.exports = {
  data: {
    customId: `noichu-wrong-messages-set-btn`,
    label: `Wrong Message Setter`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client, execute) {
    !interaction.deferred ? await interaction.deferReply({ fetchReply: true }) : "";

    const configMessage = interaction.message;
    const targetChannelId = configMessage.embeds[0].title.match(/\d+/)[0];
    const channelConfig = new NoichuChannelConfig({}, targetChannelId, interaction.guildId);

    if (!(await channelConfig.sync())) {
      const messageEmbed = new EmbedBuilder().setTitle(`Config doesn't exist !`).setColor(Colors.Red);
      await configMessage.delete();
      await interaction.editReply({ embeds: [messageEmbed] });
      return;
    } else {
      
    }
  },
};
