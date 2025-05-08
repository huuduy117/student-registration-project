const UnauthorizedPage = () => {
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        marginTop: "50px",
      }}
    >
      <h1>Không có quyền truy cập</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <a
        href="/login"
        style={{
          color: "#9854cb",
          textDecoration: "none",
        }}
      >
        Quay về trang đăng nhập
      </a>
    </div>
  );
};

export default UnauthorizedPage;
