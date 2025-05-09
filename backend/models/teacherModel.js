const db = require("../config/db");

const TeacherModel = {
  getTeachingClassCount: (teacherId, callback) => {
    const query = `
      SELECT COUNT(*) AS classCount 
      FROM Lop 
      WHERE maCVHT = (SELECT maGV FROM GiangVien WHERE maGV = ?)
    `;
    db.mysqlConnection.query(query, [teacherId], callback);
  },
};

module.exports = TeacherModel;
