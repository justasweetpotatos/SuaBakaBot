const { ButtonStyle, EmbedBuilder, Colors, ActionRowBuilder, ButtonInteraction, Client } = require("discord.js");
const { autoBuildButton } = require("../../../utils/autoBuild");
const { NoichuChannelConfig } = require("../../../typings");

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

    const config = new NoichuChannelConfig(targetChannelId, interaction.guildId);

    if (!(await config.sync(targetChannelId))) {
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
