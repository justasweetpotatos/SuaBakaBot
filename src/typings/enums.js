class NoichuMessageType {
  static get WRONG_WORD_MESSAGE() {
    return 1;
  }
  static get WRONG_START_CHAR_MESSAGE() {
    return 2;
  }
  static get IS_BEFORE_USER_MESSAGE() {
    return 3;
  }
  static get IS_REPEATED_WORD_MESSAGE() {
    return 4;
  }
}

Object.freeze(NoichuMessageType);

module.exports = { NoichuMessageType };
