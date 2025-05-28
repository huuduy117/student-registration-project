"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar, Award, Clock, Activity } from 'lucide-react';
import axiosInstance from "../../services/axios";
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const AdminHome = () => {
  const [tab, setTab] = useState(0);
  const [studentStats, setStudentStats] = useState({});
  const [teacherStats, setTeacherStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentRes, teacherRes] = await Promise.all([
        axiosInstance.get("/api/admin/stats/students"),
        axiosInstance.get("/api/admin/stats/teachers"),
      ]);
      setStudentStats(studentRes.data || {});
      setTeacherStats(teacherRes.data || {});
    } catch {
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];

  const studentChartData = studentStats.byClass?.map((item, index) => ({
    name: item.class,
    students: item.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const teacherChartData = teacherStats.classCountBySemester?.map((item, index) => ({
    name: item.semester,
    classes: item.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const registrationData = studentStats.registrationStatus?.map((item, index) => ({
    name: item.status,
    value: item.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${changeType}`}>
          <TrendingUp size={16} />
          {change}% so với tháng trước
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="admin-container">
      <SideBar />
      <main className="admin-main">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="admin-title">Bảng điều khiển Admin</h1>
          <p className="admin-subtitle">Tổng quan hệ thống quản lý đăng ký học phần</p>
        </motion.div>

        {error && (
          <motion.div
            className="alert error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <div className="tabs">
          <button
            className={`tab ${tab === 0 ? "active" : ""}`}
            onClick={() => setTab(0)}
          >
            <Users size={18} />
            Thống kê sinh viên
          </button>
          <button
            className={`tab ${tab === 1 ? "active" : ""}`}
            onClick={() => setTab(1)}
          >
            <GraduationCap size={18} />
            Thống kê giảng viên
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {tab === 0 ? (
              <>
                <div className="stats-grid">
                  <StatCard
                    title="Tổng sinh viên"
                    value={studentStats.total || 0}
                    icon={Users}
                    change={12}
                    changeType="positive"
                  />
                  <StatCard
                    title="Đã đăng ký môn học"
                    value={studentStats.registrationStatus?.find(s => s.status === 'Đã đăng ký')?.count || 0}
                    icon={BookOpen}
                    change={8}
                    changeType="positive"
                  />
                  <StatCard
                    title="Yêu cầu mở lớp"
                    value={studentStats.classRequests?.length || 0}
                    icon={Calendar}
                    change={-3}
                    changeType="negative"
                  />
                  <StatCard
                    title="Hoạt động hôm nay"
                    value={45}
                    icon={Activity}
                    change={15}
                    changeType="positive"
                  />
                </div>

                <div className="chart-container">
                  <h3 className="chart-title">Phân bố sinh viên theo lớp</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="students" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3 className="chart-title">Tình trạng đăng ký</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={registrationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {registrationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <>
                <div className="stats-grid">
                  <StatCard
                    title="Tổng giảng viên"
                    value={teacherStats.total || 0}
                    icon={GraduationCap}
                    change={5}
                    changeType="positive"
                  />
                  <StatCard
                    title="Lớp học phần"
                    value={teacherStats.classCountBySemester?.reduce((sum, item) => sum + item.count, 0) || 0}
                    icon={BookOpen}
                    change={10}
                    changeType="positive"
                  />
                  <StatCard
                    title="Đã phê duyệt"
                    value={teacherStats.approveHistory?.length || 0}
                    icon={Award}
                    change={7}
                    changeType="positive"
                  />
                  <StatCard
                    title="Lịch dạy hôm nay"
                    value={teacherStats.schedule?.length || 0}
                    icon={Clock}
                    change={0}
                    changeType="positive"
                  />
                </div>

                <div className="chart-container">
                  <h3 className="chart-title">Số lớp học phần theo học kỳ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={teacherChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="classes"
                        stroke="#667eea"
                        fill="url(#colorGradient)"
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="modern-table">
                  <h3 className="chart-title" style={{ padding: '1.5rem 1.5rem 0' }}>Lịch giảng dạy gần đây</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Giảng viên</th>
                        <th>Thời gian</th>
                        <th>Môn học</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStats.schedule?.slice(0, 5).map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.teacher}</td>
                          <td>{item.time}</td>
                          <td>{item.subject}</td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminHome;