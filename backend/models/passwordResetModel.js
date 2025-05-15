const { mysqlConnection } = require("../config/db")

// Create password reset tokens table if it doesn't exist
const createPasswordResetTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS PasswordResetTokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      maNguoiDung VARCHAR(20) NOT NULL,
      token VARCHAR(100) NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (maNguoiDung) REFERENCES NguoiDung(maNguoiDung) ON DELETE CASCADE
    )
  `

  mysqlConnection.query(query, (err) => {
    if (err) {
      console.error("Error creating password reset tokens table:", err)
    } else {
      console.log("Password reset tokens table created or already exists")
    }
  })
}

// Initialize the table
createPasswordResetTable()

// Generate a random token
const generateToken = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Create a password reset token
const createResetToken = (maNguoiDung) => {
  return new Promise((resolve, reject) => {
    // Delete any existing tokens for this user
    const deleteQuery = "DELETE FROM PasswordResetTokens WHERE maNguoiDung = ?"
    mysqlConnection.query(deleteQuery, [maNguoiDung], (err) => {
      if (err) {
        return reject(err)
      }

      const token = generateToken()

      // Set expiration time to 30 minutes from now
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 30)

      const insertQuery = "INSERT INTO PasswordResetTokens (maNguoiDung, token, expiresAt) VALUES (?, ?, ?)"
      mysqlConnection.query(insertQuery, [maNguoiDung, token, expiresAt], (err, result) => {
        if (err) {
          return reject(err)
        }
        resolve({ token, expiresAt })
      })
    })
  })
}

// Verify a password reset token
const verifyResetToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT maNguoiDung, expiresAt 
      FROM PasswordResetTokens 
      WHERE token = ? AND expiresAt > NOW()
    `

    mysqlConnection.query(query, [token], (err, results) => {
      if (err) {
        return reject(err)
      }

      if (results.length === 0) {
        return resolve(null)
      }

      resolve(results[0])
    })
  })
}

// Delete a password reset token
const deleteResetToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM PasswordResetTokens WHERE token = ?"

    mysqlConnection.query(query, [token], (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result.affectedRows > 0)
    })
  })
}

module.exports = {
  createResetToken,
  verifyResetToken,
  deleteResetToken,
}
