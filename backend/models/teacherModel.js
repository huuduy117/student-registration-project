const db = require("../config/db");

const TeacherModel = {
  getTeachingClassCount: (teacherId, callback) => {
    const query =
      "SELECT COUNT(*) AS classCount FROM classes WHERE teacher_id = ?";
    db.mysqlConnection.query(query, [teacherId], callback);
  },
};

module.exports = TeacherModel;
