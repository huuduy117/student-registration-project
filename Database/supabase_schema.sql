-- ============================================================
-- SUPABASE SCHEMA - Student Registration System
-- All table and column names in English
-- Version: FIXED (các lỗi đã được sửa)
--
-- Danh sách sửa chữa:
--   [FIX 1] Đồng nhất process_status: bỏ '0_Draft', dùng '0_Pending'
--   [FIX 2] Thêm cột `notes TEXT` vào request_history (bị thiếu)
--   [FIX 3] Sửa data mẫu: '0_Draft' → '0_Pending' trong class_requests
--            và request_history
--   [FIX 4] Thêm comment phân biệt teaching_registrations vs teacher_assignments
--   [FIX 5] Bổ sung start_date / end_date vào sample data course_sections
-- ============================================================

-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

-- 1. users (NguoiDung)
CREATE TABLE users (
    id          VARCHAR(20) PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        TEXT CHECK (role IN ('Student', 'Teacher', 'AcademicAffairs', 'DepartmentHead', 'Admin', 'FacultyHead')) NOT NULL
);

-- 2. majors (ChuyenNganh)
CREATE TABLE majors (
    id      VARCHAR(20) PRIMARY KEY,
    name    VARCHAR(100)
);

-- 3. departments (BoMon)
CREATE TABLE departments (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(100),
    description     TEXT,
    founded_date    DATE
);

-- 4. teachers (GiangVien)
CREATE TABLE teachers (
    id              VARCHAR(20) PRIMARY KEY REFERENCES users(id),
    full_name       VARCHAR(100),
    email           VARCHAR(100),
    phone           VARCHAR(20),
    department_id   VARCHAR(20) REFERENCES departments(id),
    degree          VARCHAR(50),
    academic_rank   VARCHAR(50),
    specialization  VARCHAR(100),
    position        VARCHAR(50)
);

-- 5. classes (Lop)
CREATE TABLE classes (
    id          VARCHAR(20) PRIMARY KEY,
    name        VARCHAR(100),
    advisor_id  VARCHAR(20) REFERENCES teachers(id)
);

-- 6. courses (MonHoc)
CREATE TABLE courses (
    id                  VARCHAR(20) PRIMARY KEY,
    name                VARCHAR(100),
    credits             INT,
    description         TEXT,
    type                TEXT CHECK (type IN ('Required', 'Elective')),
    prerequisite        TEXT,
    theory_periods      INT,
    practice_periods    INT
);

-- 7. course_sections (LopHocPhan)
CREATE TABLE course_sections (
    id              VARCHAR(30) PRIMARY KEY,
    course_id       VARCHAR(20) REFERENCES courses(id),
    academic_year   CHAR(9),
    semester        VARCHAR(10),
    capacity        INT,
    enrolled_count  INT DEFAULT 0,
    status          TEXT CHECK (status IN ('NotOpen', 'Active', 'Closed')) DEFAULT 'NotOpen',
    start_date      DATE,
    end_date        DATE,
    teacher_id      VARCHAR(20) REFERENCES teachers(id)
);

-- 8. students (SinhVien)
CREATE TABLE students (
    id              VARCHAR(20) PRIMARY KEY REFERENCES users(id),
    full_name       VARCHAR(100),
    email           VARCHAR(100),
    phone           VARCHAR(20),
    address         VARCHAR(255),
    birth_date      DATE,
    gender          TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    enrollment_date DATE,
    status          TEXT CHECK (status IN ('Enrolled', 'Graduated', 'Suspended', 'Deferred')),
    major_id        VARCHAR(20) REFERENCES majors(id),
    class_id        VARCHAR(20) REFERENCES classes(id)
);

