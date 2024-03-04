const databaseTableNames = {
  suwaBotGuildData: {
    DATABASE_NAME: `\`suwa-bot-guild-data\``,
    GUILDS: `\`guilds\``,
    NOICHU_CHANNELS: `\`noichu_channels\``,
  },
};

module.exports = {
  databaseQuerys: {
    NO_DUPLICATE_INSERT_GUILD: `      
      INSERT INTO ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.GUILDS}
      (id, name, max_noichu_channel)
      VALUES (?, ?, ?)
      `,
    NO_DUPLICATE_INSERT_NOICHU_CHANNEL: `
      INSERT INTO ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
      (id, guild_id)
      VALUES (?, ?)
    `,
    GET_GUILD_CONFIG: `
      SELECT * FROM ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.GUILDS}
      WHERE id = ?
    `,
    GET_NOICHU_CHANNEL_CONFIG: `
      SELECT * FROM ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
      WHERE id = ?
    `,
    GET_ALL_NOICHU_CHANNEL_CONFIG_IN_GUILD: `
      SELECT ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}.*
      FROM ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.GUILDS}
      RIGHT JOIN ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
      ON ${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}.guild_id = ${databaseTableNames.suwaBotGuildData.GUILDS}.id
      WHERE ${databaseTableNames.suwaBotGuildData.GUILDS}.id = ?;
    `,
    UPDATE_NOICHU_CHANNEL_CONFIG: `
      INSERT INTO ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
      (\`id\`, \`max_words\`, \`last_word\`, \`last_user_id\`, \`word_used_list\`, \`guild_id\`, \`repeated\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      max_words = VALUES(max_words),
      last_word = VALUES(last_word),
      last_user_id = VALUES(last_user_id),
      word_used_list = VALUES(word_used_list),
      repeated = VALUES(repeated)
    `,
    UPDATE_NOICHU_USER_AND_WORD: `
      INSERT INTO ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
      (\`id\`, \`max_words\`, \`last_word\`, \`last_user_id\`, \`word_used_list\`, \`guild_id\`, \`repeated\`) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      last_word = VALUES(last_word),
      last_user_id = VALUES(last_user_id),
      word_used_list = VALUES(word_used_list),
    `,
    DELETE_NOICHU_CHANNEL_CONFIG: `
      DELETE FROM ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS} 
      WHERE (id = ?);
    `,
    getNumberOf: {
      NOICHU_CHANNEL_IN_GUILD: `
        SELECT COUNT(*) AS count
        FROM ${databaseTableNames.suwaBotGuildData.DATABASE_NAME}.${databaseTableNames.suwaBotGuildData.NOICHU_CHANNELS}
        WHERE guild_id = ?
      `,
    },
  },
};
