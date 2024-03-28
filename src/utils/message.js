const {
  Message,
  CommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  Colors,
  EmbedBuilder,
  ActionRow,
} = require("discord.js");

/**
 *
 * @param {Message} message
 * @param {Number} time - Miliseconds
 */
async function deleteMessage(message, time) {
  setTimeout(async () => (message.deletable ? await message.delete() : ""), time);
}

class MessageWarnLevel {
  static INFO = 0;
  static SUCCESS = 1;
  static WARNING = 2;
  static ERROR = 3;
}

/**
 *
 * @param {CommandInteraction | ButtonInteraction | ModalSubmitInteraction} interaction
 * @param {import("discord.js").TextBasedChannel} channel
 * @param {String} content
 * @param {MessageWarnLevel} messageWarnLevel
 * @param {Boolean} ephemeral
 */
async function sendNotificationEmbedMessage(interaction, channel, content, messageWarnLevel, ephemeral) {
  let embedColor, embedTitle;

  // Xác định màu sắc cho tin nhắn dựa trên mức độ cảnh báo
  switch (messageWarnLevel) {
    case messageWarnLevel.NORMAL:
      embedColor = Colors.Green; // Màu xanh lá cây cho thông báo bình thường
      embedTitle = `Thao tác thành công !`;
      break;
    case messageWarnLevel.WARNING:
      embedColor = Colors.Yellow; // Màu vàng cho thông báo cảnh báo
      embedTitle = `Thao tác không thể thực hiện !`;
      break;
    case messageWarnLevel.ERROR:
      embedColor = Colors.Red; // Màu đỏ cho thông báo lỗi
      embedTitle = `Thao tác thất bại !`;
      break;
    default:
      embedColor = Colors.Grey; // Màu xám mặc định cho các trường hợp khác
      embedTitle = `Thông báo !`;
  }

  // Tạo đối tượng embed với màu sắc được xác định
  const embed = new EmbedBuilder()
    .setTitle(embedTitle)
    .setColor(embedColor)
    .setDescription(`*${content ? content : "No content"}*`)
    .setTimestamp(new Date().getTime());

  if (interaction) {
    interaction.deferred ? "" : await interaction.deferReply({ ephemeral: ephemeral });
    await deleteMessage(await interaction.editReply({ embeds: [embed] }), 5000);
  } else if (channel) {
    await deleteMessage(await channel.send({ embeds: [embed] }), 5000);
  }
}

/**
 *
 * @param {CommandInteraction | ButtonInteraction | ModalSubmitInteraction} interaction
 * @param {import("discord.js").TextBasedChannel} channel
 * @param {String} title
 * @param {String} content
 * @param {Array<ActionRow>} components
 * @param {Colors} color
 * @param {Boolean} setCreatedTimestamp
 * @param {Booleans} ephemeral
 * @returns {Promise<VoidFunction>}
 */
async function sendEmbedMsssage(
  interaction,
  channel,
  title,
  content,
  components,
  color,
  setCreatedTimestamp,
  ephemeral
) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`*${content}*`)
    .setColor(color ? color : Colors.Aqua)
    .setTimestamp(setCreatedTimestamp ? new Date().getTime() : undefined);
  if (interaction) {
    interaction.deferred ? "" : interaction.deferReply({ ephemeral: ephemeral });
    await deleteMessage(await interaction.editReply({ embeds: [embed], components: components }), 5000);
  } else if (channel) {
    await deleteMessage(await channel.send({ embeds: [embed], components: components }));
  }
}

module.exports = {
  MessageWarnLevel,
  sendEmbedMsssage,
  sendNotificationEmbedMessage,
  deleteMessage,
};
