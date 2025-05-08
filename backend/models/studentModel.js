const db = require("../config/db")

const StudentModel = {
  getAllStudents: (callback) => {
    db.query("SELECT * FROM students", callback)
  },
}

module.exports = StudentModel
