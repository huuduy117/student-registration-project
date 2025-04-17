const db = require("../config/db");

exports.getAllStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn!" });
    }
    res.json(results);
  });
};
