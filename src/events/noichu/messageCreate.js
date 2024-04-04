const logger = require("../../utils/logger");
const { NoichuChecker, NoituChecker } = require("../../functions/noichu/noichuFunction");

module.exports = {
  name: "messageCreate",
  once: false,
  /**
   *
   * @param {import('discord.js').Message} message
   * @param {import('discord.js'.Client)} client
   */
  async execute(message, client) {
    try {
      if (message.author.bot) return;

      const checker = new NoichuChecker(message.channel.id, message.guild.id);
      await checker.check(message);

      const vnChecker = new NoituChecker(message.channel.id, message.guild.id);
      await vnChecker.check(message);
    } catch (err) {
      logger.errors.event(`Error on listening event ${this.name}: ${err}`);
    }
  },
};
