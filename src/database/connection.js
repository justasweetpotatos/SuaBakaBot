const mysql = require("mysql");
const logger = require("../utils/logger");
const host = `localhost`;
const user = `root`;
const password = ``;

class Connector {
  constructor() {
    this.adminConnection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "password",
      port: 3306,
    });
  }

  /**
   * Chạy query
   * @param {String} query
   * @param {Array<any>} values
   * @returns {Promise<any>}
   */
  async executeQuery(query, values) {
    return new Promise((resolve, reject) => {
      this.adminConnection.query(query, values, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }
}

const connector = new Connector();

module.exports = { connector };
