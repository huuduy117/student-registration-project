const StudentModel = require("../models/studentModel");

exports.getAllStudents = (req, res) => {
  StudentModel.getAllStudents((err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn!" });
    }
    res.json(results);
  });
};
