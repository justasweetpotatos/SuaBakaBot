const logger = require("../../utils/logger");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    logger.log.server(`Ready! ${client.user.tag} is online now!`);
  },
};
