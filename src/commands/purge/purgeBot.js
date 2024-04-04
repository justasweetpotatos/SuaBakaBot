const {
  Interaction,
  SlashCommandSubcommandBuilder,
  SlashCommandNumberOption,
  Client,
  EmbedBuilder,
  Colors,
} = require("discord.js");

const logger = require("../../utils/logger");
const { findBotMessages } = require("../../functions/purge/messageFinder");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`bot`)
    .setDescription("Xóa tin nhắn của bot.")
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName(`amount`)
        .setDescription(`Number of message to seach.`)
        .setRequired(true)
    ),

  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.channel;
      const amount = interaction.options.get(`amount`).value;

      const {
        messages: messages,
        messagesBullkDeletable: messagesBullkDeletable,
        userData: userData,
      } = await findBotMessages({ targetChannel: channel, amount: amount });

      let fields = [];
      for (const item of userData)
        fields.push({
          name: "-",
          value: `**${item[1].user.username}: ${item[1].messages.length}**`,
          inline: false,
        });

      const embed = new EmbedBuilder()
        .setTitle(`**Đã xóa: ${messages.size + messagesBullkDeletable.size} tin nhắn**`)
        .setColor(Colors.Green)
        .addFields(fields.splice(0, 25))
        .setFooter({ text: `Và hơn ${userData.size - 25 > 0 ? userData.size - 25 : 0} người dùng khác !` });

      await Promise.all(messages.map((message) => message.delete()));
      await channel.bulkDelete(messagesBullkDeletable);

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.errors.server(`Error on executing command name ${this.data.name}: ${err}`);
    }
  },
};
