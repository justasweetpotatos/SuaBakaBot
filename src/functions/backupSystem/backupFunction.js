const { CommandInteraction, EmbedBuilder, Colors } = require("discord.js");
const { connector } = require("../../database/connection");
const logger = require("../../utils/logger");

const backupStatus = {
  success: 1,
  failed: 2,
  interrupted: 3,
};

class BackupSystem {
  /**
   *
   * @param {String} guildId
   */
  constructor(guildId) {
    if (!guildId) throw new Error(`Missing attribute guildId`);
    this.guildId = guildId;
    this.guildDBName = `backup_guild_` + this.guildId;
  }

  /**
   * @returns {Promise<void>}
   */
  async createDB() {
    try {
      const query = `CREATE DATABASE IF NOT EXISTS ${this.guildDBName}`;
      await connector.executeQuery(query);
    } catch (error) {
      logger.errors.database(`Error on creating database with name ${this.guildDBName}: ${error}`);
    }
  }

  /**
   *
   * @param {String} channelId
   */
  async createChannelMessageTable(channelId) {
    try {
      await this.createDB();

      const query = `
        CREATE TABLE IF NOT EXISTS ${this.guildDBName}.channel_${channelId}_messages
        LIKE backup_guild_template.channel_id_messages
        `;

      await connector.executeQuery(query);
    } catch (error) {
      logger.errors.database(
        `Error on creating table for guild with id ${this.guildId} and with name ${this.guildDBName}: ${error}`
      );
    }
  }

  /**
   *
   * @param {import("discord.js").TextBasedChannel} channel
   * @param {CommandInteraction} interaction
   * @returns {Promise<{status: number,
   * countOfMessage: number,
   * countOfFailedMessage: number,
   * statusMessage: Message<true>
   * }>}
   */
  async backupMessages(interaction, channel) {
    try {
      // Create DB and channel table if not exist.
      await this.createDB();
      await this.createChannelMessageTable(channel.id);

      // Create status code
      let status = 1;

      // Channel message table
      const tableName = `channel_${channel.id}_messages`;

      // Get start fetch message
      let startFetchingMsg = (await channel.messages.fetch({ limit: 1 })).first();

      // Create status data
      let countOfMessage = 0;
      let countOfFailedMessage = 0;

      // Create status messsage;
      const statusMessage = await interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Status:`)
            .setDescription(`\`Messages:\` **${countOfMessage}**\n\`Failed Messages:\` **${countOfFailedMessage}**`)
            .setColor(Colors.Blurple),
        ],
      });

      while (true) {
        // Get message
        const listFechedMessage = await channel.messages.fetch({ limit: 100, before: startFetchingMsg.id });

        // If list size equal to zero, stop loop.
        if (listFechedMessage.size === 0) break;

        // Start check and insert to DB
        listFechedMessage.forEach(async (msg) => {
          //If message come from bot, skip this.
          if (msg.author.bot) return;

          // Create insert messsage query.
          const query = `
            INSERT INTO ${this.guildDBName}.${tableName} (id, content, author_id) 
            VALUES(?, ?, ?)
            ON DUPLICATE KEY UPDATE
            content = VALUES(content)
            `;

          // Use try catch to process and catch error.
          try {
            // Execute query.
            await connector.executeQuery(query, [msg.id, msg.content, msg.author.id]);
            // After insert completed, add to countOfMessage
            countOfMessage += 1;

            // If countOfMessage divided to 100, send status
            if (countOfMessage % 100 == 0)
              await statusMessage.edit({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`Status:`)
                    .setDescription(
                      `\`Messages:\` **${countOfMessage}**\n\`Failed Messages:\` **${countOfFailedMessage}**`
                    )
                    .setColor(Colors.Blurple),
                ],
              });
          } catch (error) {
            status = 2;
            countOfFailedMessage += 1;
            logger.errors.database(`Error on backup message with id ${msg.id}: ${error}`);
            if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD")
              logger.errors.database(`messsage content: ${msg.content}`);
          }
        });

        startFetchingMsg = listFechedMessage.last();
        if (!startFetchingMsg) break;
      }

      // Last time edit status message
      await statusMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Status:`)
            .setDescription(`\`Messages:\` **${countOfMessage}**\n\`Failed Messages:\` **${countOfFailedMessage}**`)
            .setColor(Colors.Blurple),
        ],
      });

      return {
        status: 1,
        countOfMessage: countOfMessage,
        countOfFailedMessage: countOfFailedMessage,
        statusMessage: statusMessage,
      };
    } catch (error) {
      logger.errors.database(`Error on backup channel with id ${channel.id}: ${error}`);
      return backupStatus.failed;
    }
  }
}

module.exports = { BackupSystem };
