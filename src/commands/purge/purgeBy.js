const {
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
  SlashCommandStringOption,
  EmbedBuilder,
  Colors,
  CommandInteraction,
} = require("discord.js");
const { findMessagesByUser } = require("../../functions/purge/messageFinder");
const logger = require("../../utils/logger");
const { sendNotificationEmbedMessage, MessageWarnLevel } = require("../../utils/message");

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName("by")
    .setDescription("Delete message by user or timestamp or both")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("from")
        .setDescription("Id of message to start find.")
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("to")
        .setDescription("Id of message to stop find.")
        .setRequired(true)
    )
    .addUserOption(
      new SlashCommandUserOption().setName("user").setDescription("Target user to delete messages.")
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {*} client
   */
  async execute(interaction, client) {
    replyingMesssage = await interaction.deferReply({ ephemeral: true });
    try {
      const channel = interaction.channel;
      const targetUser = interaction.options.get("user")?.user;
      const startMsgId = interaction.options.get("from").value;
      const endMsgId = interaction.options.get("to").value;

      let startMsg = await channel.messages.fetch(startMsgId);
      let endMsg = await channel.messages.fetch(endMsgId);

      if (!startMsg || !endMsg) {
        await sendNotificationEmbedMessage(
          interaction,
          undefined,
          `Id tin nhắn không hợp lệ !`,
          MessageWarnLevel.ERROR,
          true
        );
        return;
      }

      const result = await findMessagesByUser({
        targetChannel: channel,
        targetUser: targetUser,
        startMsg: startMsg,
        endMsg: endMsg,
      });

      let fields = [];
      for (const item of result.userData) {
        fields.push({
          name: "-",
          value: `**${item[1].user.id}: ${item[1].messages.length}**`,
          inline: false,
        });
      }

      await channel.bulkDelete(result.messagesBullkDeletable);

      await Promise.all(
        result.messages.map(async (message) => {
          if (message.deletable) await message.delete();
        })
      );

      const embed = new EmbedBuilder()
        .setTitle(`Thao tác hoàn tất !`)
        .setDescription(`Đã xóa ${result.messages.size + result.messagesBullkDeletable.size} tin nhắn !`)
        .addFields(fields.splice(0, 25))
        .setColor(Colors.Green)
        .setFooter({
          text: `Và hơn ${result.userData.size - 25 > 0 ? result.userData.size - 25 : 0} người dùng khác !`,
        });
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.errors.command(`Error on executing command ${this.data.name}: ${err}`);
    }
  },
};
