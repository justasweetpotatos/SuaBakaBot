const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
  CommandInteraction,
  Client,
  EmbedBuilder,
  Colors,
} = require("discord.js");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`emoji`)
    .setDescription(`Reaction by emoji.`)
    .addStringOption(
      new SlashCommandStringOption().setName(`message-id`).setDescription(`Id of target message.`)
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ fetchReply: true });

    const messageId = interaction.options.get(`message-id`).value;

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message || message.size > 1) {
      const embed = new EmbedBuilder()
        .setTitle(`Thao tác thất bại !`)
        .setDescription(`**Id tin nhắn không hợp lệ !**`)
        .setColor(Colors.Red);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    
  },
};
