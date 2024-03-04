const mysql = require("mysql");
const logger = require("../utils/logger");
const { Collection } = require("discord.js");

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "MySQLServer",
  database: "noichu",
});

// Connect to the database
function connect() {
  connection.connect((err) => {
    if (err) {
      return `Error connecting to MySQL: ${err}`;
    }
    return "Connected to MySQL database";
  });
}

function close() {
  connection.connect((err) => {
    if (err) {
      return `Error connecting to MySQL: ${err}`;
    }
    return `Connected to MySQL database`;
  });
}

function reconnect() {
  logger.log.database("Starting reconnect...");
  let log = close();
  if (log.startsWith("Error")) {
    logger.error(log);
    return false;
  }
  log = connect();
  if (log.startsWith("Error")) {
    logger.error(log);
    return false;
  }
  logger.log.database("Reconnect complete !");
  return true;
}

// // Example: Insert data into a table
// const insertQuery = "INSERT INTO your_table (column1, column2) VALUES (?, ?)";
// const values = ["value1", "value2"];

// connection.query(insertQuery, values, (err, results) => {
//   if (err) {
//     logger.error("Error inserting data:", err);
//     return;
//   }
//   logger.log("Data inserted:", results);
// });

// // Example: Select data from a table
// const selectQuery = "SELECT * FROM your_table";

// connection.query(selectQuery, (err, results) => {
//   if (err) {
//     logger.error("Error selecting data:", err);
//     return;
//   }
//   logger.log("Selected data:", results);
// });

// // Example: Update data in a table
// const updateQuery = "UPDATE your_table SET column1 = ? WHERE column2 = ?";
// const updateValues = ["new_value", "condition_value"];

// connection.query(updateQuery, updateValues, (err, results) => {
//   if (err) {
//     logger.error("Error updating data:", err);
//     return;
//   }
//   logger.log("Data updated:", results);
// });

// // Example: Delete data from a table
// const deleteQuery = "DELETE FROM your_table WHERE column1 = ?";
// const deleteValues = ["value_to_delete"];

// connection.query(deleteQuery, deleteValues, (err, results) => {
//   if (err) {
//     logger.error("Error deleting data:", err);
//     return;
//   }
//   logger.log("Data deleted:", results);
// });

// Close the connection
// connection.end((err) => {
//   if (err) {
//     logger.error("Error closing connection:", err);
//     return;
//   }
//   logger.log("Connection closed");
// });

module.exports = {
  connection,
  /**
   *
   * @param {String} query
   * @param {Array} values
   * @returns {Promise<Array>}
   */
  async runQuery(query, values) {
    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
      connection.commit();
    });
  },
};
