const {
  ButtonInteraction,
  Client,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
  EmbedBuilder,
  Colors,
  TextChannel,
} = require("discord.js");
const logger = require("../../../utils/logger");
const { ConfessionPost } = require("../../../functions/confessionSystem/ConfessionFunction");
const { GuildGlobalConfig } = require("../../../functions/guildConfig/guildGlobalConfig");

module.exports = {
  data: {
    customId: `confession-post-report-btn`,
    label: `Report`,
    buttonStyle: ButtonStyle.Danger,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      const channelPost = interaction.channel;

      const post = new ConfessionPost(channelPost.id, "", "", interaction.guildId);

      await post.reSync();

      const guildConfig = new GuildGlobalConfig(interaction.guildId, interaction.guild.name);
      if (!(await guildConfig.sync())) await guildConfig.update();

      if (!guildConfig.reportChannelId) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thất bại !`)
              .setDescription(`*Server chưa được set kênh report-logs !*`)
              .setColor(Colors.Red),
          ],
        });
        return;
      }

      const reportContentInput = new TextInputBuilder()
        .setCustomId(`confession-post-report-modal-${post.id}-reason-input`)
        .setLabel(`Nội dung:`)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const actionRow = new ActionRowBuilder().addComponents(reportContentInput);

      const createdTimestamp = new Date().getTime();
      const reportId = `${post.id}${createdTimestamp}`;

      const modal = new ModalBuilder()
        .setCustomId(`confession-post-report-modal-${post.id}`)
        .setTitle(`Report id: ${reportId}`)
        .addComponents([actionRow]);
      await interaction.showModal(modal);

      await interaction.awaitModalSubmit({ time: 600_00 }).then(async (modalSubmitInteraction) => {
        await modalSubmitInteraction.deferReply({ ephemeral: true });

        if (modalSubmitInteraction.customId !== `confession-post-report-modal-${post.id}`) return;

        const reportContent = modalSubmitInteraction.fields.getTextInputValue(
          `confession-post-report-modal-${post.id}-reason-input`
        );

        const reportChannel = interaction.guild.channels.cache.get(guildConfig.reportChannelId);
        if (reportChannel instanceof TextChannel)
          await reportChannel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Report for confession id: ${post.id}`)
                .setDescription(
                  `\`Target\`: <#${post.id}>
                \`From\`: <@${interaction.user.id}>
                \`Content\`: **${reportContent}**
                `
                )
                .setFooter({ text: `${reportId}` })
                .setTimestamp(createdTimestamp)
                .setColor(Colors.Yellow),
            ],
          });

        await modalSubmitInteraction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác hoàn tất !`)
              .setDescription(`*Đã gửi report !*`)
              .setColor(Colors.Green),
          ],
        });
      });
    } catch (error) {
      console.log(error);
      logger.errors.component(`Error on executing button event ${this.data.customId}: ${error}`);
    }
  },
};
