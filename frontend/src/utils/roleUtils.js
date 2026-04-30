export const ROLE_ALIASES = {
  SinhVien: "Student",
  GiangVien: "Teacher",
  GiaoVu: "AcademicAffairs",
  TruongBoMon: "DepartmentHead",
  TruongKhoa: "FacultyHead",
  QuanTriVien: "Admin",
};

export const normalizeRole = (role) => ROLE_ALIASES[role] || role || null;

export const roleDisplayName = (role) => {
  const normalized = normalizeRole(role);
  const displayMap = {
    Student: "Sinh viên",
    Teacher: "Giảng viên",
    AcademicAffairs: "Giáo vụ",
    DepartmentHead: "Trưởng bộ môn",
    FacultyHead: "Trưởng khoa",
    Admin: "Quản trị viên",
  };
  return displayMap[normalized] || "Người dùng";
};
