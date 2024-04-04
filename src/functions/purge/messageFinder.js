const {
  User,
  Message,
  Collection,
  TextChannel,
  ThreadChannel,
  VoiceChannel,
  TextBasedChannel,
} = require("discord.js");
const logger = require("../../utils/logger");

/**
 * Adds message data to the user data collection.
 * @param {Message} message - The message object to be added to the collection.
 * @param {Collection<String, {
 *  user: User,
 *  messages: Array<Message>
 * }>} userDataCollection - The collection to which the message data will be added.
 */
function pushData(message, userDataCollection) {
  try {
    const userData = userDataCollection.get(message.author.id.toString());
    userData
      ? userData.messages.push(message)
      : userDataCollection.set(message.author.id, { user: message.author, messages: [message] });
  } catch (error) {
    logger.errors.server(`SEACHING_MESSAGE_PUSH_USER_DATA_EVENT_ERROR: ${error}`);
  }
}

/**
 *
 * @param {Message} targetMessage
 * @param {User} targetUser
 */
function checkIsRigthUserTarget(targetMessage, targetUser) {
  return targetUser ? targetUser.id === targetMessage.author.id : true;
}

/**
 *
 * @param {{
 * startMsg: Message,
 * targetChannel: TextBasedChannel
 * }} data
 * @returns {Promise<Collection<String, Message<Boolean>>>}
 */
async function fetchMessages(data) {
  if (!data.startMsg) data.startMsg = (await data.targetChannel.messages.fetch({ limit: 1 })).first();
  return new Collection()
    .set(data.startMsg.id, data.startMsg)
    .concat(await data.targetChannel.messages.fetch({ before: data.startMsg.id, limit: 100 }));
}

module.exports = {
  /**
   * Find message by user, amout: amout to seach messages
   * @param {{
   * targetChannel: TextBasedChannel,
   * targetUser: User,
   * startMsg: Message,
   * endMsg: Message,
   * }} data
   * @returns {Promise<{
   *  messages: Collection<String, Message<Boolean>>,
   *  messagesBullkDeletable: Collection<String, Message<Boolean>>,
   *  userData: Collection<String, {user: User, messages: Array<Message<Boolean>>}>
   * }>}
   */
  async findMessagesByUser(data) {
    const messages = new Collection();
    const messagesBullkDeletable = new Collection();
    const userData = new Collection();
    try {
      let continueFetching = true;
      let startFetchMsg = data.startMsg;

      while (continueFetching) {
        const rawMessages = await fetchMessages({
          startMsg: startFetchMsg,
          targetChannel: data.targetChannel,
        });

        rawMessages.every((msg) => {
          if (msg.id < data.endMsg.id) {
            continueFetching = false;
            return false;
          } else if (checkIsRigthUserTarget(msg, data.targetUser)) {
            msg.bulkDeletable ? messagesBullkDeletable.set(msg.id, msg) : messages.set(msg.id, msg);
            pushData(msg, userData);
          }
          return true;
        });

        startFetchMsg = rawMessages.last();
      }
      return { messages: messages, messagesBullkDeletable: messagesBullkDeletable, userData: userData };
    } catch (error) {
      logger.errors.server(`FINDING_MESSAGES_ERROR: ${error}`);
      return { messages: messages, messagesBullkDeletable: messagesBullkDeletable, userData: userData };
    }
  },

  /**
   * Find message by user, amout: amout to seach messages
   * @param {{
   * targetChannel: TextBasedChannel,
   * amount: Number
   * }} data
   *
   * @returns {Promise<{
   *  messages: Collection<String, Message<Boolean>>,
   *  messagesBullkDeletable: Collection<String, Message<Boolean>>,
   *  userData: Collection<String, Array<Message<Boolean>>>
   * }>}
   */
  async findBotMessages(data) {
    const messagesBullkDeletable = new Collection();
    const messages = new Collection();
    const userData = new Collection();

    try {
      let continueFetching = true;
      let counter = 0;
      let startMsg;

      while (continueFetching) {
        const rawMessages = await fetchMessages({
          startMsg: startMsg,
          targetChannel: data.targetChannel,
        });

        if (rawMessages.size < 100) continueFetching = false;

        rawMessages.every((msg) => {
          if (msg.author.bot) {
            msg.bulkDeletable ? messagesBullkDeletable.set(msg.id, msg) : messages.set(msg.id, msg);
            pushData(msg, userData);
          }

          counter += 1;

          if (counter == data.amount) {
            continueFetching = false;
            return false;
          }
          return true;
        });

        startMsg = rawMessages.last();
      }
      return { messages: messages, messagesBullkDeletable: messagesBullkDeletable, userData: userData };
    } catch (error) {
      logger.errors.server(`FINDING_MESSAGES_ERROR: ${error}`);
      return { messages: messages, messagesBullkDeletable: messagesBullkDeletable };
    }
  },
};