-- 9. class_requests (YeuCauMoLop)
-- overall_status: trạng thái tổng ('Submitted','Approved','Rejected','Cancelled')
-- process_status: bước xử lý nội bộ theo workflow phê duyệt
CREATE TABLE class_requests (
    id                  VARCHAR(20) PRIMARY KEY,
    submitted_at        DATE,
    overall_status      TEXT CHECK (overall_status IN ('Submitted', 'Approved', 'Rejected', 'Cancelled')) DEFAULT 'Submitted',
    -- [FIX 1] Bỏ '0_Draft', thống nhất dùng '0_Pending' làm trạng thái khởi tạo
    process_status      TEXT CHECK (process_status IN ('0_Pending','1_AcademicReceived','2_DeptHeadReceived','3_FacultyHeadReceived','4_WaitingOpen')) DEFAULT '0_Pending',
    student_id          VARCHAR(20) REFERENCES students(id),
    -- section_id và teacher_id có thể NULL khi request chưa được duyệt
    section_id          VARCHAR(30) REFERENCES course_sections(id),
    course_id           VARCHAR(20) REFERENCES courses(id),
    teacher_id          VARCHAR(20) REFERENCES teachers(id),
    participant_count   INT DEFAULT 1,
    description         TEXT
);

-- 10. request_history (LichSuThayDoiYeuCau)
-- [FIX 1] Đồng nhất CHECK constraint: bỏ '0_Draft'
-- [FIX 2] Thêm cột notes TEXT (bị thiếu trong schema gốc)
CREATE TABLE request_history (
    id              VARCHAR(20) PRIMARY KEY,
    request_id      VARCHAR(20) REFERENCES class_requests(id),
    old_status      TEXT CHECK (old_status IN ('0_Pending','1_AcademicReceived','2_DeptHeadReceived','3_FacultyHeadReceived','4_WaitingOpen')),
    new_status      TEXT CHECK (new_status IN ('0_Pending','1_AcademicReceived','2_DeptHeadReceived','3_FacultyHeadReceived','4_WaitingOpen')),
    changed_at      DATE,
    changed_by      VARCHAR(20) REFERENCES users(id),
    notes           TEXT  -- [FIX 2] Cột này bị thiếu trong schema gốc
);

-- 11. major_courses (ChuyenNganh_MonHoc)
CREATE TABLE major_courses (
    major_id    VARCHAR(20) REFERENCES majors(id),
    course_id   VARCHAR(20) REFERENCES courses(id),
    required    BOOLEAN NOT NULL,
    PRIMARY KEY (major_id, course_id)
);

-- 12. student_courses (SinhVien_MonHoc)
CREATE TABLE student_courses (
    student_id  VARCHAR(20) REFERENCES students(id),
    course_id   VARCHAR(20) REFERENCES courses(id),
    section_id  VARCHAR(30) REFERENCES course_sections(id),
    registered_at DATE,
    grade       DECIMAL(4,2),
    PRIMARY KEY (student_id, course_id, section_id)
);

-- 13. news (BangTin)
CREATE TABLE news (
    id          VARCHAR(20) PRIMARY KEY,
    title       VARCHAR(255),
    content     TEXT,
    posted_at   DATE,
    posted_by   VARCHAR(20) REFERENCES users(id),
    audience    TEXT CHECK (audience IN ('Student', 'Teacher', 'All')) DEFAULT 'All'
);

-- 14. teaching_registrations (DangKyLichDay)
-- [FIX 4] Bảng này dùng để GV tự đăng ký nguyện vọng dạy (Pending → Approved/Rejected)
-- Khác với teacher_assignments là bảng ghi nhận phân công CHÍNH THỨC sau khi được duyệt
CREATE TABLE teaching_registrations (
    id              VARCHAR(30) PRIMARY KEY,
    teacher_id      VARCHAR(20) REFERENCES teachers(id),
    section_id      VARCHAR(30) REFERENCES course_sections(id),
    registered_at   DATE,
    status          TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending'
);

-- 15. request_processing (XuLyYeuCau)
CREATE TABLE request_processing (
    id              VARCHAR(20) PRIMARY KEY,
    request_id      VARCHAR(20) REFERENCES class_requests(id),
    processor_role  TEXT CHECK (processor_role IN ('AcademicAffairs', 'DepartmentHead', 'FacultyHead')),
    processed_by    VARCHAR(20) REFERENCES users(id),
    processed_at    DATE,
    status          TEXT CHECK (status IN ('Forwarded', 'Approved', 'Rejected')),
    notes           TEXT
);

-- 16. teacher_assignments (PhanCongGiangVien)
-- [FIX 4] Bảng này ghi nhận phân công CHÍNH THỨC (sau khi teaching_registrations được Approved)
-- Không dùng để GV tự đăng ký — đó là nhiệm vụ của teaching_registrations
CREATE TABLE teacher_assignments (
    id          VARCHAR(30) PRIMARY KEY,
    teacher_id  VARCHAR(20) REFERENCES teachers(id),
    section_id  VARCHAR(30) REFERENCES course_sections(id),
    assigned_at DATE
);

