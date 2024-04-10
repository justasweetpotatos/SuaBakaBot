const {
  SlashCommandSubcommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  ActionRow,
  ActionRowBuilder,
  Colors,
} = require("discord.js");
const { NoituChannelConfig } = require("../../typings");
const { autoBuildButton } = require("../../utils/autoBuild");
const { NoituChannelConfigRepository } = require("../../database/repository");

module.exports = {
  data: new SlashCommandSubcommandBuilder().setName(`goi-y`).setDescription(`Lấy gợi ý.`),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ fetchReply: true });

    const channelConfig = new NoituChannelConfig(interaction.channel.id, interaction.guild.id);
    const repository = new NoituChannelConfigRepository();
    if (!(await repository.sync(channelConfig))) {
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

    const confirmButton = autoBuildButton(client.buttons.get(`noitu-confirm-get-suggestion-btn`).data);
    const cancelButton = autoBuildButton(client.buttons.get(`word-cancel-get-suggestion-btn`).data);
    const actionRow = new ActionRowBuilder().addComponents([confirmButton, cancelButton]);
    const embed = new EmbedBuilder().setTitle(`Bạn có chắc muốn lấy gợi ý không ?`).setColor(Colors.Yellow);

    await interaction.editReply({ embeds: [embed], components: [actionRow] });
  },
};
