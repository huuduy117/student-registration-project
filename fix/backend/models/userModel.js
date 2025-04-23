const { mysqlConnection } = require("../config/db");

const findUserByUsername = (username, callback) => {
  const query = "SELECT * FROM users WHERE username = ?";
  mysqlConnection.query(query, [username], callback);
};

module.exports = {
  findUserByUsername,
};
