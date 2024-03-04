const { EmbedBuilder, Events, Colors, Message, Collection } = require("discord.js");
const logger = require("../../utils/logger");
const { getGuildConfig } = require("../../database/guildData");
const { NoichuChannelConfig } = require("../../typings");

class Lock {
  constructor() {
    this.locked = false;
  }

  async acquire() {
    while (this.locked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.locked = true;
  }

  release() {
    this.locked = false;
  }
}

const lock = new Lock();

/**
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 * Return ramdom number from min to max
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 *
 * @param {Message} messageTarget
 * @param {String} content
 */
async function noiChuError(messageTarget, content) {
  const embed = new EmbedBuilder().setTitle(`${content}`).setColor(`#fff700`);
  await messageTarget.react("❌");
  let repliedMessage = await messageTarget.reply({
    embeds: [embed],
  });
  setTimeout(async () => {
    await repliedMessage.delete();
  }, 5000);
}

/**
 *
 * @param {NoichuChannelConfig} channelConfig
 * @param {String} word
 * @param {Message} message
 * @returns
 */
async function checkWord(channelConfig, word, message) {
  const dict = require("./noichuDictionary.json");
  const cache = require("./noichuCache.json");

  // let valid = false;

  // const getUrlApi =
  //   "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20240229T151739Z.795a73578ee9b39a.2538ef901579851768ac9ad05c332575496b1343&lang=en-fr&text=" +
  //   word;
  // await fetch(getUrlApi).then(async (response) => {
  //   const data = await response.json();
  //   if (response.ok) {
  //     data.def.length !== 0 ? (valid = true) : "";
  //   }
  // });

  if (!dict[word]) {
    const messages = channelConfig.wrongWordMessages;
    await noiChuError(message, messages.at(getRandomInt(0, 2)));
    return false;
  }

  return true;
}

/**
 * Kiểm tra xem người dùng đã nối từ trước đó hay chưa
 * @param {String} authorId
 * @param {NoichuChannelConfig} channelConfig
 * @param {String} word
 * @param {Message} message
 * @returns {Promise<Boolean>}
 */
async function checkLastUser(authorId, channelConfig, word, message) {
  const messages = channelConfig.isBeforeUserMessages;

  if (channelConfig.lastUserId) {
    if (channelConfig.lastUserId === authorId) {
      await noiChuError(message, messages.at(getRandomInt(0, 3)));
      return false;
    }
  } else return await checkWord(word, message);

  return true;
}

/**
 * Kiểm tra xem chữ của từ đang nối có trùng với chữ của từ cuối cùng hay không
 * @param {String} word
 * @param {NoichuChannelConfig} channelConfig
 * @param {Message} message
 * @returns {Promise<Boolean>}
 */
async function checkStartChar(word, channelConfig, message) {
  if (!channelConfig.lastWord) return await checkWord(word, message);

  const lastChar = channelConfig.lastWord.charAt(channelConfig.lastWord.length - 1);

  if (!word.startsWith(lastChar)) {
    await noiChuError(message, `Đần, mày phải bắt đầu bằng \`${lastChar}\` chứ :|| !`);
    return false;
  }
  return true;
}

/**
 * Kiểm tra có phải từ đã được dùng hay không.
 * @param {String} word
 * @param {NoichuChannelConfig} channelConfig
 * @param {Message} message
 * @returns {Promise<Boolean>}
 */
async function checkIsRepeated(word, channelConfig, message) {
  const messages = [`Có thằng nối từ này rồi, chọn khác đê !`];

  if (!channelConfig.wordUsedList) return true;

  if (channelConfig.wordUsedList.includes(word)) {
    await noiChuError(message, messages[0]);
    return false;
  }
  return true;
}

/**
 * Check xem kênh đã đạt giới hạn nối chữ chưa
 * @param {NoichuChannelConfig} channelConfig
 * @param {Message} message
 * @returns {Promise<Boolean>}
 */
async function checkIsReachedMaxWords(channelConfig, message) {
  const length = channelConfig.wordUsedList.split(" ").length;
  if (channelConfig.limit < 1) return true;
  if (length >= channelConfig.limit) {
    message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Green)
          .setTitle(`Game nối chữ đã đạt max từ: *\`${channelConfig.limit}\`*`)
          .setDescription(`*Reset game !*`),
      ],
    });

    channelConfig.lastWord = "";
    channelConfig.lastUserId = "";
    channelConfig.wordUsedList = "";
    return true;
  }
  return false;
}

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {import('discord.js').Message} message
   * @param {import('discord.js'.Client)} client
   */
  async execute(message, client) {
    try {
      if (message.author.bot) return;

      const authorId = message.author.id;
      const guildId = message.guildId;
      const channelId = message.channelId;

      if (message.content.includes(`#uselessfact`)) {
        let fact;
        // Địa chỉ của API
        const apiUrl = "https://uselessfacts.jsph.pl/api/v2/facts/random";

        // Sử dụng fetch() để gửi yêu cầu GET đến API
        await fetch(apiUrl)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then((data) => (fact = data.text))
          .catch((error) => console.error("There was a problem with the fetch operation:", error));

        await message.reply({ content: fact });
        return;
      }

      let guildConfig = await getGuildConfig(guildId);
      if (!guildConfig) return;

      const channelConfig = new NoichuChannelConfig({}, channelId, guildId);
      if (!(await channelConfig.sync())) return;

      if (channelConfig) {
        const list = message.content.split(" ");
        if (list.length > 1) return;
        if (list[0].startsWith("<") || list[0].startsWith(":")) return;
        const word = list[0].toLowerCase();

        if (!(await checkLastUser(authorId, channelConfig, word, message))) return;
        if (!(await checkStartChar(word, channelConfig, message))) return;
        if (channelConfig.repeated != -1) {
          if (!(await checkIsRepeated(word, channelConfig, message))) return;
        }
        if (!(await checkWord(channelConfig, word, message))) return;

        message.react("✅");
        channelConfig.lastWord = word;
        channelConfig.lastUserId = authorId;
        channelConfig.wordUsedList = channelConfig.wordUsedList + " " + word;

        await checkIsReachedMaxWords(channelConfig, message);

        lock.acquire();
        await channelConfig.update();
      }
    } catch (err) {
      console.log(err);
      logger.error(`On event ${this.name}: ${err}`);
    } finally {
      lock.release();
    }
  },
};
