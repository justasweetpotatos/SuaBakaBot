class Session {
  /**
   *
   * @param {String} id
   * @param {String} userId
   */
  constructor(id, userId) {
    this.id = id;
    this.userId = userId;
    this.playerUUID = "";
    this.authCode = new Date().getTime().toString();
  }
}

module.exports = { Session };
