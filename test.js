class ConfessionPost {
  /**
   *
   * @param {String} id
   * @param {String} authorId
   * @param {String} channelId
   * @param {String} guildId
   * @param {String} name
   * @param {String} content
   * @param {Boolean} anonymous
   * @param {Boolean} locked
   */
  constructor(id, authorId, channelId, guildId, name, content, anonymous, locked) {
    // User data
    this.id = id;
    this.authorId = authorId;
    this.channelId = channelId;
    this.guildId = guildId;

    // Post data
    this.name = name;
    this.content = content;
    this.anonymous = anonymous;
    this.locked = locked;
    this.sync = false;
  }

  /**
   *
   * @returns {Promise<Boolean>}
   */
  async sync() {
    try {
      const query = `SELECT * FROM guild_${this.guildId}.confession_posts WHERE id = '${this.id}'`;

      const resutls = await connector.executeQuery(query);

      if (resutls.size == 0) return false;

      this.name = resutls[0].name;
      this.content = resutls[0].content;
      this.locked = resutls[0].locked;
      return true;
    } catch (error) {
      logger.errors.database(`Error on syncing data of post with id ${this.id}: ${error}`);
      return false;
    }
  }

  /**
   * @returns {Promise<Boolean>}
   */
  async update() {
    try {
      const tableName = `guild_${this.guildId}`;
      const query = `
        INSERT INTO ${tableName}.confession_posts
        (id, author_id, channel_id, guild_id, \`name\`, content, is_nsfw, \`locked\`, anonymous)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        \`name\` = VALUES(\`name\`),
        content = VALUES(content),
        anonymous = VALUES(anonymous),
        \`locked\` = VALUES(\`locked\`)
      `;

      const values = [
        this.id,
        this.authorId,
        this.channelId,
        this.guildId,
        this.name,
        this.content,
        -1,
        this.anonymous ? 1 : -1,
        this.locked ? 1 : 1,
      ];
      await connector.executeQuery(query, values);
      return true;
    } catch (error) {
      logger.errors.database(`Error on updating data of post ${this.id} in channel ${this.channelId}: ${error}`);
      return false;
    }
  }
}

const h = new ConfessionPost().sync();
