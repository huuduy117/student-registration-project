# Hoàn Tất Migration: Supabase (Tiếng Anh)

Quá trình chuyển đổi backend từ MySQL sang Supabase đã hoàn tất 100%. Dưới đây là tóm tắt toàn bộ những thay đổi đã thực hiện:

## 1. Schema Database Mới (Chuẩn Tiếng Anh)

Để giải quyết tình trạng các controllers lúc dùng tiếng Việt lúc dùng tiếng Anh, tôi đã tạo mới hoàn toàn một file SQL Schema để bạn import vào Supabase:
- **[NEW]** [supabase_schema.sql](file:///c:/Users/nguynduy/Desktop/student-registration-project/Database/supabase_schema.sql)
- Các bảng được chuyển đổi (ví dụ: `NguoiDung` → `users`, `YeuCauMoLop` → `class_requests`, `SinhVien_MonHoc` → `student_courses`, `BangTin` → `news`).
- Mật khẩu sample, roles, type fields đều được chuẩn hóa sang tiếng Anh (Student, Teacher, Admin, v.v.).

## 2. Models & Controllers Rewrite

Toàn bộ backend được cập nhật đồng bộ để truy vấn đúng schema mới:

- **Models**:
  - `userModel.js` (Query `users` table)
  - `studentModel.js` (Query `students`, `majors`, `classes`, `course_sections`)
  - `teacherModel.js` (Query `classes`)
  - `passwordResetModel.js` (Query `password_reset_tokens`)

- **Controllers**:
  - `userController.js`, `studentController.js`
  - `adminUserController.js` (Thay vì query `NguoiDung`, `BangTin`, đã update sang query `users`, `news`)
  - `classRequestController.js` (Cập nhật logic approve dùng role tiếng Anh)
  - `newsfeedController.js` (Cập nhật logic fetch dữ liệu news theo `audience` enum)
  - `scheduleController.js`, `teacher_scheduleController.js`
  - `teacherController.js`

## 3. Routes & App Configuration

- Các route paths đã được đổi biến (params) sang tiếng Anh (ví dụ: `maSV` → `studentId`, `maGV` → `teacherId`, `maLopHP` → `sectionId`).
- Các role check trong middleware `authorize(...)` nay đã dùng English (Admin, Student, Teacher, AcademicAffairs).
- Dọn dẹp `app.js` và `auth.js` cho gọn gàng.
- Cập nhật file cấu hình và xoá `mysql2`.

## 4. Environment Variables

File `backend/.env` đã được gỡ bỏ toàn bộ config của MySQL và thêm biến dùng cho Supabase.

> [!IMPORTANT]
> **Hành động cần làm từ phía bạn:**
> 1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard/projects), chọn project của bạn -> **SQL Editor**.
> 2. Copy nội dung file `Database/supabase_schema.sql` dán vào và nhấn **Run** để tạo bảng và nạp dữ liệu mẫu.
> 3. Lấy `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` (từ *Project Settings -> API*) và dán vào file `backend/.env`.
> 4. Chạy `npm run dev` trong thư mục `backend` để khởi động server (tôi đã cài `supabase-js` thành công).

Sau khi setup Supabase xong, backend của bạn đã hoàn toàn sẵn sàng phục vụ frontend! Mọi dữ liệu (trừ chat history dùng MongoDB) sẽ nằm trọn vẹn và an toàn trên Postgres của Supabase.
