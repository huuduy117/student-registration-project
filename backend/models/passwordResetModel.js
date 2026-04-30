const { supabase } = require("../config/db");
const crypto = require("crypto");

const generateToken = () => {
  // 64-char hex token as required by the workflow contract
  return crypto.randomBytes(32).toString("hex");
};

const createResetToken = async (userId) => {
  try {
    // Delete existing tokens for this user
    await supabase.from("password_reset_tokens").delete().eq("user_id", userId);

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const { data, error } = await supabase
      .from("password_reset_tokens")
      .insert({ user_id: userId, token, expires_at: expiresAt.toISOString() })
      .select()
      .single();

    if (error) throw error;
    return { token, expiresAt };
  } catch (error) {
    console.error("Error creating reset token:", error);
    throw error;
  }
};

const verifyResetToken = async (token) => {
  try {
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    throw error;
  }
};

const deleteResetToken = async (token) => {
  try {
    const { error } = await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("token", token);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting reset token:", error);
    throw error;
  }
};

module.exports = { createResetToken, verifyResetToken, deleteResetToken };
