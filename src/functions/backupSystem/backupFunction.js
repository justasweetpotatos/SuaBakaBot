const { CommandInteraction, EmbedBuilder, Colors, Message } = require("discord.js");
const fs = require("fs");
const { connector } = require("../../database/connection");
const logger = require("../../utils/logger");
const { default: axios } = require("axios");
const path = require("path");

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
   * @returns {Promise<String>} Attachment folder path
   */
  async createAttachmentDBFolder() {
    const guildAttachmentDBFolderPath = `D:\\attachments_DB\\guild_attachments_${this.guildId}`;
    if (!fs.existsSync(guildAttachmentDBFolderPath))
      fs.mkdir(guildAttachmentDBFolderPath, { recursive: true }, (err) => {
        err
          ? logger.errors.database(
              `Error on creating attachment folder for guild with id ${this.guildId}: ${err}`
            )
          : "";
      });
    return guildAttachmentDBFolderPath;
  }

  /**
   *
   * @param {Message<Boolean>} messsage
   * @returns {Promise<String>} Id attachment list
   */
  async downloadAttactmentsOfMessage(messsage) {
    try {
      const guildAttachmentDBFolderPath = await this.createAttachmentDBFolder();
      let attachmentIDList = "";

      messsage.attachments.forEach(async (msgAttachment) => {
        try {
          const id = msgAttachment.id;
          const attachmentURL = msgAttachment.url;

          // Dowload attachment
          const response = await axios.get(attachmentURL, { responseType: "arraybuffer" }).catch((err) => {
            err ? console.log(err) : "";
          });

          const { fileTypeName, fileName } = (() => {
            const arrayOfString = path.basename(attachmentURL).split("?")[0].split(".");
            const fileTypeName = arrayOfString[arrayOfString.length - 1];
            const fileName = path.basename(attachmentURL).split("?")[0].replace(fileTypeName, "");
            return { fileTypeName: fileTypeName, fileName: fileName };
          })();

          const fullFileName = `${id}.${fileName}${fileTypeName}`;

          const filePath = path.join(guildAttachmentDBFolderPath, fullFileName);

          fs.writeFile(filePath, response.data, (err) => {
            if (err) {
              logger.errors.server(`Lỗi khi ghi tệp đính kèm: ${err}`);
            } else {
              attachmentIDList += `${id} `;
            }
          });
          return attachmentIDList;
        } catch (error) {
          logger.errors.database(
            `Error on getting attachment file of message with id ${messsage.id}: ${error}`
          );
        }
      });

      return attachmentIDList;
    } catch (error) {
      logger.errors.database(`Error on getting attachment file of message with id ${messsage.id}: ${error}`);
      return "";
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
            .setDescription(
              `\`Messages:\` **${countOfMessage}**\n\`Failed Messages:\` **${countOfFailedMessage}**`
            )
            .setColor(Colors.Blurple),
        ],
      });

      while (true) {
        // Get message
        const listFechedMessage = await channel.messages.fetch({
          limit: 100,
          before: startFetchingMsg.id,
        });

        // If list size equal to zero, stop loop.
        if (listFechedMessage.size === 0) break;

        // Start check and insert to DB
        listFechedMessage.forEach(async (msg) => {
          //If message come from bot, skip this.
          if (msg.author.bot) return;

          // Prepare to insert message embed
          const embeds = msg.embeds;
          if (embeds.length === 0);

          // Prepare to insert message attachment
          let attachmentIDList = await this.downloadAttactmentsOfMessage(msg);

          // Create insert messsage query.
          const query = `
            INSERT INTO ${this.guildDBName}.${tableName} (id, author_id, \`content\`, attachment_id_list)
            VALUES(?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            \`content\` = VALUES(\`content\`),
            attachment_id_list = VALUES(attachment_id_list);
            `;

          // Use try catch to process and catch error.
          try {
            // Execute query.
            await connector.executeQuery(query, [msg.id, msg.author.id, msg.content, attachmentIDList]);
            // After insert completed, add to countOfMessage
            countOfMessage += 1;

            // If countOfMessage divided to 100, send status
            if (countOfMessage % 5000 == 0)
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
            .setDescription(
              `\`Messages:\` **${countOfMessage}**\n\`Failed Messages:\` **${countOfFailedMessage}**`
            )
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
