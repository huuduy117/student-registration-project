import SideBar from "../components/sideBar";
import "../assets/Dashboard.css";
import "../assets/ApproveRequests.css";
import { useState, useEffect, useCallback } from "react";
import api from "../api/client";
import { normalizeRole, roleDisplayName } from "../utils/roleUtils";
import {
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react";

function parseListPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function mapApiRowToUi(r) {
  const courseName = r.courses?.name || r.course_sections?.courses?.name || "";
  return {
    maYeuCau: r.id,
    tenMH: courseName,
    tenSinhVien: r.students?.full_name || "",
    maSV: r.student_id,
    ngayGui: r.submitted_at,
    soLuongThamGia: r.participant_count ?? 0,
    trangThaiXuLy: r.process_status,
    tinhTrangTongQuat: r.overall_status,
    hasTeacherRegistration: !!(r.teacher_id || r.teachers?.id),
    raw: r,
  };
}

function passesRoleQueue(r, normalizedRole) {
  if (r.overall_status === "Rejected" || r.overall_status === "Cancelled") {
    return false;
  }
  if (normalizedRole === "AcademicAffairs") {
    return r.process_status === "0_Pending" && r.overall_status === "Submitted";
  }
  if (normalizedRole === "DepartmentHead") {
    return r.process_status === "1_AcademicReceived";
  }
  if (normalizedRole === "FacultyHead") {
    return r.process_status === "2_DeptHeadReceived";
  }
  return false;
}

const ApproveRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const fetchRequests = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const tabId = sessionStorage.getItem("tabId");
      const authData = JSON.parse(
        sessionStorage.getItem(`auth_${tabId}`) || "{}"
      );
      const normalizedRole =
        normalizeRole(authData.userRole) || authData.userRole;

      const res = await api.get("/api/class-requests", {
        headers: { Authorization: `Bearer ${authData.token}` },
        signal,
      });

      const rawList = parseListPayload(res.data);
      const beforeCount = rawList.length;
      const roleFiltered = rawList.filter((r) =>
        passesRoleQueue(r, normalizedRole)
      );
      const mapped = roleFiltered.map(mapApiRowToUi);

      console.log("[ApproveRequests] filter", {
        userRole: authData.userRole,
        normalizedRole,
        beforeCount,
        afterRoleFilter: roleFiltered.length,
        sampleProcessStatus: rawList[0]?.process_status,
      });

      setRequests(mapped);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchRequests(ac.signal);
    return () => ac.abort();
  }, [fetchRequests]);

  const getAuthHeaders = () => {
    const tabId = sessionStorage.getItem("tabId");
    const authData = JSON.parse(
      sessionStorage.getItem(`auth_${tabId}`) || "{}"
    );
    return {
      token: authData.token,
      userId: authData.userId,
      normalizedRole: normalizeRole(authData.userRole) || authData.userRole,
    };
  };

  const handleApprove = async (id, currentRequest) => {
    const { token, normalizedRole } = getAuthHeaders();
    if (
      normalizedRole === "DepartmentHead" &&
      !currentRequest.hasTeacherRegistration
    ) {
      alert(
        "Bạn không thể duyệt khi chưa có giảng viên đăng ký giảng dạy cho lớp này!"
      );
      return;
    }
    try {
      setIsProcessing(true);
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (normalizedRole === "AcademicAffairs") {
        await api.post(`/api/class-requests/${id}/receive`, {}, { headers });
      } else if (normalizedRole === "DepartmentHead") {
        await api.post(
          `/api/class-requests/${id}/review`,
          { decision: "approve", notes: "" },
          { headers }
        );
      } else if (normalizedRole === "FacultyHead") {
        await api.post(
          `/api/class-requests/${id}/approve`,
          { decision: "approve", notes: "" },
          { headers }
        );
      } else {
        throw new Error("Vai trò người dùng không hợp lệ cho thao tác duyệt");
      }

      setRequests((prev) => prev.filter((r) => r.maYeuCau !== id));
      alert("Đã xử lý yêu cầu thành công");
      await fetchRequests(undefined);
    } catch (error) {
      console.error("Approve error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message;
      alert(`Không thể xử lý yêu cầu: ${msg}`);
      await fetchRequests(undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectDialog = (id) => {
    setSelectedRequestId(id);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối yêu cầu");
      return;
    }

    const { token, normalizedRole } = getAuthHeaders();
    try {
      setIsProcessing(true);
      const currentRequest = requests.find(
        (r) => r.maYeuCau === selectedRequestId
      );
      if (!currentRequest) {
        throw new Error("Không tìm thấy yêu cầu");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (normalizedRole === "DepartmentHead") {
        await api.post(
          `/api/class-requests/${selectedRequestId}/review`,
          { decision: "reject", notes: rejectReason },
          { headers }
        );
      } else if (normalizedRole === "FacultyHead") {
        await api.post(
          `/api/class-requests/${selectedRequestId}/approve`,
          { decision: "reject", notes: rejectReason },
          { headers }
        );
      } else {
        alert(
          "Từ chối ở bước giáo vụ chưa được hỗ trợ qua API mới; vui lòng dùng luồng xử lý trên hệ thống quản trị."
        );
        return;
      }

      setRequests((prev) => prev.filter((r) => r.maYeuCau !== selectedRequestId));
      setShowRejectDialog(false);
      alert("Đã từ chối yêu cầu thành công");
      await fetchRequests(undefined);
    } catch (error) {
      console.error("Reject error:", error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message;
      alert(`Không thể xử lý yêu cầu: ${msg}`);
      await fetchRequests(undefined);
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (filterType === "all") return true;
    if (filterType === "hasTeacher") return request.hasTeacherRegistration;
    if (filterType === "noTeacher") return !request.hasTeacherRegistration;
    return true;
  });

  const tabId = sessionStorage.getItem("tabId");
  const authData = JSON.parse(
    sessionStorage.getItem(`auth_${tabId}`) || "{}"
  );
  const normalizedRole =
    normalizeRole(authData.userRole) || authData.userRole;

  const stats = {
    total: requests.length,
    hasTeacher: requests.filter((r) => r.hasTeacherRegistration).length,
    noTeacher: requests.filter((r) => !r.hasTeacherRegistration).length,
  };

  return (
    <div className="dashboard-container">
      <SideBar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Phê duyệt yêu cầu mở lớp</h1>
          <div className="user-info">
            <div className="user-name">{roleDisplayName(normalizedRole)}</div>
          </div>
        </div>

        {normalizedRole === "DepartmentHead" && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Tổng yêu cầu</div>
                  <div className="stat-icon">
                    <Users size={20} />
                  </div>
                </div>
                <div className="stat-value">{stats.total}</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Có giảng viên đăng ký</div>
                  <div className="stat-icon">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: "#10b981" }}>
                  {stats.hasTeacher}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Chưa có giảng viên</div>
                  <div className="stat-icon">
                    <Clock size={20} />
                  </div>
                </div>
                <div className="stat-value" style={{ color: "#f59e0b" }}>
                  {stats.noTeacher}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-title">Bộ lọc</div>
                  <div className="stat-icon">
                    <Filter size={20} />
                  </div>
                </div>
                <select
                  className="modern-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="hasTeacher">Có giảng viên đăng ký</option>
                  <option value="noTeacher">Chưa có giảng viên</option>
                </select>
              </div>
            </div>
          </>
        )}

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Danh sách yêu cầu chờ xử lý</h2>
            <button onClick={() => fetchRequests(undefined)} className="refresh-btn">
              <RefreshCw size={16} />
              Tải lại danh sách
            </button>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>Không có yêu cầu nào cần duyệt</p>
              <button onClick={() => fetchRequests(undefined)} className="refresh-btn">
                Tải lại danh sách
              </button>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Môn học</th>
                    <th>Sinh viên</th>
                    <th>Mã SV</th>
                    <th>Ngày gửi</th>
                    <th>Số lượng SV</th>
                    {normalizedRole === "DepartmentHead" && (
                      <th>Trạng thái GV</th>
                    )}
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r) => (
                    <tr
                      key={r.maYeuCau}
                      className={
                        normalizedRole === "DepartmentHead"
                          ? r.hasTeacherRegistration
                            ? "has-teacher"
                            : "no-teacher"
                          : ""
                      }
                    >
                      <td>{r.maYeuCau}</td>
                      <td>{r.tenMH}</td>
                      <td>{r.tenSinhVien}</td>
                      <td>{r.maSV}</td>
                      <td>
                        {r.ngayGui
                          ? new Date(r.ngayGui).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td>{r.soLuongThamGia}/30</td>
                      {normalizedRole === "DepartmentHead" && (
                        <td>
                          <div
                            className={`teacher-status ${
                              r.hasTeacherRegistration
                                ? "has-teacher"
                                : "no-teacher"
                            }`}
                          >
                            {r.hasTeacherRegistration ? (
                              <>
                                <CheckCircle size={16} />
                                <span>Đã có giảng viên đăng ký</span>
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                <span>Chưa có giảng viên đăng ký</span>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      <td>
                        <div className="action-buttons">
                          <button
                            className="approve-btn"
                            onClick={() => handleApprove(r.maYeuCau, r)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Đang xử lý..." : "Duyệt"}
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => openRejectDialog(r.maYeuCau)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Đang xử lý..." : "Từ chối"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showRejectDialog && (
          <div className="reject-dialog-overlay">
            <div className="reject-dialog">
              <h3>Nhập lý do từ chối</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu..."
                rows={4}
              />
              <div className="dialog-buttons">
                <button onClick={handleReject} disabled={isProcessing}>
                  {isProcessing ? "Đang xử lý..." : "Xác nhận"}
                </button>
                <button
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isProcessing}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ApproveRequestsPage;
