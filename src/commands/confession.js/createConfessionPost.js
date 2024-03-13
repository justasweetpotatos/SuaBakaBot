const {
  CommandInteraction,
  Client,
  SlashCommandSubcommandBuilder,
  ForumChannel,
  SlashCommandChannelOption,
  SlashCommandAttachmentOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const {
  ConfesisonPostChannelManager,
  ConfessionPost,
} = require("../../functions/confessionSystem/Confession");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`create-post`)
    .setDescription(`Create a confeesion !`)
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName(`anonymous`)
        .setDescription(`Display your name or not.`)
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`content`)
        .setDescription(`Content of your confession.`)
        .setRequired(true)
    )
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName(`channel`)
        .setDescription(`Channel must be Confessson channel !`)
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName(`name`)
        .setDescription(`Name of confession !`)
        .setRequired(false)
    )
    .addAttachmentOption(
      new SlashCommandAttachmentOption()
        .setName(`attachments`)
        .setDescription(`Add image or file !`)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const anonymous = interaction.options.get(`anonymous`).value;
    const confessionName = interaction.options.get(`name`)?.value;
    const confessionContent = interaction.options.get(`content`).value;
    const targetChannel = interaction.options.get(`channel`).channel;
    const attachments = interaction.options.get(`attachments`);

    const channelManager = new ConfesisonPostChannelManager(targetChannel.id, interaction.guildId);
    if (!(await channelManager.sync())) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Thao tác thất bại`)
            .setDescription(`*Kênh <#${targetChannel.id}> không thể gửi confession post !*`)
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    const post = new ConfessionPost(
      "",
      interaction.user.id,
      targetChannel.id,
      interaction.guildId,
      confessionName,
      confessionContent,
      anonymous,
      true
    );

    await channelManager.createPost(interaction, post);

    await interaction.editReply({ content: `done !` });
  },
};
