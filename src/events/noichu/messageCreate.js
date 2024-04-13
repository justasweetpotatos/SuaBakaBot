const logger = require("../../utils/logger");
const { Message, Client } = require("discord.js");
const { NoichuChecker, NoituChecker } = require("../../functions/noichu/functions");
const AntiSpamLink = require("../../functions/moderation/antiSpamLink");

module.exports = {
  name: "messageCreate",
  once: false,
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    try {
      if (message.author.bot) return;

      if (message.guildId === "811939594882777128") {
        const antiSpamLink = new AntiSpamLink(client, message.guild);
        await antiSpamLink.onMessage(message);
      }

      const checker = new NoichuChecker(message.channel.id, message.guild.id);
      await checker.check(message);

      const vnChecker = new NoituChecker(message.channel.id, message.guild.id);
      await vnChecker.check(message);
    } catch (err) {
      logger.errors.event(`Error on listening event ${this.name}: ${err}`);
    }
  },
};
