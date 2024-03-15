const { Client, ActivityType } = require("discord.js");
const logger = require("../../utils/logger");

module.exports = {
  name: "ready",
  once: true,
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    logger.log.server(`Ready! ${client.user.tag} is online now!`);
    client.user.setPresence({
      activities: [{ name: `Đùa với trái tim neuron`, type: ActivityType.Playing}],
      status: "online",
    });
  },
};
