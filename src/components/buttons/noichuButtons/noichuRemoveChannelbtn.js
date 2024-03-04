const {
  ButtonStyle,
  EmbedBuilder,
  Colors,
  ActionRowBuilder,
  ButtonInteraction,
  Client,
  EmbedAssertions,
} = require("discord.js");
const { autoBuildButton } = require("../../../utils/autoBuild");
const { getNoichuChannelConfig } = require("../../../database/guildData");

module.exports = {
  data: {
    customId: `noichu-remove-channel-btn`,
    label: `Remove`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const targetChannelId = interaction.message.embeds[0].title.match(/\d+/)[0];

    if (!(await getNoichuChannelConfig(targetChannelId))) {
      await interaction.message.delete();
      await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setTitle(`Config has been deleted !`).setColor(Colors.Red)],
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Bạn có muốn loại kênh nối chữ <#${targetChannelId}> không ?`)
      .setDescription(`*Thao tác không xóa kênh đang set !*`)
      .setColor(Colors.Yellow);

    const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`).data);
    closeButton.setStyle(ButtonStyle.Primary);
    const confirmButton = autoBuildButton(client.buttons.get(`noichu-confirm-remove-channel-btn`).data);
    const actionRow = new ActionRowBuilder().addComponents([confirmButton, closeButton]);

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  },
};
