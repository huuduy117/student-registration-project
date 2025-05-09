const Teacher = require("../models/teacherModel");
const { mysqlConnection } = require("../config/db");

const someMethod = async (req, res) => {
  try {
    // Your controller logic here
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClassCount = (req, res) => {
  const teacherId = req.user.userId; // Giảng viên đã được xác thực qua JWT
  console.log("Teacher ID:", teacherId);

  mysqlConnection.query(
    `SELECT maGV FROM GiangVien WHERE maGV = ?`, // Lấy maGV của giảng viên
    [teacherId],
    (err, results) => {
      if (err) {
        console.error("Error fetching maGV:", err);
        return res.status(500).json({ message: "Lỗi truy vấn!" });
      }

      // Log ra maGV từ bảng GiangVien
      console.log("maGV from GiangVien:", results?.[0]?.maGV);

      mysqlConnection.query(
        `SELECT COUNT(*) AS classCount FROM Lop WHERE maCVHT = (SELECT maGV FROM GiangVien WHERE maGV = ?)`,
        [teacherId],
        (err2, results2) => {
          if (err2) {
            console.error("Error fetching class count:", err2);
            return res.status(500).json({ message: "Lỗi truy vấn lớp học!" });
          }

          // Log ra số lượng lớp học
          console.log("Class count:", results2?.[0]?.classCount);

          res.json({ classCount: results2[0].classCount });
        }
      );
    }
  );
};

module.exports = {
  someMethod,
  getClassCount,
  // other methods...
};
