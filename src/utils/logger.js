function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/T/, " ").replace(/\..+/, "");
}

const logger = {
  log: {
    server: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [SERVER] ${message}`);
    },
    guild: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [GUILD] ${message}`);
    },
    command: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [COMMAND] ${message}`);
    },
    database: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [MONGO-DATABASE] ${message}`);
    },
    eventRegiter: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [EVENT-REGISTER] ${message}`);
    },
    component: function (message) {
      console.log(`[${getTimestamp()}] [LOGS] [COMPONENT] ${message}`);
    },
  },
  error: function (message) {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`);
  },
  warn: function (message) {
    console.warn(`[${getTimestamp()}] [WARN] ${message}`);
  },
  info: function (message) {
    console.info(`[${getTimestamp()}] [INFO] ${message}`);
  },
};

module.exports = logger;
