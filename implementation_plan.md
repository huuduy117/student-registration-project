# Hoàn Tất Migration: Thống Nhất Tiếng Anh + Tạo Schema Supabase

## Tổng Quan

Codebase hiện tại có sự **không nhất quán nghiêm trọng**: một số controller dùng tên bảng tiếng Việt, một số dùng tiếng Anh, không cái nào đồng bộ với nhau. Kế hoạch này sẽ:

1. **Tạo một SQL schema mới hoàn toàn bằng tiếng Anh** để chạy trên Supabase
2. **Rewrite toàn bộ backend** (controllers + models) để dùng tên bảng/field tiếng Anh nhất quán
3. **Cập nhật .env** và dọn dẹp dependencies

---

## Bảng Mapping: Tiếng Việt → Tiếng Anh

### Tables

| Tên cũ (Việt) | Tên mới (Anh) |
|---|---|
| `NguoiDung` | `users` |
| `ChuyenNganh` | `majors` |
| `BoMon` | `departments` |
| `GiangVien` | `teachers` |
| `Lop` | `classes` |
| `MonHoc` | `courses` |
| `LopHocPhan` | `course_sections` |
| `SinhVien` | `students` |
| `YeuCauMoLop` | `class_requests` |
| `LichSuThayDoiYeuCau` | `request_history` |
| `ChuyenNganh_MonHoc` | `major_courses` |
| `SinhVien_MonHoc` | `student_courses` |
| `BangTin` | `news` |
| `DangKyLichDay` | `teaching_registrations` |
| `XuLyYeuCau` | `request_processing` |
| `PhanCongGiangVien` | `teacher_assignments` |
| `PhanLop` | `class_enrollments` |
| `ThoiKhoaBieuSinhVien` | `student_schedules` |
| `ThoiKhoaBieuGiangVien` | `teacher_schedules` |
| `PasswordResetTokens` | `password_reset_tokens` |

### Key Field Mapping (users table)

| Cũ | Mới |
|---|---|
| `maNguoiDung` | `id` |
| `tenDangNhap` | `username` |
| `matKhau` | `password` |
| `loaiNguoiDung` | `role` |

---

## Các File Sẽ Thay Đổi

### Phase 1: Database Schema

#### [NEW] `Database/supabase_schema.sql`
Schema SQL hoàn toàn bằng tiếng Anh, sẵn sàng chạy trên Supabase SQL Editor.

---

### Phase 2: Configuration

#### [MODIFY] `backend/.env`
- Thêm `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Xóa MySQL vars (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)

#### [MODIFY] `backend/package.json`
- Xóa `mysql2`, `-`, `backend`, `check-disk-space` (không dùng)

---

### Phase 3: Models — Rewrite hoàn toàn

#### [MODIFY] `backend/models/userModel.js`
- `NguoiDung` → `users`, field mapping tiếng Anh
- Sửa outer join issue

#### [MODIFY] `backend/models/studentModel.js`
- `students` + `student_courses` đã gần đúng nhưng field names cần sync lại

#### [MODIFY] `backend/models/teacherModel.js`
- `Lop` → `classes`

---

### Phase 4: Controllers — Rewrite hoàn toàn

#### [MODIFY] `backend/controllers/userController.js`
- `users` đúng rồi nhưng field names cần đồng bộ

#### [MODIFY] `backend/controllers/teacherController.js`
- Toàn bộ tên bảng tiếng Việt → tiếng Anh

#### [MODIFY] `backend/controllers/adminUserController.js`
- Toàn bộ tên bảng tiếng Việt → tiếng Anh

#### [MODIFY] `backend/controllers/classRequestController.js`
- Đã dùng tiếng Anh nhưng một số tên bảng không đúng với schema mới

#### [MODIFY] `backend/controllers/newsfeedController.js`
- Toàn bộ tên bảng tiếng Việt → tiếng Anh

#### [MODIFY] `backend/controllers/scheduleController.js`
- Toàn bộ tên bảng tiếng Việt → tiếng Anh

#### [MODIFY] `backend/controllers/teacher_scheduleController.js`
- Toàn bộ tên bảng tiếng Việt → tiếng Anh

#### [MODIFY] `backend/controllers/passwordResetController.js`
- `NguoiDung` → `users`, fields tiếng Anh

#### [MODIFY] `backend/models/passwordResetModel.js`
- `PasswordResetTokens` → `password_reset_tokens`

---

## Verification Plan

### Tự động
- Chạy backend, kiểm tra không có lỗi kết nối
- Gọi API `/api/users/login` để test

### Thủ công (user chạy trên Supabase Dashboard)
1. Copy nội dung `supabase_schema.sql` → Supabase SQL Editor → Run
2. Điền `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` vào `.env`
3. Test đăng nhập, xem thời khóa biểu, tạo/duyệt yêu cầu mở lớp
