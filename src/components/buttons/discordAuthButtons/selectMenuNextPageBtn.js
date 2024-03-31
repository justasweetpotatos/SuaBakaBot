const {
  ButtonStyle,
  ButtonInteraction,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const { autoBuildButton } = require("../../../utils/autoBuild");

module.exports = {
  data: {
    customId: `discord-auth-next-page-profile-btn`,
    label: `Next`,
    buttonStyle: ButtonStyle.Success,
  },
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    const embed = interaction.message.embeds[1];
    let pageIndex = parseInt(embed.description.replace(/\D/g, ""));

    const options = [];
    (await client.authSessionManager.getPlayerProfiles()).forEach((profile) => {
      options.push(new StringSelectMenuOptionBuilder({ label: profile.name, value: profile.uuid }));
    });

    const chunkedOptions = (() => {
      const res = [];
      for (let i = 0; i < options.length; i += 25) res.push(options.slice(i, (i += options.length)));
      return res;
    })();

    if (pageIndex >= chunkedOptions.length) {
      pageIndex = 1;
    } else {
      pageIndex += 1;
    }

    const selectMenu = new StringSelectMenuBuilder({})
      .setCustomId(`minecraft-player-profile-selector`)
      .setPlaceholder(`Chọn profile có ở đây !`)
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(chunkedOptions[pageIndex - 1]);
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
      title: `Trang ${pageIndex}`,
      description: `Tổng số: ${chunkedOptions.length}`,
      color: Colors.Blurple,
    });

    await interaction.message.edit({
      embeds: [infEmbed, wigetEmbed],
      components: [wigetActionRow, actionRow],
    });

    await interaction.reply({ content: `done`, ephemeral: true });
  },
};
