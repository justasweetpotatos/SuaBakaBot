const logger = require("../utils/logger");
const { connector } = require("../database/connection");
const { EmbedBuilder, Colors, Embed, Role, User, Collection } = require("discord.js");
const { NoichuMessageType } = require("./enums");

const noichuMessageTypes = {
  wrongWordMessages: 1,
  wrongLastCharMessages: 2,
  isBeforeUserMessages: 3,
  isRepeatedWordMessages: 4,
};

String.prototype.removeCharacter = function (character) {
  return this.split(character).join("");
};

class NoichuChannelConfig {
  /**
   *
   * @param {String} channelId
   * @param {String} guildId
   */
  constructor(channelId, guildId) {
    // Data
    this.id = null;
    this.guildId = null;
    this.lastWord = "";
    this.lastUserId = "";
    this.wordUsedList = "";

    // Rules
    this.registed = false;
    this.repeated = -1;
    this.limit = 100;

    // Messages
    this.wrongWordMessages = {
      default: { content: "Từ này không tồn tại trong từ điển của bot !", authorId: "server" },
    };
    this.wrongStartCharMessages = {
      default: { content: "Bạn phải bắt đầu bằng chữ `<replace>` !", authorId: "server" },
    };
    this.isBeforeUserMessages = {
      default: { content: "Bạn đã chơi trước đó, vui lòng đợi !", authorId: "server" },
    };
    this.isRepeatedWordMessages = {
      default: { content: "từ `<replace>` đã có người khác sử dụng !", authorId: "server" },
    };

    // guild DB name
    this.guildDBName = `guild_`;

    if (channelId && guildId) {
      this.id = channelId;
      this.guildId = guildId;
      this.guildDBName += `${guildId}`;
      return this;
    } else throw new Error(`Variable channelId and guildId is missing !`);
  }

  /**
   *
   * @param {User} author
   * @param {NoichuMessageType} messageType
   * @param {string} message
   * @returns {Boolean}
   */
  async addMessage(author, messageType, message) {
    let valid = true;
    switch (messageType) {
      case NoichuMessageType.WRONG_WORD_MESSAGE:
        if (!this.wrongWordMessages.includes(message))
          this.wrongWordMessages[new Date().getTime().toString()] = {
            content: message,
            authorId: author.id,
          };
        break;
      case NoichuMessageType.WRONG_START_CHAR_MESSAGE:
        if (!this.wrongStartCharMessages.includes(message))
          this.wrongStartCharMessages[new Date().getTime().toString()] = {
            content: message,
            authorId: author.id,
          };
        break;
      case NoichuMessageType.IS_BEFORE_USER_MESSAGE:
        if (!this.isBeforeUserMessages.includes(message))
          this.isBeforeUserMessages[new Date().getTime().toString()] = {
            content: message,
            authorId: author.id,
          };
        break;
      case NoichuMessageType.IS_REPEATED_WORD_MESSAGE:
        if (!this.isRepeatedWordMessages.includes(message))
          this.isRepeatedWordMessages[new Date().getTime().toString()] = {
            content: message,
            authorId: author.id,
          };
        break;
      default:
        valid = false;
        break;
    }

    return valid;
  }

  /**
   *
   * @returns {Promise<Embed>}
   */
  createConfigEmbed() {
    return new EmbedBuilder()
      .setTitle(`Cài đặt game nối chữ kênh <#${this.id}> :`)
      .setDescription(
        `***Configuration:***
            Channel id: ${this.id}
            Last user: ${this.lastUserId.length === 0 ? "none" : `<@${this.lastUserId}>`}
            Last word: ${this.lastWord ? this.lastWord : "none"}
            Max words: ${this.limit}
            Repeated: ${this.repeated === 1 ? "✅" : "❌"}

            ***Hướng dẫn:***
            \`Remove\`: Xóa config nối chữ của kênh !
            \`Set Max\`: Set giới hạn từ trước khi reset game !
            \`Set Repeated\`: Cho phép lặp hoặc không ! 
        `
      )
      .setColor(Colors.Blurple);
  }
}

class NoituChannelConfig {
  /**
   *
   * @param {String} channelId
   * @param {String} guildId
   */
  constructor(channelId, guildId) {
    // Data
    this.id = null;
    this.guildId = null;
    this.lastWord = "";
    this.lastUserId = "";
    this.wordUsedList = {};

    // Rules
    this.registed = false;
    this.repeated = -1;
    this.limit = 100;

    // Messages
    this.wrongWordMessages = {
      default: { content: "Từ này không tồn tại trong từ điển của bot !", authorId: "server" },
    };
    this.wrongStartCharMessages = {
      default: { content: "Bạn phải bắt đầu bằng chữ `<replace>` !", authorId: "server" },
    };
    this.isBeforeUserMessages = {
      default: { content: "Bạn đã chơi trước đó, vui lòng đợi !", authorId: "server" },
    };
    this.isRepeatedWordMessages = {
      default: { content: "từ `<replace>` đã có người khác sử dụng !", authorId: "server" },
    };

    // guild DB name
    this.guildDBName = `guild_`;

    if (channelId && guildId) {
      this.id = channelId;
      this.guildId = guildId;
      this.guildDBName += `${guildId}`;
      return this;
    } else throw new Error(`Variable channelId and guildId is missing !`);
  }
}

class GuildConfig {
  /**
   *
   * @param {String} id
   * @param {String} name
   * @param {Number} limOfNoichuChannel
   * @param {Number} limOfNoituChannel
   * @param {Collection<String, Role>} botManagerRoles
   */
  constructor(id, name, limOfNoichuChannel, limOfNoituChannel, botManagerRoles) {
    this.id = id;
    this.limOfNoichuChannel = 1;
    this.limOfNoituChannel = 1;
    this.botManagerRoles = new Collection();

    if (!id) throw new Error(`Id must not be null`);

    this.name = name ? name : "";

    // Default values
    this.limOfNoichuChannel = limOfNoichuChannel ? limOfNoichuChannel : 1;
    this.limOfNoituChannel = limOfNoituChannel ? limOfNoituChannel : 1;
    this.guildDBName = `guild_${id}`;

    // Bot log channels
    this.botLogsChannelId = "";
    this.messageLogsChannelId = "";
    this.userJoinLeaveLogsChannelId = "";
    this.userChangeInfoLogsChannelId = "";

    // Features log channels
    this.postReportChannelId = "";
  }
}

class ReactionRoleMessageConfig {
  /**
   *
   * @param {String} messageId
   * @param {String} emojiId
   */
  constructor(messageId, emojiId, guildId) {
    this.id = messageId;
    this.emojiId = emojiId;
    this.guildId = guildId;
    if (!(this.id && this.emojiId && guildId)) throw new Error(`messageId, emojiId, guildId required !`);
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const query = `
        SELECT * FROM guild_${this.guildId}.reaction_emojis WHERE id = ${this.id} AND emoji_id = ${this.emojiId};
      `;

      const result = (await connector.executeQuery(query, []))[0];
      if (!result) return false;

      this.roleList = result.role_list;

      return true;
    } catch (error) {
      logger.errors.database(
        `Error on syncing data of reaction role with message id ${this.id} with role id ${this.emojiId}: ${error}`
      );
    }
  }

  async update() {}

  async delete() {}
}

module.exports = { NoichuChannelConfig, GuildConfig, NoituChannelConfig, noichuMessageTypes };
