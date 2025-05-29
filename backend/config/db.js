// config/db.js
require("dotenv").config();
const mysql = require("mysql2");
const { MongoClient } = require("mongodb");

// MySQL connection setup
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const mysqlConnection = mysql.createConnection(dbConfig);

// Handle disconnects
function handleDisconnect() {
  mysqlConnection.connect((err) => {
    if (err) {
      console.log("Error connecting to database:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  mysqlConnection.on("error", (err) => {
    console.log("Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// MongoDB connection setup
const connectMongoDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    const mongoDB = client.db("message-storage");
    console.log("Connected to MongoDB");

    return mongoDB;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports = { mysqlConnection, connectMongoDB };
