const {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
  CommandInteraction,
} = require("discord.js");
const { findMessages } = require("../../functions/purge/messageFinder");
const logger = require("../../utils/logger");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("by")
    .setDescription("Delete message by user or timestamp or both")
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName("amount")
        .setDescription("Amount of message.")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addUserOption(
      new SlashCommandUserOption().setName("user").setDescription("Target user to delete messages.")
    )
    .addStringOption(new SlashCommandStringOption().setName("from").setDescription("Id of start message"))
    .addStringOption(new SlashCommandStringOption().setName("to").setDescription("Id of end message")),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    replyingMesssage = await interaction.deferReply({ ephemeral: true });
    try {
      const channel = interaction.channel;
      const amount = interaction.options.get("amount")?.value;
      const userId = interaction.options.get("user")?.value;
      const startMsgId = interaction.options.get("from")?.value;
      const endMsgId = interaction.options.get("to")?.value;

      const valid = async () => {
        try {
          if (startMsgId && (await channel.messages.fetch(startMsgId))) return true;
          if (endMsgId && (await channel.messages.fetch(endMsgId))) return true;
          return true;
        } catch (error) {
          return false;
        }
      };

      if (!(await valid())) {
        const embed = new EmbedBuilder()
          .setTitle(`Thao tác thất bại !`)
          .setColor(Colors.Red)
          .setDescription(`Id tin nhắn không hợp lệ !`);
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const { messages, userData, bulkDeltableMessages } = await findMessages(
        channel,
        userId,
        startMsgId,
        endMsgId,
        amount
      );

      let fields = [];
      for (const item of userData)
        fields.push({
          name: "-",
          value: `**${item[1].user.username}: ${item[1].messages.length}**`,
          inline: false,
        });

      const embed = new EmbedBuilder()
        .setTitle(`Thao tác hoàn tất !`)
        .setDescription(`Đã xóa ${messages.length} tin nhắn !`)
        .addFields(fields.splice(0, 25))
        .setColor(Colors.Green)
        .setFooter({ text: `Và hơn ${userData.size - 25 > 0 ? userData.size - 25 : 0} người dùng khác !` });

      await channel.bulkDelete(bulkDeltableMessages);

      await Promise.all(
        messages.map(async (message) => {
          if (message.deletable) await message.delete();
        })
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.errors.command(`Error on executing command ${this.data.name}: ${err}`);
    }
  },
};
