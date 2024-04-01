const { User, Message, Collection, TextChannel, ThreadChannel, VoiceChannel } = require("discord.js");
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
 * @param {Collection<String, {
 *  user: User,
 *  messages: Array<Message>
 * }>} userDataCollection
 * @param {Collection<Message>} resutlMessages
 * @param {Collection<Message>} resutlBulkDeltableMessages
 * @param {Message} message
 * @param {String} targetUserId
 */
function checkIsBulkDeletableAndSet(
  userDataCollection,
  resutlMessages,
  resutlBulkDeltableMessages,
  message,
  targetUserId
) {
  try {
    if (!checkIsRigthUserTarget(message, targetUserId)) return;

    message.bulkDeletable
      ? resutlBulkDeltableMessages.set(message.id, message)
      : resutlMessages.set(message.id, message);

    pushData(message, userDataCollection);
  } catch (error) {
    logger.errors.server(`SEACHING_MESSAGE_CHECK_BULK_DELETABLE_MESSAGE: ${error}`);
  }
}

/**
 *
 * @param {Message} message
 * @param {String} targetUserId
 */
function checkIsRigthUserTarget(message, targetUserId) {
  return targetUserId ? targetUserId === message.author.id : true;
}

module.exports = {
  /**
   * Lưu ý: startMsgId hoặc endMessageId nếu undefined hoặc invalid sẽ lập tức lấy message mới nhất và message cũ nhất
   * @param {TextChannel | ThreadChannel | VoiceChannel} targetChannel Target channel to seach.
   * @param {String} targetUserId Target user to seach.
   * @param {String} startMsgId Start message id to find. If null, undefined or not valid, get the last message in channel.
   * @param {String} endMsgId  End message id to find.If null, undefined or not valid, get the first message in channel.
   * @param {Number} amount Number of message to seach. If null, undefined or not valid, default is 100.
   * @returns {Promise<{
   * messages: Collection<String, Message<Boolean>>,
   * bulkDeltableMessages: Collection<String, Message<Boolean>>,
   * userData: Collection<String, { user: User, messages: Message[] }> }>}
   */
  async findMessages(targetChannel, targetUserId, startMsgId, endMsgId, amount) {
    try {
      let startMsg, endMsg;
      startMsgId
        ? (startMsg = await targetChannel.messages.fetch(startMsgId))
        : (startMsg = (await targetChannel.messages.fetch({ limit: 1 })).first());
      endMsgId
        ? (endMsg = await targetChannel.messages.fetch(endMsgId))
        : (endMsg = (await targetChannel.messages.fetch({ limit: 1, after: 1 })).first());

      let userData = new Collection();
      let resutlMessages = new Collection();
      let resutlBulkDeltableMessages = new Collection();
      let startFetchMsgId;
      let continueFetching = true;
      let seachedMessageCounter = 0;

      if (!startMsg) startMsg = await targetChannel.messages.fetch({ limit: 1 }).first();

      checkIsBulkDeletableAndSet(
        userData,
        resutlMessages,
        resutlBulkDeltableMessages,
        startMsg,
        targetUserId
      );

      startFetchMsgId = startMsg.id;

      while (continueFetching) {
        const fetchAmount = amount - seachedMessageCounter < 100 ? amount - seachedMessageCounter : 100;

        fetchAmount < 100 ? (continueFetching = false) : (continueFetching = true);

        const fetchedMessages = await targetChannel.messages.fetch({
          limit: fetchAmount,
          before: startFetchMsgId,
        });

        if (fetchedMessages.size <= 0) return;

        fetchedMessages.every((msg) => {
          if (resutlMessages.size + resutlBulkDeltableMessages.size < amount) {
            if ((targetUserId && targetUserId === msg.author.id) || !targetUserId) {
              if (!msg.bulkDeletable) resutlMessages.set(msg.id, msg);
              else resutlBulkDeltableMessages.set(msg.id, msg);
              pushData(msg, userData);
              if (msg.id === endMsg.id) {
                continueFetching = false;
                return false;
              }
            }
            return true;
          } else {
            continueFetching = false;
            return false;
          }
        });

        startFetchMsgId = fetchedMessages.last()?.id;
      }

      return {
        messages: resutlMessages,
        bulkDeltableMessages: resutlBulkDeltableMessages,
        userData: userData,
      };
    } catch (error) {
      logger.errors.server(`Error on executing function findMessage: ${error}`);
      return { messages: [], userData: new Collection() };
    }
  },
};
