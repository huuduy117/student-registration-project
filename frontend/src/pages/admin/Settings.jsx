import React from "react";
import { Switch, FormControlLabel, Box } from "@mui/material";

const AdminSettings = () => {
  // Placeholder cho các tuỳ chọn cài đặt
  return (
    <Box p={2}>
      <h1>Cài đặt hệ thống</h1>
      <FormControlLabel control={<Switch />} label="Dark mode (sắp có)" />
      <FormControlLabel control={<Switch />} label="Đa ngôn ngữ (sắp có)" />
      <p>Chức năng cài đặt sẽ được mở rộng trong tương lai.</p>
    </Box>
  );
};

export default AdminSettings;
