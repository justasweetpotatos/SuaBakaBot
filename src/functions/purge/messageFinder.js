const { User, Message, Collection } = require("discord.js");
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
   * @param {import("discord.js").TextBasedChannel} targetChannel Target channel to seach.
   * @param {User} targetUser Target user to seach.
   * @param {String} startMsgId Start message id to find. If null, undefined or not valid, get the last message in channel.
   * @param {String} endMsgId  End message id to find.If null, undefined or not valid, get the first message in channel.
   * @param {Number} amount Number of message to find. If null, undefined or not valid, default is 10.
   * @returns {Promise<{ messages: Array<Message>, userData: Collection<String, { user: User, messages: Message[] }> }>}
   */
  async findMessages(targetChannel, targetUser, startMsgId, endMsgId, amount) {
    try {
      let startMsg, endMsg;
      startMsgId
        ? (startMsg = await targetChannel.messages.fetch(startMsgId))
        : (startMsg = (await targetChannel.messages.fetch({ limit: 1 })).first());
      endMsgId
        ? (endMsg = await targetChannel.messages.fetch(endMsgId))
        : (endMsg = (await targetChannel.messages.fetch({ limit: 1, after: 1 })).first());

      let userData = new Collection();
      let resutlMessages = [];
      let startFetchMsgId;
      let continueFetching = true;

      if (startMsg) {
        let afterStartMessage = (await targetChannel.messages.fetch({ limit: 1, after: startMsg.id })).first();
        if (afterStartMessage) startMsg = afterStartMessage;
        else if ((targetUser && targetUser.id === startMsg.author.id) || !targetUser) {
          resutlMessages.push(startMsg);
          pushData(startMsg, userData);
        }
      }

      startFetchMsgId = startMsg.id;

      while (continueFetching) {
        const fetchedMessages = await targetChannel.messages.fetch({
          limit: 100,
          before: startFetchMsgId,
        });

        fetchedMessages.every((msg) => {
          if (resutlMessages.length < amount) {
            if ((targetUser.id && targetUser.id === msg.author.id) || !targetUser.id) {
              resutlMessages.push(msg);
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

      return { messages: resutlMessages, userData: userData };
    } catch (error) {
      logger.error(error);
      return { messages: [], userData: new Collection() };
    }
  },
};
