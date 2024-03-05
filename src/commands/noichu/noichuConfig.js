const {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  Colors,
} = require("discord.js");
const { autoBuildChannelMenu, autoBuildButton } = require("../../utils/autoBuild");
const { configChannel } = require("../../functions/noichu/noichuFunction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("config")
    .setDescription("Configuration nối chữ game !")
    .addChannelOption(new SlashCommandChannelOption().setName(`channel`).setDescription(`Chọn kênh để cài đặt.`)),
  /**
   * @param {import('discord.js').CommandInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeram: false });

    const targetChannel = interaction.options.get(`channel`);
    if (!targetChannel) {
      const selectChannelMenu = autoBuildChannelMenu(client.selectMenus.get(`noichu-exist-channel-selector`).data);

      const actionRow1 = new ActionRowBuilder().addComponents(selectChannelMenu);
      const actionRow2 = new ActionRowBuilder();
      const embed = new EmbedBuilder()
        .setTitle(`Cài đặt game nối chữ !`)
        .setDescription(`*Chọn một kênh để bắt đầu !*`)
        .setColor(Colors.Blurple);
      const closeButton = autoBuildButton(client.buttons.get(`noichu-close-message-btn`));
      actionRow2.addComponents([closeButton]);

      await interaction.editReply({ embeds: [embed], components: [actionRow1, actionRow2] });
    } else await configChannel(interaction, targetChannel.id, client);
  },
};
