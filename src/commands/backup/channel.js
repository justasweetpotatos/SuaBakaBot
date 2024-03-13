const {
  SlashCommandSubcommandBuilder,
  SlashCommandChannelOption,
  CommandInteraction,
  Client,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const { BackupSystem } = require("../../functions/backupSystem/backupFunction");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`channel`)
    .setDescription(`Backup Message in channel (not include file !)`)
    .addChannelOption(
      new SlashCommandChannelOption().setName(`channel`).setDescription(`Channel to start backup !`).setRequired(true)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ fetchReply: true });

    const targetChannel = interaction.options.get(`channel`).channel;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Khởi động quá trình backup...`)
          .setColor(Colors.Blurple)
          .setDescription(`***Quá trình sẽ tốn nhiều thời gian nếu như kênh của bạn có nhiều tin nhắn !***`),
      ],
    });

    const { status, countOfMessage, countOfFailedMessage, statusMessage } = await new BackupSystem(
      interaction.guildId
    ).backupMessages(interaction, targetChannel);

    switch (status) {
      case 1:
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thành công !`)
              .addFields([
                { name: `*Số tin nhắn đã đẩy lên: *`, value: `${countOfMessage}` },
                { name: `*Số tin nhắn bị lỗi: *`, value: `${countOfFailedMessage}` },
              ])
              .setColor(Colors.Green),
          ],
        });
        break;
      case 2:
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác thành công !`)
              .addFields([
                { name: `*Đã đẩy ${countOfMessage} tin nhắn lên server !*` },
                { name: `Số lượng tin nhắn không thể đẩy lên server: ${countOfFailedMessage}` },
                { name: `*Một số tin nhắn có chứa ký tự không hợp lệ hoặc lỗi insert !*` },
              ])
              .setColor(Colors.Green),
          ],
        });
        break;
      case 3:
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Thao tác bị gián đoạn !`)
              .setDescription(`*Lỗi không xác định !*`)
              .setColor(Colors.Yellow),
          ],
        });
        break;
    }

    // After sent complete message 10 seconds, delete the status message
    setTimeout(async () => {
      await statusMessage.delete();
    }, 10000);
  },
};
