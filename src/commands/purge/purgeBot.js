const {
  Interaction,
  SlashCommandSubcommandBuilder,
  SlashCommandBooleanOption,
  SlashCommandNumberOption,
  Client,
  EmbedBuilder,
  TextBasedChannel,
  Colors,
  Collection,
  Message,
} = require("discord.js");
const logger = require("../../utils/logger");

/**
 * Adds message data to the user data collection.
 * @param {Message} message - The message object to be added to the collection.
 * @param {Collection} userDataCollection - The collection to which the message data will be added.
 */
function pushData(message, userDataCollection) {
  try {
    if (!(userDataCollection instanceof Collection))
      throw new Error("userDataCollection is not a valid Collection object");

    const userData = userDataCollection.get(message.author.id);

    if (userData) userData.messages.push(message);
    else userDataCollection.set(message.author.id, { user: message.author, messages: [message] });
  } catch (error) {
    console.error("Error occurred while adding message data:", error.message);
  }
}

/**
 * @param {TextBasedChannel} channel
 * @param {number} amount
 * @returns {Promise<{ messages: Array<Message>, userData: Collection<String, { user: User, messages: Message[] }> }>}
 */
async function messageFetcher(channel, amount) {
  try {
    let resutlMessages = [];
    let userData = new Collection();
    let continueFetching = true;
    let lastFetchedMessageId = channel.lastMessageId;

    while (continueFetching) {
      const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastFetchedMessageId});

      if (fetchedMessages.size === 0) break;

      lastFetchedMessageId = fetchedMessages.last().id;

      fetchedMessages.forEach((msg) => {
        if (msg.author.bot) {
          if (!amount || resutlMessages.length < amount) {
            resutlMessages.push(msg);
            pushData(msg, userData);
          } else continueFetching = false;
        }
      });


    }

    return { messages: resutlMessages, userData: userData };
  } catch (err) {
    logger.error(err);
    console.log(err);
    return { messages: [], userData: new Collection() };
  }
}

module.exports = {
  data: new SlashCommandSubcommandBuilder()
    .setName(`bot`)
    .setDescription("Xóa tin nhắn của bot.")
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName(`delete-all`)
        .setDescription(`Xóa tất cả (true) hoặc một phần (false).`)
        .setRequired(true)
    )
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName(`amount`)
        .setDescription(`Số lượng tin nhắn cần xóa.`)
        .setAutocomplete(true)
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
      const amount = interaction.options.get(`amount`)?.value;
      const isAll = interaction.options.get(`delete-all`).value;

      if (!isAll && !amount) {
        const embed = new EmbedBuilder().setTitle(`Bạn đang nhập thiếu trường \`amount\``).setColor(Colors.Yellow);
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const { messages: collectedMessages, userData: userData } = await messageFetcher(channel, amount);

      let fields = [];
      for (const item of userData)
        fields.push({ name: "-", value: `**${item[1].user.username}: ${item[1].messages.length}**`, inline: false });

      const embed = new EmbedBuilder()
        .setTitle(`Đã xóa: ${collectedMessages.length} tin nhắn`)
        .setColor(Colors.Green)
        .addFields(fields.splice(0, 25))
        .setFooter({ text: `Và hơn ${userData.size - 25 > 0 ? userData.size - 25 : 0} người dùng khác !` });

      await Promise.all(collectedMessages.map((message) => message.delete()));
      //await channel.bulkDelete(collectedMessages);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error(err);
      console.log(err);
    }
  },
};