-- 17. class_enrollments (PhanLop)
CREATE TABLE class_enrollments (
    student_id  VARCHAR(20) REFERENCES students(id),
    section_id  VARCHAR(30) REFERENCES course_sections(id),
    status      TEXT CHECK (status IN ('Active', 'Completed', 'Suspended')) DEFAULT 'Active',
    enrolled_at DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (student_id, section_id)
);

-- 18. student_schedules (ThoiKhoaBieuSinhVien)
CREATE TABLE student_schedules (
    id           VARCHAR(50) PRIMARY KEY,
    student_id   VARCHAR(20) REFERENCES students(id),
    section_id   VARCHAR(30) REFERENCES course_sections(id),
    class_date   DATE NOT NULL,
    period_start VARCHAR(5) NOT NULL,
    period_end   VARCHAR(5) NOT NULL,
    room         VARCHAR(20) NOT NULL,
    session_type TEXT CHECK (session_type IN ('Theory', 'Practice')) NOT NULL
);

-- 19. teacher_schedules (ThoiKhoaBieuGiangVien)
CREATE TABLE teacher_schedules (
    id           VARCHAR(50) PRIMARY KEY,
    teacher_id   VARCHAR(20) REFERENCES teachers(id),
    section_id   VARCHAR(30) REFERENCES course_sections(id),
    class_date   DATE NOT NULL,
    period_start VARCHAR(5) NOT NULL,
    period_end   VARCHAR(5) NOT NULL,
    room         VARCHAR(20) NOT NULL,
    session_type TEXT CHECK (session_type IN ('Theory', 'Practice')) NOT NULL
);

-- 20. password_reset_tokens (PasswordResetTokens)
CREATE TABLE password_reset_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(20) REFERENCES users(id),
    token           VARCHAR(64) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SAMPLE DATA (Expanded: At least 5 records per table)
-- ============================================================

-- 1. Departments
INSERT INTO departments (id, name, description, founded_date) VALUES
('DEPT_CS', 'Computer Science',      'Department of Computer Science',      '2000-01-01'),
('DEPT_IT', 'Information Technology','Department of Information Technology', '2000-01-01'),
('DEPT_SE', 'Software Engineering',  'Department of Software Engineering',   '2005-01-01'),
('DEPT_IS', 'Information Systems',   'Department of Information Systems',    '2010-01-01'),
('DEPT_CN', 'Computer Networks',     'Department of Computer Networks',      '2012-01-01');

-- 2. Majors
INSERT INTO majors (id, name) VALUES
('CS', 'Computer Science'),
('IT', 'Information Technology'),
('SE', 'Software Engineering'),
('AI', 'Artificial Intelligence'),
('DS', 'Data Science');

-- 3. Users (Admin + Teachers + Students)
INSERT INTO users (id, username, password, role) VALUES
('ADMIN01', 'admin',          'admin123', 'Admin'),
('GV001',   'giaovu01',       '123456',   'AcademicAffairs'),
('GV002',   'truongbomon01',  '123456',   'DepartmentHead'),
('GV003',   'truongkhoa01',   '123456',   'FacultyHead'),
('GV004',   'teacher01',      '123456',   'Teacher'),
('GV005',   'teacher02',      '123456',   'Teacher'),
('GV006',   'teacher03',      '123456',   'Teacher'),
('SV001',   'student01',      '123456',   'Student'),
('SV002',   'student02',      '123456',   'Student'),
('SV003',   'student03',      '123456',   'Student'),
('SV004',   'student04',      '123456',   'Student'),
('SV005',   'student05',      '123456',   'Student');

