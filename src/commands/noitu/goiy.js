const {
  SlashCommandSubcommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  ActionRow,
  ActionRowBuilder,
  Colors,
} = require("discord.js");
const { NoituTiengVietChannelConfig } = require("../../typings");
const { autoBuildButton } = require("../../utils/autoBuild");

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName(`goi-y`).setDescription(`Lấy gợi ý.`),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ fetchReply: true });

    const channelConfig = new NoituTiengVietChannelConfig(interaction.channel.id, interaction.guild.id);
    if (!(await channelConfig.sync())) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thất bại !`)
            .setDescription(`*kênh không được set để chơi nối từ !*`)
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    const confirmButton = autoBuildButton(client.buttons.get(`word-confirm-get-suggestion-btn`).data);
    const cancelButton = autoBuildButton(client.buttons.get(`word-cancel-get-suggestion-btn`).data);
    const actionRow = new ActionRowBuilder().addComponents([confirmButton, cancelButton]);
    const embed = new EmbedBuilder().setTitle(`Bạn có chắc muốn lấy gợi ý không ?`).setColor(Colors.Yellow);

    await interaction.editReply({ embeds: [embed], components: [actionRow] });
  },
};
