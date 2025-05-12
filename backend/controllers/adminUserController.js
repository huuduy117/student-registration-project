// adminUserController.js
// Quy trình thêm mới giảng viên hoặc sinh viên an toàn, tránh conflict

const { mysqlConnection } = require("../config/db");

/**
 * Thêm mới người dùng và bản ghi chi tiết (giảng viên hoặc sinh viên) trong transaction
 * @param {Object} userData - Thông tin người dùng (maNguoiDung, tenDangNhap, matKhau, loaiNguoiDung)
 * @param {Object} detailData - Thông tin chi tiết (giảng viên hoặc sinh viên)
 * @param {'GiangVien'|'SinhVien'} type - Loại người dùng
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function createUserWithDetail(userData, detailData, type) {
  return new Promise((resolve, reject) => {
    // Kiểm tra dữ liệu đầu vào
    if (!userData || typeof userData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai userData trong request body",
      });
    }
    if (!detailData || typeof detailData !== "object") {
      return reject({
        success: false,
        message: "Thiếu hoặc sai detailData trong request body",
      });
    }
    if (!type || (type !== "GiangVien" && type !== "SinhVien")) {
      return reject({
        success: false,
        message: "Thiếu hoặc sai type trong request body",
      });
    }

    mysqlConnection.beginTransaction((err) => {
      if (err)
        return reject({
          success: false,
          message: "Không thể bắt đầu transaction",
        });

      // 1. Thêm vào bảng nguoidung
      const userFields = Object.keys(userData);
      const userValues = Object.values(userData);
      const userSql = `INSERT INTO nguoidung (${userFields.join(
        ","
      )}) VALUES (${userFields.map(() => "?").join(",")})`;
      mysqlConnection.query(userSql, userValues, (err, result) => {
        if (err) {
          console.error("[NguoiDung] Lỗi khi thêm:", err);
          return mysqlConnection.rollback(() => {
            if (err.code === "ER_DUP_ENTRY") {
              reject({
                success: false,
                message: "Mã người dùng đã tồn tại",
                error: err,
              });
            } else {
              reject({
                success: false,
                message: "Lỗi khi thêm người dùng",
                error: err,
              });
            }
          });
        }

        // 2. Thêm vào bảng chi tiết
        let detailSql = "";
        let detailFields = Object.keys(detailData);
        let detailValues = Object.values(detailData);
        if (type === "GiangVien") {
          detailSql = `INSERT INTO giangvien (${detailFields.join(
            ","
          )}) VALUES (${detailFields.map(() => "?").join(",")})`;
        } else if (type === "SinhVien") {
          detailSql = `INSERT INTO sinhvien (${detailFields.join(
            ","
          )}) VALUES (${detailFields.map(() => "?").join(",")})`;
        } else {
          return mysqlConnection.rollback(() => {
            reject({ success: false, message: "Loại người dùng không hợp lệ" });
          });
        }
        mysqlConnection.query(detailSql, detailValues, (err, result) => {
          if (err) {
            console.error(`[${type}] Lỗi khi thêm chi tiết:`, err);
            return mysqlConnection.rollback(() => {
              reject({
                success: false,
                message: "Lỗi khi thêm chi tiết người dùng",
                error: err,
              });
            });
          }
          mysqlConnection.commit((err) => {
            if (err) {
              console.error("[Transaction] Lỗi khi commit:", err);
              return mysqlConnection.rollback(() => {
                reject({
                  success: false,
                  message: "Lỗi khi commit transaction",
                  error: err,
                });
              });
            }
            resolve({ success: true, message: "Thêm mới thành công" });
          });
        });
      });
    });
  });
}

module.exports = { createUserWithDetail };
