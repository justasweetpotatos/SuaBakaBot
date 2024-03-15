const { Message } = require("discord.js");
const logger = require("../../utils/logger");
const { NoichuChecker, NoituChecker } = require("../../functions/noichu/noichuFunction");

class Lock {
  constructor() {
    this.locked = false;
  }

  async acquire() {
    while (this.locked) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.locked = true;
  }

  release() {
    this.locked = false;
  }
}

const lock = new Lock();

module.exports = {
  name: "messageCreate",
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

      if (message.content.includes(`#uselessfact`)) {
        let fact;
        // Địa chỉ của API
        const apiUrl = "https://uselessfacts.jsph.pl/api/v2/facts/random";

        // Sử dụng fetch() để gửi yêu cầu GET đến API
        await fetch(apiUrl)
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then((data) => (fact = data.text))
          .catch((error) => console.error("There was a problem with the fetch operation:", error));

        await message.reply({ content: fact });
        return;
      }
    } catch (err) {
      logger.error(`On event ${this.name}: ${err}`);
    } finally {
      lock.release();
    }
  },
};
