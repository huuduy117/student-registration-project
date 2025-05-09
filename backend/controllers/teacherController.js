const TeacherModel = require("../models/teacherModel");

exports.getTeachingClassCount = (req, res) => {
  const teacherId = req.user.id; // Lấy từ JWT sau khi đăng nhập

  TeacherModel.getTeachingClassCount(teacherId, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn!" });
    }
    res.json({ classCount: results[0].classCount });
  });
};