-- 4. Teachers
INSERT INTO teachers (id, full_name, email, phone, department_id, degree, academic_rank, specialization, position) VALUES
('GV001', 'Nguyen Van A',  'giaovu01@university.edu.vn',      '0901234561', 'DEPT_CS', 'Master', NULL,                'Software Engineering', 'AcademicAffairs'),
('GV002', 'Tran Thi B',   'truongbomon01@university.edu.vn', '0901234562', 'DEPT_CS', 'PhD',    'Associate Professor','Database',             'DepartmentHead'),
('GV003', 'Le Van C',     'truongkhoa01@university.edu.vn',  '0901234563', 'DEPT_CS', 'PhD',    'Professor',          'AI',                   'FacultyHead'),
('GV004', 'Pham Thi D',   'teacher01@university.edu.vn',     '0901234564', 'DEPT_CS', 'Master', NULL,                'Web Development',      'Lecturer'),
('GV005', 'Hoang Van E',  'teacher02@university.edu.vn',     '0901234565', 'DEPT_IT', 'Master', NULL,                'Networks',             'Lecturer'),
('GV006', 'Dinh Van F',   'teacher03@university.edu.vn',     '0901234566', 'DEPT_SE', 'PhD',    NULL,                'Mobile Dev',           'Lecturer');

-- 5. Classes
INSERT INTO classes (id, name, advisor_id) VALUES
('CLASS_CS01', 'CS2021A', 'GV004'),
('CLASS_CS02', 'CS2021B', 'GV005'),
('CLASS_IT01', 'IT2021A', 'GV004'),
('CLASS_SE01', 'SE2022A', 'GV006'),
('CLASS_AI01', 'AI2023A', 'GV003');

-- 6. Students
INSERT INTO students (id, full_name, email, phone, address, birth_date, gender, enrollment_date, status, major_id, class_id) VALUES
('SV001', 'Nguyen Van Sinh Vien 1', 'sv001@student.edu.vn', '0911111111', 'Ha Noi',    '2003-01-15', 'Male',   '2021-09-01', 'Enrolled', 'CS', 'CLASS_CS01'),
('SV002', 'Tran Thi Sinh Vien 2',   'sv002@student.edu.vn', '0922222222', 'HCM',       '2003-05-20', 'Female', '2021-09-01', 'Enrolled', 'CS', 'CLASS_CS01'),
('SV003', 'Le Van Sinh Vien 3',     'sv003@student.edu.vn', '0933333333', 'Da Nang',   '2003-08-10', 'Male',   '2021-09-01', 'Enrolled', 'IT', 'CLASS_IT01'),
('SV004', 'Pham Thi Sinh Vien 4',   'sv004@student.edu.vn', '0944444444', 'Can Tho',   '2004-02-28', 'Female', '2022-09-01', 'Enrolled', 'SE', 'CLASS_SE01'),
('SV005', 'Hoang Van Sinh Vien 5',  'sv005@student.edu.vn', '0955555555', 'Hai Phong', '2005-11-11', 'Male',   '2023-09-01', 'Enrolled', 'AI', 'CLASS_AI01');

-- 7. Courses
INSERT INTO courses (id, name, credits, type, theory_periods, practice_periods) VALUES
('COURSE_CS01', 'Introduction to Programming',    3, 'Required', 30, 15),
('COURSE_CS02', 'Data Structures and Algorithms', 3, 'Required', 30, 15),
('COURSE_CS03', 'Database Systems',               3, 'Required', 30, 15),
('COURSE_CS04', 'Operating Systems',              3, 'Required', 30, 15),
('COURSE_CS05', 'Computer Networks',              3, 'Required', 30, 15),
('COURSE_IT01', 'Web Development',                3, 'Elective', 15, 30),
('COURSE_IT02', 'Mobile Development',             3, 'Elective', 15, 30);

-- 8. Course Sections
-- [FIX 5] Bổ sung start_date / end_date cho tất cả các section
INSERT INTO course_sections (id, course_id, academic_year, semester, capacity, enrolled_count, status, teacher_id, start_date, end_date) VALUES
('SEC_CS01_HK1', 'COURSE_CS01', '2024-2025', '1', 40, 5, 'Active',  'GV004', '2024-09-09', '2024-12-27'),
('SEC_CS02_HK1', 'COURSE_CS02', '2024-2025', '1', 40, 0, 'NotOpen', NULL,    '2024-09-09', '2024-12-27'),
('SEC_CS03_HK1', 'COURSE_CS03', '2024-2025', '1', 40, 0, 'NotOpen', NULL,    '2024-09-09', '2024-12-27'),
('SEC_IT01_HK1', 'COURSE_IT01', '2024-2025', '1', 35, 0, 'NotOpen', NULL,    '2024-09-09', '2024-12-27'),
('SEC_CS04_HK1', 'COURSE_CS04', '2024-2025', '1', 30, 0, 'NotOpen', NULL,    '2024-09-09', '2024-12-27'),
('SEC_CS05_HK1', 'COURSE_CS05', '2024-2025', '1', 30, 0, 'NotOpen', NULL,    '2024-09-09', '2024-12-27');

