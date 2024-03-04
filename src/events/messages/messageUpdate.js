const { Events, NewsChannel } = require("discord.js");

module.exports = {
  name: "messageUpdate",
  /**
   * @param {Object} param0
   * @param {import('discord.js').Message} oldMessage
   * @param {import('discord.js').Message} newMessage
   * @param {import('discord.js').Client} client
   */
  async execute(oldMessage, newMessage, client) {},
};
