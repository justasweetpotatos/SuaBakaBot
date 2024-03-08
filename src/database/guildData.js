const { Collection } = require("discord.js");
const logger = require("../utils/logger");

module.exports = {
  // /**
  //  * Registry guild mới, nếu trả về true có nghĩa là đã thành công và ngược lại.
  //  * Nếu trả về null tức là có lỗi !
  //  * @param {{id: String, name: String, maxNoichuChannel: Number}} guildConfig
  //  * @returns {Promise<Boolean | null>}
  //  */
  // async registGuild(guildId) {
  //   return await registGuild(guildId);
  // },
  // /**
  //  * Đăng ký dữ liệu mới cho noichu channel trên database.
  //  * Nếu đã được đăng ký, return false.
  //  * Nếu có lỗi
  //  * @param {string} channelId
  //  * @param {String} guildId
  //  * @returns {Promise<Boolean|null>}
  //  */
  // async registNoichuChannel(channelId, guildId) {
  //   try {
  //     if (this.getNoichuChannelConfig(channelId)) return false;

  //     await runQuery(databaseQuerys.NO_DUPLICATE_INSERT_NOICHU_CHANNEL, [channelId, guildId]);
  //     return true;
  //   } catch (error) {
  //     logger.error(`Erron on registing noichu channel: ${err}`);
  //     return null;
  //   }
  // },
  // /**
  //  * Trả về config bot của server, nếu server chưa được đăng ký, return null
  //  * @param {String} guildId
  //  * @returns {Promise<{id: String, name: String, max_noichu_channel: Number} | null>}
  //  */
  // async getGuildConfig(guildId) {
  //   try {
  //     const query = databaseQuerys.GET_GUILD_CONFIG;
  //     const values = [guildId];
  //     const result = await runQuery(query, values);
  //     return result[0];
  //   } catch (err) {
  //     logger.error(`Error on getting config of guild ${guildId}: ${err}`);
  //     return null;
  //   }
  // },
  // /**
  //  * Trả về config của channel được set game noichu.
  //  * Nếu null tức là channel chưa đc set.
  //  * @param {String} channelId
  //  * @returns {Promise<{id: String,
  //  * max_words: Number,
  //  * last_word: String,
  //  * word_used_list: String,
  //  * last_user_id: String,
  //  * guild_id: String,
  //  * repeated: Number,
  //  * wrong_word_messages: String,
  //  * wrong_start_char_messages: String,
  //  * repeat_messages: String
  //  * }|null>}
  //  */
  // async getNoichuChannelConfig(channelId) {
  //   try {
  //     const query = databaseQuerys.GET_NOICHU_CHANNEL_CONFIG;
  //     const values = [channelId];
  //     const dataList = await runQuery(query, values);
  //     return dataList[0];
  //   } catch (error) {
  //     logger.error(`Error on getting noichu channel config`);
  //   }
  // },
  // /**
  //  *
  //  * @param {noichuChannelConfig} channelConfig
  //  * @returns {Promise<Boolean>}
  //  */
  // async updateNoichuChannelConfig(channelConfig) {
  //   try {
  //     const query = databaseQuerys.UPDATE_NOICHU_CHANNEL_CONFIG;
  //     const values = [
  //       channelConfig.id,
  //       channelConfig.guildId,

  //       channelConfig.lastWord,
  //       channelConfig.lastUserId,
  //       channelConfig.wordUsedList,

  //       channelConfig.repeated,
  //       channelConfig.maxWord,

  //       channelConfig.wrongWordMessages,
  //       channelConfig.wrongLastCharMessages,
  //       channelConfig.isBeforeUserMessages,
  //       channelConfig.isRepeatedWordMessages,
  //     ];
  //     await runQuery(query, values);
  //     return true;
  //   } catch (err) {
  //     logger.error(`Error in updating config of channel with id ${channelConfig.id}: ${err}`);
  //     return false;
  //   }
  // },
  // /**
  //  * Xóa config noichu của channel này tức unset noichu channel.
  //  * Nếu trả vể false, channel chưa được set.
  //  * Nếu trả về true, channel đã được xóa config khỏi database.
  //  * @param {String} channelId Id của channel cần xóa noichu config
  //  * @returns {Promise<Boolean|null>}
  //  */
  // async removeNoichuChannelConfig(channelId) {
  //   try {
  //     const query = databaseQuerys.GET_NOICHU_CHANNEL_CONFIG;
  //     const values = [channelId];
  //     const result = await runQuery(query, values);
  //     if (result.length === 0) return false;
  //     else {
  //       await runQuery(databaseQuerys.DELETE_NOICHU_CHANNEL_CONFIG, [channelId]);
  //       return true;
  //     }
  //   } catch (err) {
  //     logger.error(`Error on removing config of channel with id ${channelId}: ${err}`);
  //     return null;
  //   }
  // },
  // /**
  //  *
  //  * @param {String} guildId
  //  * @returns {Promise<Number>}
  //  */
  async getNumberOfNoichuChannelInGuild(guildId) {
    try {
      const query = `SELECT COUNT(*) AS counter FROM guild_${guildId}.noichu_channels`;
      const values = [guildId];
      const result = await runQuery(query, values);
      return result[0].count;
    } catch (err) {
      logger.error(`Error on getting number of noichu channel in guild with id ${guildId}: ${err}`);
      return undefined;
    }
  },
};
//   /**
//    *
//    * @param {String} guildId
//    * @returns {Promise<Array<{
//    * id: String,
//    * max_words: Number,
//    * last_word: String,
//    * word_used_list: String,
//    * last_user_id: String,
//    * guild_id: String,
//    * repeated: Number
//    * }>>}
//    */
//   async getAllChannelConfigOfGuild(guildId) {
//     try {
//       const isExist = async (guiidlId) => {
//         const query = databaseQuerys.GET_GUILD_CONFIG;
//         const values = [guildId];
//         const result = await runQuery(query, values);
//         if (result.length === 0) return false;
//         else return true;
//       };

