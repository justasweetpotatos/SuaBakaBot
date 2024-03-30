const { AuthMode } = require("./authMode");

class AuthSession {
  /**
   *
   * @param {String} discordUserId
   * @param {String} minecraftPlayerId
   */
  constructor(discordUserId, minecraftPlayerId) {
    this.discordUserId = discordUserId;
    this.minecraftPlayerId = minecraftPlayerId;
    this.authMode = new AuthMode.CONFIRMED();
  }
}

module.exports = { AuthSession };
