const { PlayerProfile } = require(`../storage/playerProfile`);

class Session {
  /**
   *
   * @param {String} id Discord user id
   * @param {String} playerUUID Minecraft player UUID
   */
  constructor(id, playerUUID) {
    this.id = id;
    this.playerProfile = new PlayerProfile(playerUUID);
    this.authCode = new Date().getTime().toString();
  }
}

module.exports = { Session };