-- 9. Class Requests
-- [FIX 3] Sửa '0_Draft' → '0_Pending' trong process_status
INSERT INTO class_requests (id, course_id, student_id, submitted_at, participant_count, description, overall_status, process_status) VALUES
('REQ_001', 'COURSE_CS02', 'SV001', '2024-09-10', 35, 'Request open Data Structures', 'Approved',  '4_WaitingOpen'),
('REQ_002', 'COURSE_CS03', 'SV002', '2024-09-11', 25, 'Need Database Systems',        'Submitted', '1_AcademicReceived'),
('REQ_003', 'COURSE_IT01', 'SV003', '2024-09-12', 40, 'Web Dev for seniors',          'Approved',  '4_WaitingOpen'),
('REQ_004', 'COURSE_CS04', 'SV004', '2024-09-13', 10, 'OS class request',             'Submitted', '0_Pending'),     -- [FIX 3] '0_Draft' → '0_Pending'
('REQ_005', 'COURSE_IT02', 'SV005', '2024-09-14', 30, 'Mobile dev please',            'Submitted', '2_DeptHeadReceived');

-- 10. Request History
-- [FIX 1] Sửa old_status '0_Draft' → '0_Pending'
-- [FIX 2] Thêm cột notes vào INSERT
INSERT INTO request_history (id, request_id, changed_by, changed_at, old_status, new_status, notes) VALUES
('HIST_001', 'REQ_001', 'GV001', '2024-09-11', '0_Pending', '1_AcademicReceived',    'Received by Academic Affairs'), -- [FIX 1]
('HIST_002', 'REQ_001', 'GV002', '2024-09-12', '1_AcademicReceived',    '2_DeptHeadReceived', 'Approved by Dept Head'),
('HIST_003', 'REQ_001', 'GV003', '2024-09-13', '2_DeptHeadReceived',    '4_WaitingOpen',      'Approved by Faculty Head'),
('HIST_004', 'REQ_003', 'GV001', '2024-09-14', '0_Pending', '1_AcademicReceived',    'Received'),                    -- [FIX 1]
('HIST_005', 'REQ_005', 'GV001', '2024-09-15', '0_Pending', '1_AcademicReceived',    'Received');                    -- [FIX 1]

-- 11. Major Courses
INSERT INTO major_courses (major_id, course_id, required) VALUES
('CS', 'COURSE_CS01', TRUE),
('CS', 'COURSE_CS02', TRUE),
('CS', 'COURSE_CS03', TRUE),
('IT', 'COURSE_CS01', TRUE),
('IT', 'COURSE_IT01', FALSE);

-- 12. Student Courses
INSERT INTO student_courses (student_id, course_id, section_id, registered_at, grade) VALUES
('SV001', 'COURSE_CS01', 'SEC_CS01_HK1', '2024-09-01', NULL),
('SV002', 'COURSE_CS01', 'SEC_CS01_HK1', '2024-09-01', NULL),
('SV003', 'COURSE_CS01', 'SEC_CS01_HK1', '2024-09-01', NULL),
('SV004', 'COURSE_CS01', 'SEC_CS01_HK1', '2024-09-01', NULL),
('SV005', 'COURSE_CS01', 'SEC_CS01_HK1', '2024-09-01', NULL);

-- 13. News
INSERT INTO news (id, title, content, posted_at, posted_by, audience) VALUES
('NEWS001', 'Welcome to new semester',    'Welcome all students to the new semester 2024-2025.', '2024-09-01', 'ADMIN01', 'All'),
('NEWS002', 'Class registration open',    'Class registration for semester 1 is now open.',       '2024-09-05', 'GV001',   'Student'),
('NEWS003', 'Teacher schedule deadline',  'Please submit your teaching schedule preferences.',    '2024-09-06', 'GV002',   'Teacher'),
('NEWS004', 'Tuition fee payment',        'Deadline for tuition fee payment is Oct 1st.',         '2024-09-10', 'ADMIN01', 'Student'),
('NEWS005', 'System maintenance',         'The system will be down for maintenance on Sunday.',   '2024-09-15', 'ADMIN01', 'All');

