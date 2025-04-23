import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import ChatPage from "./pages/ChatPage"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        {/* Route mặc định khi vào "/" */}
        <Route path="/" element={<Login />} /> {/* Hoặc bạn có thể điều hướng đến trang khác */}
      </Routes>
    </Router>
  )
}

export default App
