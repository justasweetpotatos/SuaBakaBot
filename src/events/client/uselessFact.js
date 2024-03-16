const logger = require("../../utils/logger");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "messageCreate",
  /**
   * @param {Object} param0
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    try {
      if (message.content.includes(`#uselessfact`)) {
        let fact;
        const apiUrl = "https://uselessfacts.jsph.pl/api/v2/facts/random";

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
    } catch (error) {
      logger.errors.event(error);
    }
  },
};
