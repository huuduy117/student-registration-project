"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsIcon, Shield, Database, Bell, Palette, Globe, Download, Upload, Trash2, Save, RefreshCw, Server, Users, Activity, HardDrive, Wifi, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import SideBar from "../../components/sideBar";
import "../../assets/UserManagement.css";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Hệ thống quản lý đăng ký học phần",
    siteDescription: "Hệ thống quản lý đăng ký học phần cho trường đại học",
    adminEmail: "admin@university.edu.vn",
    timezone: "Asia/Ho_Chi_Minh",
    language: "vi",
    
    // Security Settings
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    allowPasswordReset: true,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    autoBackup: true,
    backupFrequency: "daily",
    maxFileSize: 10,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyAdminLogin: true,
    notifySystemErrors: true,
  });

  const [systemInfo, setSystemInfo] = useState({
    version: "2.1.0",
    uptime: "15 ngày 8 giờ",
    totalUsers: 1250,
    activeUsers: 89,
    totalRequests: 3420,
    systemLoad: 45,
    memoryUsage: 68,
    diskUsage: 34,
    lastBackup: "2025-01-27 14:30:00",
    databaseSize: "2.8 GB",
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      setSuccess("Cài đặt đã được lưu thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu cài đặt");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess("Sao lưu dữ liệu thành công!");
      setSystemInfo(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString("vi-VN")
      }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi sao lưu");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess("Đã xóa cache thành công!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa cache");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "Tổng quát", icon: SettingsIcon },
    { id: "security", label: "Bảo mật", icon: Shield },
    { id: "system", label: "Hệ thống", icon: Server },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "maintenance", label: "Bảo trì", icon: Database },
  ];

  const SettingCard = ({ title, description, children }) => (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{title}</h4>
        {description && (
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  );

  const SystemMetric = ({ icon: Icon, label, value, unit, color = "#667eea" }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '8px',
      border: `2px solid ${color}20`
    }}>
      <div style={{ 
        background: color + '20', 
        color: color,
        padding: '0.75rem',
        borderRadius: '8px'
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
          {value} {unit && <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{unit}</span>}
        </div>
      </div>
    </div>
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
          <h1 className="admin-title">Cài đặt hệ thống</h1>
          <p className="admin-subtitle">Quản lý cấu hình và bảo trì hệ thống</p>
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
        
        {success && (
          <motion.div
            className="alert success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success}
          </motion.div>
        )}

        <div className="tabs">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "general" && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SettingCard
                  title="Thông tin cơ bản"
                  description="Cấu hình thông tin chung của hệ thống"
                >
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tên hệ thống</label>
                      <input
                        className="modern-input"
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange("siteName", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mô tả</label>
                      <textarea
                        className="modern-input"
                        rows={3}
                        value={settings.siteDescription}
                        onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Email quản trị</label>
                        <input
                          className="modern-input"
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => handleSettingChange("adminEmail", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Múi giờ</label>
                        <select
                          className="modern-select"
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange("timezone", e.target.value)}
                        >
                          <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === "security" && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SettingCard
                  title="Bảo mật đăng nhập"
                  description="Cấu hình các chính sách bảo mật cho đăng nhập"
                >
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Thời gian hết phiên (phút)</label>
                        <input
                          className="modern-input"
                          type="number"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Số lần đăng nhập sai tối đa</label>
                        <input
                          className="modern-input"
                          type="number"
                          value={settings.maxLoginAttempts}
                          onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.requireTwoFactor}
                        onChange={(e) => handleSettingChange("requireTwoFactor", e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>Yêu cầu xác thực 2 bước</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Bắt buộc người dùng sử dụng xác thực 2 bước
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.allowPasswordReset}
                        onChange={(e) => handleSettingChange("allowPasswordReset", e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>Cho phép đặt lại mật khẩu</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Người dùng có thể đặt lại mật khẩu qua email
                        </div>
                      </div>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === "system" && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SettingCard
                  title="Thông tin hệ thống"
                  description="Trạng thái và hiệu suất hệ thống"
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <SystemMetric
                      icon={Activity}
                      label="Phiên bản"
                      value={systemInfo.version}
                    />
                    <SystemMetric
                      icon={Wifi}
                      label="Thời gian hoạt động"
                      value={systemInfo.uptime}
                    />
                    <SystemMetric
                      icon={Users}
                      label="Người dùng hoạt động"
                      value={systemInfo.activeUsers}
                      unit="/ 1250"
                      color="#10b981"
                    />
                    <SystemMetric
                      icon={HardDrive}
                      label="Sử dụng ổ đĩa"
                      value={systemInfo.diskUsage}
                      unit="%"
                      color="#f59e0b"
                    />
                  </div>
                </SettingCard>

                <SettingCard
                  title="Cấu hình hệ thống"
                  description="Các tùy chọn cấu hình hệ thống"
                >
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleSettingChange("maintenanceMode", e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertTriangle size={16} color="#f59e0b" />
                          Chế độ bảo trì
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Tạm thời ngừng hoạt động hệ thống để bảo trì
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.cacheEnabled}
                        onChange={(e) => handleSettingChange("cacheEnabled", e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>Bật cache</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Cải thiện hiệu suất bằng cách lưu cache
                        </div>
                      </div>
                      <button
                        className="modern-btn secondary"
                        onClick={handleClearCache}
                        disabled={loading}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} />
                        Xóa cache
                      </button>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === "notifications" && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SettingCard
                  title="Cài đặt thông báo"
                  description="Quản lý các loại thông báo của hệ thống"
                >
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {[
                      { key: 'emailNotifications', label: 'Thông báo email', desc: 'Gửi thông báo qua email' },
                      { key: 'smsNotifications', label: 'Thông báo SMS', desc: 'Gửi thông báo qua tin nhắn' },
                      { key: 'pushNotifications', label: 'Thông báo đẩy', desc: 'Hiển thị thông báo trên trình duyệt' },
                      { key: 'notifyAdminLogin', label: 'Thông báo đăng nhập admin', desc: 'Thông báo khi admin đăng nhập' },
                      { key: 'notifySystemErrors', label: 'Thông báo lỗi hệ thống', desc: 'Thông báo khi có lỗi xảy ra' },
                    ].map((item) => (
                      <div key={item.key} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '1rem', 
                        background: '#f8fafc', 
                        borderRadius: '8px' 
                      }}>
                        <input
                          type="checkbox"
                          checked={settings[item.key]}
                          onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.label}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SettingCard>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <SettingCard
                  title="Sao lưu dữ liệu"
                  description="Quản lý sao lưu và khôi phục dữ liệu"
                >
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingChange("autoBackup", e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>Sao lưu tự động</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          Tự động sao lưu dữ liệu theo lịch trình
                        </div>
                      </div>
                      <select
                        className="modern-select"
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange("backupFrequency", e.target.value)}
                        style={{ width: '150px' }}
                      >
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                        <option value="monthly">Hàng tháng</option>
                      </select>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Lần sao lưu cuối</div>
                        <div style={{ fontWeight: '500' }}>{systemInfo.lastBackup}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Kích thước database</div>
                        <div style={{ fontWeight: '500' }}>{systemInfo.databaseSize}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        className="modern-btn"
                        onClick={handleBackup}
                        disabled={loading}
                      >
                        <Download size={16} />
                        Sao lưu ngay
                      </button>
                      <button
                        className="modern-btn secondary"
                        disabled={loading}
                      >
                        <Upload size={16} />
                        Khôi phục
                      </button>
                    </div>
                  </div>
                </SettingCard>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          style={{ 
            position: 'sticky', 
            bottom: '2rem', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '1rem',
            marginTop: '2rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            className="modern-btn secondary"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Đặt lại
          </button>
          <button
            className="modern-btn"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminSettings;