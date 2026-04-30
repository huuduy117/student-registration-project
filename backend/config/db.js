// config/db.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { MongoClient } = require("mongodb");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY in environment",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

module.exports = { supabase, connectMongoDB };
