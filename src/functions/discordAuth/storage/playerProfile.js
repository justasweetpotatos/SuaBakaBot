const { AuthMode } = require("../authMode");

class PlayerProfile {
  /**
   *
   * @param {String} uuid
   */
  constructor(uuid) {
    this.uuid = uuid;
    this.name = "";
    this.ipAddress = "";
    this.discordId = "";
    this.authMode = AuthMode.UNRECOGNIZED;
  }
}

module.exports = { PlayerProfile };
