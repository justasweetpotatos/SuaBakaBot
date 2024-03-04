const {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const { findMessages } = require("../../utils/purge/messageFinder");

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
    .addUserOption(new SlashCommandUserOption().setName("user").setDescription("Target user to delete messages."))
    .addStringOption(new SlashCommandStringOption().setName("from").setDescription("Id of start message"))
    .addStringOption(new SlashCommandStringOption().setName("to").setDescription("Id of end message")),
  /**
   *
   * @param {import("discord.js").Interaction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    replyingMesssage = await interaction.deferReply({ ephemeral: true });
    try {
      const channel = interaction.channel;
      const amount = interaction.options.get("amount")?.value;
      const user = interaction.options.get("user")?.value;
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

      const { messages: collectedMessages, userData: userData } = await findMessages(
        channel,
        user,
        startMsgId,
        endMsgId,
        amount
      );

      let fields = [];
      for (const item of userData)
        fields.push({ name: "-", value: `**${item[1].user.username}: ${item[1].messages.length}**`, inline: false });

      const embed = new EmbedBuilder()
        .setTitle(`Thao tác hoàn tất !`)
        .setDescription(`Đã xóa ${collectedMessages.length} tin nhắn !`)
        .addFields(fields.splice(0, 25))
        .setColor(Colors.Green)
        .setFooter({ text: `Và hơn ${userData.size - 25 > 0 ? userData.size - 25 : 0} người dùng khác !` });

      await Promise.all(
        collectedMessages.map(async (message) => {
          if (message.deletable) await message.delete();
        })
      );
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `error ! ${err}` });
      console.log(err);
    }
  },
};