//       const query = databaseQuerys.GET_ALL_NOICHU_CHANNEL_CONFIG_IN_GUILD;
//       const values = [guildId];

//       if (await isExist(guildId)) {
//         return [...(await runQuery(query, values))];
//       } else {
//         await registGuild(guildId);
//         return await runQuery(query, values);
//       }
//     } catch (err) {
//       logger.error(`Error on getting data of guild with id ${guildId}: ${err}`);
//     }
//   },
//   /**
//    * Cập nhật người chơi và từ đã nối
//    * @param {{
//    * max_words: Number,
//    * last_word: String,
//    * word_used_list: String,
//    * last_user_id: String,
//    * guild_id: String,
//    * repeated: Number,
//    * wrong_word_messages: String,
//    * wrong_start_char_messages: String,
//    * repeat_messages: String
//    * }} channelConfig
//    */
//   async updateUserAndMessage(channelConfig) {
//     try {
//       const query = databaseQuerys.UPDATE_NOICHU_CHANNEL_CONFIG;
//       const values = [
//         channelConfig.id,
//         channelConfig.max_words,
//         channelConfig.last_word,
//         channelConfig.last_user_id,
//         channelConfig.word_used_list,
//         channelConfig.guild_id,
//         channelConfig.repeated,
//         channelConfig.wrong_word_messages,
//         channelConfig.wrong_start_char_messages,
//         channelConfig.repeat_messages,
//       ];

//       await runQuery(query, values);
//       return true;
//     } catch (error) {
//       logger.error(`Error in updating config of channel with id ${channelConfig.id}: ${err}`);
//       return false;
//     }
//   },
// };

// class noichuDBExecutor {
//   constructor() {}

//   /**
//    *
//    * @param {String} channelId
//    * @returns {NoichuChannelConfig | null}
//    */
//   async getChannelData(channelId) {
//     try {
//       const query = `
//       SELECT * FROM \`suwa-bot-guild-data\`.noichu_channels
//       WHERE id = ?
//       `;
//       const values = [channelId];
//       const results = await runQuery(query, values);
//       if (results.length === 0) return null;
//       else return new NoichuChannelConfig(results[0]);
//     } catch (error) {
//       logger.error(`Error on getting data from DB of channel with id ${channelId}: ${error}`);
//       return null;
//     }
//   }

//   /**
//    *
//    * @param {String} guildId
//    * @returns {Collection<String, NoichuChannelConfig>}
//    */
//   async getAllChannelDataOfGuild(guildId) {
//     try {
//       const query = `
//       SELECT \`suwa-bot-guild-data\`.noichu_channels.*
//       FROM \`suwa-bot-guild-data\`.guilds
//       RIGHT JOIN \`suwa-bot-guild-data\`.noichu_channels
//       ON noichu_channels.guild_id = guilds.id
//       WHERE guilds.id = ?;
//       `;
//       const values = [guildId];
//       const results = await runQuery(query, values);
//       const collection = new Collection();
//       results.forEach((rowData) => {
//         collection.set(collection.id, new NoichuChannelConfig(rowData));
//       });
//       return collection;
//     } catch (error) {
//       logger.error(`Error on getting data of all channel in guild with id ${guildId}: ${error}`);
//     }
//   }
// }