-- 14. Teaching Registrations
-- [FIX 4] Đây là bảng GV tự đăng ký nguyện vọng; default status là 'Pending'
INSERT INTO teaching_registrations (id, teacher_id, section_id, registered_at, status) VALUES
('TREG_001', 'GV004', 'SEC_CS01_HK1', '2024-08-20', 'Approved'),
('TREG_002', 'GV005', 'SEC_CS02_HK1', '2024-08-21', 'Pending'),
('TREG_003', 'GV004', 'SEC_IT01_HK1', '2024-08-22', 'Pending'),
('TREG_004', 'GV006', 'SEC_CS03_HK1', '2024-08-23', 'Pending'),
('TREG_005', 'GV005', 'SEC_CS04_HK1', '2024-08-24', 'Rejected');

-- 15. Request Processing
INSERT INTO request_processing (id, request_id, processor_role, processed_by, processed_at, status, notes) VALUES
('RPRO_001', 'REQ_001', 'AcademicAffairs', 'GV001', '2024-09-11', 'Approved', 'Looks good'),
('RPRO_002', 'REQ_001', 'DepartmentHead',  'GV002', '2024-09-12', 'Approved', 'Approved CS02'),
('RPRO_003', 'REQ_001', 'FacultyHead',     'GV003', '2024-09-13', 'Approved', 'Final approval'),
('RPRO_004', 'REQ_003', 'AcademicAffairs', 'GV001', '2024-09-14', 'Approved', 'OK'),
('RPRO_005', 'REQ_005', 'AcademicAffairs', 'GV001', '2024-09-15', 'Approved', 'OK');

-- 16. Teacher Assignments
-- [FIX 4] Đây là phân công CHÍNH THỨC sau khi teaching_registrations được Approved
INSERT INTO teacher_assignments (id, teacher_id, section_id, assigned_at) VALUES
('TASS_001', 'GV004', 'SEC_CS01_HK1', '2024-08-25'),
('TASS_002', 'GV005', 'SEC_CS02_HK1', '2024-08-26'),
('TASS_003', 'GV004', 'SEC_IT01_HK1', '2024-08-27'),
('TASS_004', 'GV006', 'SEC_CS03_HK1', '2024-08-28'),
('TASS_005', 'GV005', 'SEC_CS04_HK1', '2024-08-29');

-- 17. Class Enrollments
INSERT INTO class_enrollments (student_id, section_id, status, enrolled_at) VALUES
('SV001', 'SEC_CS01_HK1', 'Active', '2024-09-01'),
('SV002', 'SEC_CS01_HK1', 'Active', '2024-09-01'),
('SV003', 'SEC_CS01_HK1', 'Active', '2024-09-01'),
('SV004', 'SEC_CS01_HK1', 'Active', '2024-09-01'),
('SV005', 'SEC_CS01_HK1', 'Active', '2024-09-01');

-- 18. Student Schedules
INSERT INTO student_schedules (id, student_id, section_id, class_date, period_start, period_end, room, session_type) VALUES
('SSCH_001', 'SV001', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory'),
('SSCH_002', 'SV002', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory'),
('SSCH_003', 'SV003', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory'),
('SSCH_004', 'SV004', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory'),
('SSCH_005', 'SV005', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory');

-- 19. Teacher Schedules
INSERT INTO teacher_schedules (id, teacher_id, section_id, class_date, period_start, period_end, room, session_type) VALUES
('TSCH_001', 'GV004', 'SEC_CS01_HK1', '2024-09-16', '1', '3', 'Room_101', 'Theory'),
('TSCH_002', 'GV004', 'SEC_CS01_HK1', '2024-09-23', '1', '3', 'Room_101', 'Theory'),
('TSCH_003', 'GV004', 'SEC_CS01_HK1', '2024-09-30', '1', '3', 'Room_101', 'Theory'),
('TSCH_004', 'GV005', 'SEC_CS02_HK1', '2024-09-17', '4', '6', 'Room_102', 'Practice'),
('TSCH_005', 'GV006', 'SEC_CS03_HK1', '2024-09-18', '7', '9', 'Room_103', 'Theory');