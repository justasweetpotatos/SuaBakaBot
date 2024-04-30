const {
  SlashCommandSubcommandBuilder,
  CommandInteraction,
  Client,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  Colors,
  EmbedBuilder,
} = require("discord.js");
const { sendNotificationEmbedMessage, MessageWarnLevel } = require("../../utils/message");
const { autoBuildButton } = require("../../utils/autoBuild");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("link-account")
    .setDescription("Link this discord account to verify."),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const verifyChannelId = "1223555669781774467";

    if (interaction.channelId !== verifyChannelId) {
      await sendNotificationEmbedMessage(
        interaction,
        undefined,
        `bạn chỉ có thể sử dụng command này tại kênh <#${verifyChannelId}>`,
        MessageWarnLevel.WARNING,
        true
      );
      return;
    }

    const options = [];
    (await client.authSessionManager.getPlayerProfiles()).forEach((profile) => {
      options.push(new StringSelectMenuOptionBuilder({ label: profile.name, value: profile.uuid }));
    });

    const chunkedOptions = (() => {
      const res = [];
      for (let i = 0; i >= 0; i += 25) {
        if (i+25 > options.length) {
          res.push(options.slice(i, options.length));
          break;
        }
        res.push(options.slice(i, (i + 25)));
      }
        
      return res;
    })();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("minecraft-player-profile-selector")
      .setPlaceholder("Chọn profile có ở đây !")
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(chunkedOptions[0]);
    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    const nextButton = autoBuildButton(client.buttons.get(`discord-auth-next-page-profile-btn`).data);
    const prevButton = autoBuildButton(client.buttons.get(`discord-auth-prev-page-profile-btn`).data);
    const closeButotn = autoBuildButton(client.buttons.get(`discord-auth-close-message-btn`).data);
    const wigetActionRow = new ActionRowBuilder().addComponents([prevButton, nextButton, closeButotn]);

    const infEmbed = new EmbedBuilder({
      title: `Xác minh minecraft tài khoản discord !`,
      description: `*Hãy chọn tên tài khoản của bạn*
          *Lưu ý: Hãy vào server lần đầu để đăng ký dữ liệu người chơi !*
          *Lưu ý: Hãy chọn đúng tài khoải để xác minh, nếu có lỗi, hãy liên hệ ngay với admin <@866628870123552798>*
          `,
      color: Colors.Blurple,
    });

    const wigetEmbed = new EmbedBuilder({
      title: `Trang 1`,
      description: `Tổng số: ${chunkedOptions.length}`,
      color: Colors.Blurple,
    });

    await interaction.reply({ embeds: [infEmbed, wigetEmbed], components: [wigetActionRow, actionRow] });
  },
};
