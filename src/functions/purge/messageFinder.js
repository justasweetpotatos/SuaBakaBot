const {
  User,
  Message,
  Collection,
  TextChannel,
  ThreadChannel,
  ForumChannel,
  VoiceChannel,
} = require("discord.js");
const logger = require("../../utils/logger");

/**
 * Adds message data to the user data collection.
 * @param {Message} message - The message object to be added to the collection.
 * @param {Collection} userDataCollection - The collection to which the message data will be added.
 */
function pushData(message, userDataCollection) {
  try {
    // Check if userDataCollection is a valid Collection object
    if (!(userDataCollection instanceof Collection)) {
      throw new Error("userDataCollection is not a valid Collection object");
    }

    const userData = userDataCollection.get(message.author.id.toString());

    if (userData) {
      userData.messages.push(message);
    } else {
      userDataCollection.set(message.author.id, { user: message.author, messages: [message] });
    }
  } catch (error) {
    console.error("Error occurred while adding message data:", error.message);
    // Optionally rethrow the error if you want the caller to handle it
    // throw error;
  }
}

module.exports = {
  /**
   * Lưu ý: startMsgId hoặc endMessageId nếu undefined hoặc invalid sẽ lập tức lấy message mới nhất và message cũ nhất
   * @param {TextChannel | ThreadChannel | VoiceChannel} targetChannel Target channel to seach.
   * @param {String} targetUserId Target user to seach.
   * @param {String} startMsgId Start message id to find. If null, undefined or not valid, get the last message in channel.
   * @param {String} endMsgId  End message id to find.If null, undefined or not valid, get the first message in channel.
   * @param {Number} amount Number of message to find. If null, undefined or not valid, default is 10.
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

      if (startMsg) {
        let afterStartMessage = (
          await targetChannel.messages.fetch({ limit: 1, after: startMsg.id })
        ).first();
        if (afterStartMessage) startMsg = afterStartMessage;
        else if ((targetUserId && targetUserId.id === startMsg.author.id) || !targetUserId) {
          if (startMsg.bulkDeletable) resutlBulkDeltableMessages.set(startMsg.id, startMsg);
          else resutlMessages.set(startMsg.id, startMsg);
          pushData(startMsg, userData);
        }
      }

      startFetchMsgId = startMsg.id;

      while (continueFetching) {
        const fetchedMessages = await targetChannel.messages.fetch({
          limit: 100,
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
