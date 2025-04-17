-- Mysql
https://dev.mysql.com/downloads/mysql/
-- MySQL Workbench

--tree

student-registration-project/
├── backend/
│   ├── config/
│   │   └── db.js            # Cấu hình kết nối MySQL
│   ├── controllers/
│   │   └── studentController.js  # Xử lý logic cho sinh viên
│   ├── models/
│   │   └── studentModel.js  # Câu lệnh SQL liên quan tới sinh viên
│   ├── routes/
│   │   └── studentRoutes.js # Khai báo API route
│   ├── app.js               # File khởi động Express
│   └── package.json         # Dependencies cho Node.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Hình ảnh, icon, CSS riêng
│   │   ├── components/      # Component React tái sử dụng
│   │   ├── pages/           # Các trang: Trang chủ, Đăng ký học phần
│   │   ├── services/        # Gọi API tới backend (axios / fetch)
│   │   ├── App.jsx          # Root component React
│   │   └── main.jsx         # File khởi động React
│   ├── public/              # File public (favicon, index.html)
│   └── package.json         # Dependencies cho React
│
├── README.md                # Mô tả đồ án
└── .gitignore               # File loại trừ khi đẩy lên Git

--backend 

mkdir backend
cd backend
npm init -y
npm install express mysql2 dotenv cors


--frontend

npm create vite@latest frontend -- --template react
cd frontend
npm install axios

--postman
https://app.getpostman.com/join-team?invite_code=e8ba87411d47dfd1b9e74ec4dbce3a43e575d894baddd919d97ae13d18b7cff2

--jwt
cd backend
npm install jsonwebtoken bcryptjs

--express 
npm install express@4.18.2

--nodemon cuc bo
npm install --save-dev nodemon

--icon 
npm install react-icons

