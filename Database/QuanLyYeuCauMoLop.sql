CREATE DATABASE DKHP;
USE DKHP;

-- 1. Bảng NguoiDung
CREATE TABLE NguoiDung (
    maNguoiDung VARCHAR(20) PRIMARY KEY,
    tenDangNhap VARCHAR(50) NOT NULL,
    matKhau VARCHAR(50) NOT NULL,
    loaiNguoiDung ENUM('SinhVien', 'GiangVien', 'GiaoVu', 'TruongBoMon', 'QuanTriVien', 'TruongKhoa') NOT NULL
);

-- 2. Bảng ChuyenNganh
CREATE TABLE ChuyenNganh (
    maCN VARCHAR(20) PRIMARY KEY,
    tenCN VARCHAR(100)
);

-- 3. Bảng BoMon
CREATE TABLE BoMon (
    maBM VARCHAR(20) PRIMARY KEY,
    tenBM VARCHAR(100),
    moTa TEXT,
    ngayThanhLap DATE
);

-- 4. Bảng GiangVien
CREATE TABLE GiangVien (
    maGV VARCHAR(20) PRIMARY KEY,
    hoTen VARCHAR(100),
    email VARCHAR(100),
    soDienThoai VARCHAR(20),
    maBM VARCHAR(20),
    hocVi VARCHAR(50),
    hocHam VARCHAR(50),
    chuyenNganh VARCHAR(100),
    chucVu VARCHAR(50),
    FOREIGN KEY (maGV) REFERENCES NguoiDung(maNguoiDung),
    FOREIGN KEY (maBM) REFERENCES BoMon(maBM)
);

-- 5. Bảng Lop
CREATE TABLE Lop (
    maLop VARCHAR(20) PRIMARY KEY,
    tenLop VARCHAR(100),
    maCVHT VARCHAR(20),
    FOREIGN KEY (maCVHT) REFERENCES GiangVien(maGV)
);

-- 6. Bảng MonHoc
CREATE TABLE MonHoc (
    maMH VARCHAR(20) PRIMARY KEY,
    tenMH VARCHAR(100),
    soTinChi INT,
    moTa TEXT,
    loaiMon ENUM('BatBuoc', 'TuChon'),
    hocPhanTienQuyet TEXT,
    soTietLyThuyet INT,
    soTietThucHanh INT
);

-- 7. Bảng LopHocPhan
CREATE TABLE LopHocPhan (
    maLopHP VARCHAR(20) PRIMARY KEY,
    maMH VARCHAR(20),
    namHoc CHAR(9),
    hocKy VARCHAR(10),
    siSoToiDa INT,
    siSoHienTai INT,
    trangThai ENUM('ChuaMo', 'DangHoc', 'DaKetThuc') DEFAULT 'ChuaMo',
    ngayBatDau DATE,
    ngayKetThuc DATE,
    maGV VARCHAR(20),
    FOREIGN KEY (maMH) REFERENCES MonHoc(maMH),
    FOREIGN KEY (maGV) REFERENCES GiangVien(maGV)
);

-- 8. Bảng SinhVien
CREATE TABLE SinhVien (
    maSV VARCHAR(20) PRIMARY KEY,
    hoTen VARCHAR(100),
    email VARCHAR(100),
    soDienThoai VARCHAR(20),
    diaChi VARCHAR(255),
    ngaySinh DATE,
    gioiTinh ENUM('Nam', 'Nu', 'Khac'),
    thoiGianNhapHoc DATE,
    trangThai ENUM('Dang hoc','Da tot nghiep','Nghi hoc','Bao luu'),
    maCN VARCHAR(20),
    maLop VARCHAR(20),
    FOREIGN KEY (maSV) REFERENCES NguoiDung(maNguoiDung),
    FOREIGN KEY (maCN) REFERENCES ChuyenNganh(maCN),
    FOREIGN KEY (maLop) REFERENCES Lop(maLop)
);

-- 9. Bảng YeuCauMoLop
CREATE TABLE YeuCauMoLop (
    maYeuCau VARCHAR(20) PRIMARY KEY,
    ngayGui DATE,
    tinhTrangTongQuat ENUM('DaGui', 'DaDuyet', 'TuChoi', 'Huy'),
    trangThaiXuLy ENUM('0_ChuaGui','1_GiaoVuNhan','2_TBMNhan','3_TruongKhoaNhan','4_ChoMoLop') DEFAULT '0_ChuaGui',
    maSV VARCHAR(20),
    maLopHP VARCHAR(20), 
    maMH VARCHAR(20),
    soLuongThamGia INT,
    description TEXT,
    FOREIGN KEY (maSV) REFERENCES SinhVien(maSV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP),
    FOREIGN KEY (maMH) REFERENCES MonHoc(maMH)
);

-- 10. Bảng LichSuThayDoiYeuCau
CREATE TABLE LichSuThayDoiYeuCau (
    maLichSu VARCHAR(20) PRIMARY KEY,
    maYeuCau VARCHAR(20),
    cotTrangThaiCu ENUM('0_ChuaGui', '1_GiaoVuNhan', '2_TBMNhan', '3_TruongKhoaNhan', '4_ChoMoLop'),
  cotTrangThaiMoi ENUM('0_ChuaGui', '1_GiaoVuNhan', '2_TBMNhan', '3_TruongKhoaNhan', '4_ChoMoLop'),
    ngayThayDoi DATE,
    nguoiThayDoi VARCHAR(20),
    FOREIGN KEY (maYeuCau) REFERENCES YeuCauMoLop(maYeuCau),
    FOREIGN KEY (nguoiThayDoi) REFERENCES NguoiDung(maNguoiDung)
);

-- 11. Bảng ChuyenNganh_MonHoc
CREATE TABLE ChuyenNganh_MonHoc (
    maCN VARCHAR(20), 
    maMH VARCHAR(20),
    BatBuoc BIT NOT NULL,
    PRIMARY KEY (maCN, maMH),
    FOREIGN KEY (maCN) REFERENCES ChuyenNganh(maCN),
    FOREIGN KEY (maMH) REFERENCES MonHoc(maMH)
);

-- 12. Bảng HocKyChuyenNganh_MonHoc
CREATE TABLE HocKyChuyenNganh_MonHoc (
    maCN VARCHAR(20),
    maMH VARCHAR(20),
    hocKy INT,
    PRIMARY KEY (maCN, maMH),
    FOREIGN KEY (maCN) REFERENCES ChuyenNganh(maCN),
    FOREIGN KEY (maMH) REFERENCES MonHoc(maMH)
);

-- 13. Bảng SinhVien_MonHoc
CREATE TABLE SinhVien_MonHoc (
    maSV VARCHAR(20),
    maMH VARCHAR(20),
    maLopHP VARCHAR(20),
    ngayDangKy DATE,
    PRIMARY KEY (maSV, maMH, maLopHP),
    FOREIGN KEY (maSV) REFERENCES SinhVien(maSV),
    FOREIGN KEY (maMH) REFERENCES MonHoc(maMH),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 14. Bảng ThoiKhoaBieu
CREATE TABLE ThoiKhoaBieu (
    maTKB VARCHAR(20) PRIMARY KEY,
    ngayHoc DATE,
    tietBD VARCHAR(10),
    tietKT VARCHAR(10),
    maLopHP VARCHAR(20),
    phongHoc VARCHAR(50),
    maSV VARCHAR(20),
    maGV VARCHAR(20),
    FOREIGN KEY (maSV) REFERENCES SinhVien(maSV),
    FOREIGN KEY (maGV) REFERENCES GiangVien(maGV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);
ALTER TABLE ThoiKhoaBieu MODIFY maTKB VARCHAR(50);


-- 15. Bảng BangTin
CREATE TABLE BangTin (
    maThongBao VARCHAR(20) PRIMARY KEY,
    tieuDe VARCHAR(255),
    noiDung TEXT,
    ngayDang DATE,
    nguoiDang VARCHAR(20),
    loaiNguoiDung ENUM('SinhVien', 'GiangVien', 'TatCa'),
    FOREIGN KEY (nguoiDang) REFERENCES NguoiDung(maNguoiDung)
);

-- 16. Bảng DangKyLichDay
CREATE TABLE DangKyLichDay (
    maDangKy VARCHAR(20) PRIMARY KEY,
    maGV VARCHAR(20),
    maLopHP VARCHAR(20),
    ngayDangKy DATE,
    trangThai ENUM('ChoDuyet', 'ChapNhan', 'TuChoi'),
    FOREIGN KEY (maGV) REFERENCES GiangVien(maGV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 17. Bảng XuLyYeuCau
CREATE TABLE XuLyYeuCau (
    maXuLy VARCHAR(20) PRIMARY KEY,
    maYeuCau VARCHAR(20),
    vaiTroNguoiXuLy ENUM('GiaoVu', 'TruongBoMon', 'TruongKhoa'),
    nguoiXuLy VARCHAR(20),
    ngayXuLy DATE,
    trangThai ENUM('ChuyenTiep', 'DongY', 'TuChoi'),
    ghiChu TEXT,
    FOREIGN KEY (maYeuCau) REFERENCES YeuCauMoLop(maYeuCau),
    FOREIGN KEY (nguoiXuLy) REFERENCES NguoiDung(maNguoiDung)
);

-- 18. Bảng PhanCongGiangVien
CREATE TABLE PhanCongGiangVien (
    maPhanCong VARCHAR(20) PRIMARY KEY,
    maGV VARCHAR(20),
    maLopHP VARCHAR(20),
    ngayPhanCong DATE,
    FOREIGN KEY (maGV) REFERENCES GiangVien(maGV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 19. Bảng PhanLop
CREATE TABLE PhanLop (
    maSV VARCHAR(20),
    maLopHP VARCHAR(20),
    trangThai ENUM('DangHoc', 'DaKetThuc', 'TamNgung') DEFAULT 'DangHoc',
    ngayDangKy DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (maSV, maLopHP),
    FOREIGN KEY (maSV) REFERENCES SinhVien(maSV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 20. Bảng MauThoiKhoaBieu
CREATE TABLE MauThoiKhoaBieu (
    maLopHP VARCHAR(20) NOT NULL,
    thuTrongTuan TINYINT NOT NULL,
    tietBD VARCHAR(5) NOT NULL,
    tietKT VARCHAR(5) NOT NULL,         
    phongHoc VARCHAR(10) NOT NULL,
    loaiBuoi ENUM('LyThuyet', 'ThucHanh') DEFAULT 'LyThuyet',
    PRIMARY KEY (maLopHP, thuTrongTuan, tietBD),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);


-- 21. Bảng LichHoc (Bảng trung gian quản lý lịch học chi tiết)
CREATE TABLE LichHoc (
    maLichHoc VARCHAR(20) PRIMARY KEY,
    maLopHP VARCHAR(20),
    thuTrongTuan TINYINT NOT NULL,
    tietBD VARCHAR(5) NOT NULL,
    tietKT VARCHAR(5) NOT NULL,
    phongHoc VARCHAR(10) NOT NULL,
    loaiBuoi ENUM('LyThuyet', 'ThucHanh') NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE NOT NULL,
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 22. Bảng ThoiKhoaBieuLopHocPhan
CREATE TABLE ThoiKhoaBieuLopHocPhan (
    maTKB VARCHAR(50) PRIMARY KEY,
    maLopHP VARCHAR(20),
    ngayHoc DATE NOT NULL,
    tietBD VARCHAR(5) NOT NULL,
    tietKT VARCHAR(5) NOT NULL,
    phongHoc VARCHAR(10) NOT NULL,
    loaiBuoi ENUM('LyThuyet', 'ThucHanh') NOT NULL,
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 23. Bảng ThoiKhoaBieuSinhVien
CREATE TABLE ThoiKhoaBieuSinhVien (
    maTKB VARCHAR(50) PRIMARY KEY,
    maSV VARCHAR(20),
    maLopHP VARCHAR(20),
    ngayHoc DATE NOT NULL,
    tietBD VARCHAR(5) NOT NULL,
    tietKT VARCHAR(5) NOT NULL,
    phongHoc VARCHAR(10) NOT NULL,
    loaiBuoi ENUM('LyThuyet', 'ThucHanh') NOT NULL,
    FOREIGN KEY (maSV) REFERENCES SinhVien(maSV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);

-- 24. Bảng ThoiKhoaBieuGiangVien
CREATE TABLE ThoiKhoaBieuGiangVien (
    maTKB VARCHAR(50) PRIMARY KEY,
    maGV VARCHAR(20),
    maLopHP VARCHAR(20),
    ngayHoc DATE NOT NULL,
    tietBD VARCHAR(5) NOT NULL,
    tietKT VARCHAR(5) NOT NULL,
    phongHoc VARCHAR(10) NOT NULL,
    loaiBuoi ENUM('LyThuyet', 'ThucHanh') NOT NULL,
    FOREIGN KEY (maGV) REFERENCES GiangVien(maGV),
    FOREIGN KEY (maLopHP) REFERENCES LopHocPhan(maLopHP)
);


CREATE PROCEDURE sp_xem_tkb_sinh_vien(IN p_maSV VARCHAR(20))
BEGIN
    SELECT 
        mh.tenMH AS 'Tên môn học',
        tkb.maLopHP AS 'Mã học phần',
        CONCAT(tkb.tietBD, ' - ', tkb.tietKT) AS 'Tiết học',
        tkb.phongHoc AS 'Phòng học',
        DATE_FORMAT(tkb.ngayHoc, '%d/%m/%Y') AS 'Ngày học',
        gv.hoTen AS 'Giảng viên'
    FROM ThoiKhoaBieuSinhVien tkb
    JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    JOIN GiangVien gv ON lhp.maGV = gv.maGV
    WHERE tkb.maSV = p_maSV
    ORDER BY tkb.ngayHoc, tkb.tietBD;
END //

DELIMITER ;


-- proc update trang thai phieu mo lop
DELIMITER $$

CREATE TRIGGER trg_auto_update_trangThai_before_insert
BEFORE INSERT ON YeuCauMoLop
FOR EACH ROW
BEGIN
    IF NEW.soLuongThamGia >= 30
       AND NEW.trangThaiXuLy = '0_ChuaGui' THEN
        SET NEW.trangThaiXuLy = '1_GiaoVuNhan';
        SET NEW.tinhTrangTongQuat = 'DaGui';
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_auto_update_trangThai_before_update
BEFORE UPDATE ON YeuCauMoLop
FOR EACH ROW
BEGIN
    IF NEW.soLuongThamGia >= 30
       AND NEW.trangThaiXuLy = '0_ChuaGui' THEN
        SET NEW.trangThaiXuLy = '1_GiaoVuNhan';
        SET NEW.tinhTrangTongQuat = 'DaGui';
    END IF;
END$$

DELIMITER ;

-- Procedure tạo lịch học từ mẫu thời khóa biểu
DELIMITER //
CREATE PROCEDURE sp_tao_lich_hoc(
    IN p_maLopHP VARCHAR(20),
    IN p_ngayBatDau DATE,
    IN p_ngayKetThuc DATE
)
BEGIN
    DECLARE v_thuTrongTuan TINYINT;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE v_phongHoc VARCHAR(10);
    DECLARE v_loaiBuoi ENUM('LyThuyet', 'ThucHanh');
    DECLARE v_maLichHoc VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy thông tin từ mẫu thời khóa biểu
    DECLARE cur CURSOR FOR 
        SELECT thuTrongTuan, tietBD, tietKT, phongHoc, loaiBuoi 
        FROM MauThoiKhoaBieu 
        WHERE maLopHP = p_maLopHP;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa lịch học cũ nếu có
    DELETE FROM LichHoc WHERE maLopHP = p_maLopHP;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_thuTrongTuan, v_tietBD, v_tietKT, v_phongHoc, v_loaiBuoi;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Tạo mã lịch học ngắn gọn hơn
        SET v_maLichHoc = CONCAT('LH', SUBSTRING(p_maLopHP, 4), v_thuTrongTuan, 
                                SUBSTRING(REPLACE(v_tietBD, ':', ''), 1, 2));
        
        -- Thêm lịch học mới
        INSERT INTO LichHoc (
            maLichHoc, maLopHP, thuTrongTuan, tietBD, tietKT, 
            phongHoc, loaiBuoi, ngayBatDau, ngayKetThuc
        ) VALUES (
            v_maLichHoc, p_maLopHP, v_thuTrongTuan, v_tietBD, v_tietKT,
            v_phongHoc, v_loaiBuoi, p_ngayBatDau, p_ngayKetThuc
        );
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Procedure tạo thời khóa biểu cho lớp học phần
DELIMITER //
CREATE PROCEDURE sp_tao_tkb_lop_hoc_phan(
    IN p_maLopHP VARCHAR(20),
    IN p_ngayBatDau DATE,
    IN p_ngayKetThuc DATE
)
BEGIN
    DECLARE v_ngayHoc DATE;
    DECLARE v_thuTrongTuan TINYINT;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE v_phongHoc VARCHAR(10);
    DECLARE v_loaiBuoi ENUM('LyThuyet', 'ThucHanh');
    DECLARE v_maTKB VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy thông tin từ lịch học
    DECLARE cur CURSOR FOR 
        SELECT thuTrongTuan, tietBD, tietKT, phongHoc, loaiBuoi 
        FROM LichHoc 
        WHERE maLopHP = p_maLopHP;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa thời khóa biểu cũ nếu có
    DELETE FROM ThoiKhoaBieuLopHocPhan WHERE maLopHP = p_maLopHP;
    
    -- Tạo thời khóa biểu cho từng ngày trong khoảng thời gian
    SET v_ngayHoc = p_ngayBatDau;
    
    WHILE v_ngayHoc <= p_ngayKetThuc DO
        OPEN cur;
        
        read_loop: LOOP
            FETCH cur INTO v_thuTrongTuan, v_tietBD, v_tietKT, v_phongHoc, v_loaiBuoi;
            
            IF done THEN
                LEAVE read_loop;
            END IF;
            
            -- Kiểm tra nếu ngày học trùng với thứ trong tuần
            IF DAYOFWEEK(v_ngayHoc) = v_thuTrongTuan THEN
                -- Tạo mã thời khóa biểu
                SET v_maTKB = CONCAT(p_maLopHP, '_', DATE_FORMAT(v_ngayHoc, '%Y%m%d'), '_',
                                   v_thuTrongTuan, '_', REPLACE(v_tietBD, ':', ''));
                
                -- Thêm thời khóa biểu mới
                INSERT INTO ThoiKhoaBieuLopHocPhan (
                    maTKB, maLopHP, ngayHoc, tietBD, tietKT, 
                    phongHoc, loaiBuoi
                ) VALUES (
                    v_maTKB, p_maLopHP, v_ngayHoc, v_tietBD, v_tietKT,
                    v_phongHoc, v_loaiBuoi
                );
            END IF;
        END LOOP;
        
        CLOSE cur;
        SET done = FALSE;
        SET v_ngayHoc = DATE_ADD(v_ngayHoc, INTERVAL 1 DAY);
    END WHILE;
END //
DELIMITER ;

-- Procedure tạo thời khóa biểu cho sinh viên
DELIMITER //
CREATE PROCEDURE sp_tao_tkb_sinh_vien(
    IN p_maSV VARCHAR(20)
)
BEGIN
    DECLARE v_maLopHP VARCHAR(20);
    DECLARE v_ngayHoc DATE;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE v_phongHoc VARCHAR(10);
    DECLARE v_loaiBuoi ENUM('LyThuyet', 'ThucHanh');
    DECLARE v_maTKB VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy thông tin từ thời khóa biểu lớp học phần
    DECLARE cur CURSOR FOR 
        SELECT t.maLopHP, t.ngayHoc, t.tietBD, t.tietKT, t.phongHoc, t.loaiBuoi
        FROM ThoiKhoaBieuLopHocPhan t
        JOIN PhanLop p ON t.maLopHP = p.maLopHP
        WHERE p.maSV = p_maSV AND p.trangThai = 'DangHoc';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa thời khóa biểu cũ nếu có
    DELETE FROM ThoiKhoaBieuSinhVien WHERE maSV = p_maSV;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT, v_phongHoc, v_loaiBuoi;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Tạo mã thời khóa biểu
        SET v_maTKB = CONCAT(p_maSV, '_', v_maLopHP, '_', DATE_FORMAT(v_ngayHoc, '%Y%m%d'), '_',
                           REPLACE(v_tietBD, ':', ''));
        
        -- Thêm thời khóa biểu mới
        INSERT INTO ThoiKhoaBieuSinhVien (
            maTKB, maSV, maLopHP, ngayHoc, tietBD, tietKT, 
            phongHoc, loaiBuoi
        ) VALUES (
            v_maTKB, p_maSV, v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT,
            v_phongHoc, v_loaiBuoi
        );
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Procedure tạo thời khóa biểu cho giảng viên
DELIMITER //
CREATE PROCEDURE sp_tao_tkb_giang_vien(
    IN p_maGV VARCHAR(20)
)
BEGIN
    DECLARE v_maLopHP VARCHAR(20);
    DECLARE v_ngayHoc DATE;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE v_phongHoc VARCHAR(10);
    DECLARE v_loaiBuoi ENUM('LyThuyet', 'ThucHanh');
    DECLARE v_maTKB VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy thông tin từ thời khóa biểu lớp học phần
    DECLARE cur CURSOR FOR 
        SELECT t.maLopHP, t.ngayHoc, t.tietBD, t.tietKT, t.phongHoc, t.loaiBuoi
        FROM ThoiKhoaBieuLopHocPhan t
        JOIN PhanCongGiangVien p ON t.maLopHP = p.maLopHP
        WHERE p.maGV = p_maGV;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa thời khóa biểu cũ nếu có
    DELETE FROM ThoiKhoaBieuGiangVien WHERE maGV = p_maGV;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT, v_phongHoc, v_loaiBuoi;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Tạo mã thời khóa biểu
        SET v_maTKB = CONCAT(p_maGV, '_', v_maLopHP, '_', DATE_FORMAT(v_ngayHoc, '%Y%m%d'), '_',
                           REPLACE(v_tietBD, ':', ''));
        
        -- Thêm thời khóa biểu mới
        INSERT INTO ThoiKhoaBieuGiangVien (
            maTKB, maGV, maLopHP, ngayHoc, tietBD, tietKT, 
            phongHoc, loaiBuoi
        ) VALUES (
            v_maTKB, p_maGV, v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT,
            v_phongHoc, v_loaiBuoi
        );
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Procedure kiểm tra xung đột lịch học
DELIMITER //
CREATE PROCEDURE sp_kiem_tra_xung_dot_lich(
    IN p_maLopHP VARCHAR(20),
    IN p_ngayHoc DATE,
    IN p_tietBD VARCHAR(5),
    IN p_tietKT VARCHAR(5),
    OUT p_coXungDot BOOLEAN
)
BEGIN
    DECLARE v_count INT;
    
    -- Kiểm tra xung đột với giảng viên
    SELECT COUNT(*) INTO v_count
    FROM ThoiKhoaBieuGiangVien t
    JOIN PhanCongGiangVien p ON t.maLopHP = p.maLopHP
    WHERE p.maGV IN (
        SELECT maGV FROM PhanCongGiangVien WHERE maLopHP = p_maLopHP
    )
    AND t.ngayHoc = p_ngayHoc
    AND (
        (CAST(t.tietBD AS UNSIGNED) BETWEEN CAST(p_tietBD AS UNSIGNED) AND CAST(p_tietKT AS UNSIGNED))
        OR
        (CAST(t.tietKT AS UNSIGNED) BETWEEN CAST(p_tietBD AS UNSIGNED) AND CAST(p_tietKT AS UNSIGNED))
    );
    
    IF v_count > 0 THEN
        SET p_coXungDot = TRUE;
    ELSE
        -- Kiểm tra xung đột với sinh viên
        SELECT COUNT(*) INTO v_count
        FROM ThoiKhoaBieuSinhVien t
        JOIN PhanLop p ON t.maLopHP = p.maLopHP
        WHERE p.maSV IN (
            SELECT maSV FROM PhanLop WHERE maLopHP = p_maLopHP
        )
        AND t.ngayHoc = p_ngayHoc
        AND (
            (CAST(t.tietBD AS UNSIGNED) BETWEEN CAST(p_tietBD AS UNSIGNED) AND CAST(p_tietKT AS UNSIGNED))
            OR
            (CAST(t.tietKT AS UNSIGNED) BETWEEN CAST(p_tietBD AS UNSIGNED) AND CAST(p_tietKT AS UNSIGNED))
        );
        
        SET p_coXungDot = (v_count > 0);
    END IF;
END //
DELIMITER ;



INSERT INTO NguoiDung VALUES('2001215601','2001215601','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215682','2001215682','123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215602','2001215602','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215603','2001215603','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215604','2001215604','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215605','2001215605','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215606','2001215606','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215607','2001215607','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215608','2001215608','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215609','2001215609','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215610','2001215610','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215611','2001215611','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215612','2001215612','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215613','2001215613','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215614','2001215614','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215615','2001215615','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215616','2001215616','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215617','2001215617','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215618','2001215618','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215619','2001215619','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215620','2001215620','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215621','2001215621','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215622','2001215622','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215623','2001215623','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215624','2001215624','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215625','2001215625','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215626','2001215626','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215627','2001215627','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215628','2001215628','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215629','2001215629','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('2001215630','2001215630','pwd123','SinhVien');
INSERT INTO NguoiDung VALUES('GV01','anhnt','pwdGV','TruongKhoa');
INSERT INTO NguoiDung VALUES('GV02','binhtv','pwdGV','TruongBoMon');
INSERT INTO NguoiDung VALUES('GV03','chaulm','pwdGV','GiangVien');
INSERT INTO NguoiDung VALUES('GV04','dungpt','pwdGV','GiangVien');
INSERT INTO NguoiDung VALUES('GV05','daihq','pwdGV','GiangVien');
INSERT INTO NguoiDung VALUES('GV06','hongvt','pwdGV','GiaoVu');
INSERT INTO NguoiDung VALUES('AD01','admin1','adminpass','QuanTriVien');

-- thêm 30 user giảng viên:
INSERT INTO NguoiDung VALUES ('GV07', 'gv07', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV08', 'gv08', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV09', 'gv09', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV10', 'gv10', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV11', 'gv11', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV12', 'gv12', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV13', 'gv13', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV14', 'gv14', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV15', 'gv15', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV16', 'gv16', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV17', 'gv17', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV18', 'gv18', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV19', 'gv19', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV20', 'gv20', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV21', 'gv21', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV22', 'gv22', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV23', 'gv23', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV24', 'gv24', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV25', 'gv25', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV26', 'gv26', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV27', 'gv27', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV28', 'gv28', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV29', 'gv29', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV30', 'gv30', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV31', 'gv31', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV32', 'gv32', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV33', 'gv33', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV34', 'gv34', 'pwdGV', 'GiangVien');
INSERT INTO NguoiDung VALUES ('GV35', 'gv35', 'pwdGV', 'GiangVien');



-- thêm 70 người dùng (sinh viên)
INSERT INTO NguoiDung (maNguoiDung, tenDangNhap, matKhau, loaiNguoiDung) VALUES
('2001215631', '2001215631', 'pwd123', 'SinhVien'),
('2001215632', '2001215632', 'pwd123', 'SinhVien'),
('2001215633', '2001215633', 'pwd123', 'SinhVien'),
('2001215634', '2001215634', 'pwd123', 'SinhVien'),
('2001215635', '2001215635', 'pwd123', 'SinhVien'),
('2001215636', '2001215636', 'pwd123', 'SinhVien'),
('2001215637', '2001215637', 'pwd123', 'SinhVien'),
('2001215638', '2001215638', 'pwd123', 'SinhVien'),
('2001215639', '2001215639', 'pwd123', 'SinhVien'),
('2001215640', '2001215640', 'pwd123', 'SinhVien'),
('2001215641', '2001215641', 'pwd123', 'SinhVien'),
('2001215642', '2001215642', 'pwd123', 'SinhVien'),
('2001215643', '2001215643', 'pwd123', 'SinhVien'),
('2001215644', '2001215644', 'pwd123', 'SinhVien'),
('2001215645', '2001215645', 'pwd123', 'SinhVien'),
('2001215646', '2001215646', 'pwd123', 'SinhVien'),
('2001215647', '2001215647', 'pwd123', 'SinhVien'),
('2001215648', '2001215648', 'pwd123', 'SinhVien'),
('2001215649', '2001215649', 'pwd123', 'SinhVien'),
('2001215650', '2001215650', 'pwd123', 'SinhVien'),
('2001215651', '2001215651', 'pwd123', 'SinhVien'),
('2001215652', '2001215652', 'pwd123', 'SinhVien'),
('2001215653', '2001215653', 'pwd123', 'SinhVien'),
('2001215654', '2001215654', 'pwd123', 'SinhVien'),
('2001215655', '2001215655', 'pwd123', 'SinhVien'),
('2001215656', '2001215656', 'pwd123', 'SinhVien'),
('2001215657', '2001215657', 'pwd123', 'SinhVien'),
('2001215658', '2001215658', 'pwd123', 'SinhVien'),
('2001215659', '2001215659', 'pwd123', 'SinhVien'),
('2001215660', '2001215660', 'pwd123', 'SinhVien'),
('2001215661', '2001215661', 'pwd123', 'SinhVien'),
('2001215662', '2001215662', 'pwd123', 'SinhVien'),
('2001215663', '2001215663', 'pwd123', 'SinhVien'),
('2001215664', '2001215664', 'pwd123', 'SinhVien'),
('2001215665', '2001215665', 'pwd123', 'SinhVien'),
('2001215666', '2001215666', 'pwd123', 'SinhVien'),
('2001215667', '2001215667', 'pwd123', 'SinhVien'),
('2001215668', '2001215668', 'pwd123', 'SinhVien'),
('2001215669', '2001215669', 'pwd123', 'SinhVien'),
('2001215670', '2001215670', 'pwd123', 'SinhVien'),
('2001215671', '2001215671', 'pwd123', 'SinhVien'),
('2001215672', '2001215672', 'pwd123', 'SinhVien'),
('2001215673', '2001215673', 'pwd123', 'SinhVien'),
('2001215674', '2001215674', 'pwd123', 'SinhVien'),
('2001215675', '2001215675', 'pwd123', 'SinhVien'),
('2001215676', '2001215676', 'pwd123', 'SinhVien'),
('2001215677', '2001215677', 'pwd123', 'SinhVien'),
('2001215678', '2001215678', 'pwd123', 'SinhVien'),
('2001215679', '2001215679', 'pwd123', 'SinhVien'),
('2001215680', '2001215680', 'pwd123', 'SinhVien'),
('2001215681', '2001215681', 'pwd123', 'SinhVien'),
('2001215683', '2001215683', 'pwd123', 'SinhVien'),
('2001215684', '2001215684', 'pwd123', 'SinhVien'),
('2001215685', '2001215685', 'pwd123', 'SinhVien'),
('2001215686', '2001215686', 'pwd123', 'SinhVien'),
('2001215687', '2001215687', 'pwd123', 'SinhVien'),
('2001215688', '2001215688', 'pwd123', 'SinhVien'),
('2001215689', '2001215689', 'pwd123', 'SinhVien'),
('2001215690', '2001215690', 'pwd123', 'SinhVien'),
('2001215691', '2001215691', 'pwd123', 'SinhVien'),
('2001215692', '2001215692', 'pwd123', 'SinhVien'),
('2001215693', '2001215693', 'pwd123', 'SinhVien'),
('2001215694', '2001215694', 'pwd123', 'SinhVien'),
('2001215695', '2001215695', 'pwd123', 'SinhVien'),
('2001215696', '2001215696', 'pwd123', 'SinhVien'),
('2001215697', '2001215697', 'pwd123', 'SinhVien'),
('2001215698', '2001215698', 'pwd123', 'SinhVien'),
('2001215699', '2001215699', 'pwd123', 'SinhVien'),
('2001215700', '2001215700', 'pwd123', 'SinhVien'),
('2001215701', '2001215700', 'pwd123', 'SinhVien');

INSERT INTO ChuyenNganh VALUES('CNPM', 'Công nghệ phần mềm');
INSERT INTO ChuyenNganh VALUES('HTTT', 'Hệ thống thông tin');
INSERT INTO ChuyenNganh VALUES('KHDL', 'Khoa học dữ liệu');
INSERT INTO ChuyenNganh VALUES('MMT', 'Mạng máy tính');


INSERT INTO BoMon (maBM, tenBM, moTa, ngayThanhLap) VALUES
('BM_CNPM', 'Bộ môn Công nghệ phần mềm', 'Phụ trách giảng dạy và nghiên cứu về phát triển phần mềm, kỹ thuật phần mềm.', '2005-09-01'),
('BM_HTTT', 'Bộ môn Hệ thống thông tin', 'Phụ trách các môn học liên quan đến hệ thống thông tin, cơ sở dữ liệu, phân tích thiết kế.', '2006-03-15'),
('BM_KHDL', 'Bộ môn Khoa học dữ liệu', 'Chuyên về dữ liệu lớn, khai phá dữ liệu, học máy, AI.', '2012-05-20'),
('BM_MMT', 'Bộ môn Mạng máy tính', 'Chuyên giảng dạy và nghiên cứu về mạng máy tính, mạng truyền thông, bảo mật.', '2007-10-10');


INSERT INTO GiangVien (maGV, hoTen, email, soDienThoai, maBM, hocVi, hocHam, chuyenNganh, chucVu) VALUES
('GV01','Nguyễn Thị Ánh','GV01@huit.edu.vn','0977000001','BM_KHDL','TS','Trưởng Khoa','Khoa học dữ liệu','TruongKhoa'),
('GV02','Trần Văn Bình','GV02@huit.edu.vn','0977000002','BM_HTTT','ThS','Trưởng Bộ Môn','Bộ môn Hệ thống thông tin','TruongBoMon'),
('GV03','Lê Minh Châu','GV03@huit.edu.vn','0977000003','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien'),
('GV04','Phạm Thị Dung','GV04@huit.edu.vn','0977000004','BM_KHDL','ThS','','Khoa học dữ liệu','GiangVien'),
('GV05','Hoàng Quốc Đại','GV05@huit.edu.vn','0977000005','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien'),
('GV06','Võ Thị Hồng','GV06@huit.edu.vn','0977000006','BM_MMT','ThS','','Mạng máy tính','GiaoVu');

-- thêm 30 giảng viên
INSERT INTO GiangVien (maGV, hoTen, email, soDienThoai, maBM, hocVi, hocHam, chuyenNganh, chucVu) VALUES
('GV07','Trần Thị Hoa','GV07@huit.edu.vn','0977000007','BM_CNPM','TS','Giảng viên chính','Công nghệ phần mềm','GiangVien'),
('GV08','Lê Văn Minh','GV08@huit.edu.vn','0977000008','BM_CNPM','ThS','','Công nghệ phần mềm','GiangVien'),
('GV09','Phạm Thị Lan','GV09@huit.edu.vn','0977000009','BM_HTTT','TS','','Hệ thống thông tin','GiangVien'),
('GV10','Nguyễn Văn Hùng','GV10@huit.edu.vn','0977000010','BM_HTTT','ThS','','Hệ thống thông tin','GiangVien'),
('GV11','Hoàng Thị Mai','GV11@huit.edu.vn','0977000011','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien'),
('GV12','Đinh Văn Sơn','GV12@huit.edu.vn','0977000012','BM_KHDL','ThS','','Khoa học dữ liệu','GiangVien'),
('GV13','Vũ Thị Hạnh','GV13@huit.edu.vn','0977000013','BM_MMT','TS','','Mạng máy tính','GiangVien'),
('GV14','Đặng Văn Nam','GV14@huit.edu.vn','0977000014','BM_MMT','ThS','','Mạng máy tính','GiangVien'),
('GV15','Phan Thị Dung','GV15@huit.edu.vn','0977000015','BM_CNPM','TS','','Công nghệ phần mềm','GiangVien'),
('GV16','Trương Văn Tài','GV16@huit.edu.vn','0977000016','BM_CNPM','ThS','','Công nghệ phần mềm','GiangVien'),
('GV17','Ngô Thị Hương','GV17@huit.edu.vn','0977000017','BM_HTTT','TS','','Hệ thống thông tin','GiangVien'),
('GV18','Lý Văn Quang','GV18@huit.edu.vn','0977000018','BM_HTTT','ThS','','Hệ thống thông tin','GiangVien'),
('GV19','Phạm Thị Thanh','GV19@huit.edu.vn','0977000019','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien'),
('GV20','Đỗ Văn Bình','GV20@huit.edu.vn','0977000020','BM_KHDL','ThS','','Khoa học dữ liệu','GiangVien'),
('GV21','Nguyễn Thị Lan','GV21@huit.edu.vn','0977000021','BM_MMT','TS','','Mạng máy tính','GiangVien'),
('GV22','Trần Văn Hòa','GV22@huit.edu.vn','0977000022','BM_MMT','ThS','','Mạng máy tính','GiangVien'),
('GV23','Lê Thị Mai','GV23@huit.edu.vn','0977000023','BM_CNPM','TS','','Công nghệ phần mềm','GiangVien'),
('GV24','Hoàng Văn Dũng','GV24@huit.edu.vn','0977000024','BM_CNPM','ThS','','Công nghệ phần mềm','GiangVien'),
('GV25','Đinh Thị Hồng','GV25@huit.edu.vn','0977000025','BM_HTTT','TS','','Hệ thống thông tin','GiangVien'),
('GV26','Vũ Văn Khánh','GV26@huit.edu.vn','0977000026','BM_HTTT','ThS','','Hệ thống thông tin','GiangVien'),
('GV27','Đặng Thị Phương','GV27@huit.edu.vn','0977000027','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien'),
('GV28','Phan Văn Quý','GV28@huit.edu.vn','0977000028','BM_KHDL','ThS','','Khoa học dữ liệu','GiangVien'),
('GV29','Trương Thị Nhung','GV29@huit.edu.vn','0977000029','BM_MMT','TS','','Mạng máy tính','GiangVien'),
('GV30','Ngô Văn Sơn','GV30@huit.edu.vn','0977000030','BM_MMT','ThS','','Mạng máy tính','GiangVien'),
('GV31','Lý Thị Bình','GV31@huit.edu.vn','0977000031','BM_CNPM','TS','','Công nghệ phần mềm','GiangVien'),
('GV32','Trần Văn Thắng','GV32@huit.edu.vn','0977000032','BM_CNPM','ThS','','Công nghệ phần mềm','GiangVien'),
('GV33','Phạm Thị Hoa','GV33@huit.edu.vn','0977000033','BM_HTTT','TS','','Hệ thống thông tin','GiangVien'),
('GV34','Nguyễn Văn Lâm','GV34@huit.edu.vn','0977000034','BM_HTTT','ThS','','Hệ thống thông tin','GiangVien'),
('GV35','Hoàng Thị Duyên','GV35@huit.edu.vn','0977000035','BM_KHDL','TS','','Khoa học dữ liệu','GiangVien');


INSERT INTO Lop (maLop, tenLop, maCVHT) VALUES
('12DHTH10', '12DHTH10', 'GV01'),
('12DHTH11', '12DHTH11', 'GV02'),
('12DHTH12', '12DHTH12', 'GV03');


-- 1. Thêm môn học cho CNPM (Công nghệ phần mềm)
INSERT INTO MonHoc (maMH, tenMH, soTinChi, loaiMon, soTietLyThuyet, soTietThucHanh) VALUES
('MH_CNPM_01', 'Lập trình Java', 3, 'BatBuoc', 30, 15),
('MH_CNPM_02', 'Phân tích và thiết kế hệ thống', 3, 'BatBuoc', 30, 15),
('MH_CNPM_03', 'Cơ sở dữ liệu', 3, 'BatBuoc', 30, 15),
('MH_CNPM_04', 'Phát triển ứng dụng Web', 3, 'TuChon', 30, 15),
('MH_CNPM_05', 'Kiểm thử phần mềm', 3, 'TuChon', 30, 15),
('MH_CNPM_06', 'Quản lý dự án phần mềm', 3, 'TuChon', 30, 15),
('MH_CNPM_07', 'Kiến trúc phần mềm', 3, 'BatBuoc', 30, 15),
('MH_CNPM_08', 'Bảo mật phần mềm', 3, 'TuChon', 30, 15);

INSERT INTO ChuyenNganh_MonHoc (maCN, maMH, BatBuoc) VALUES
('CNPM', 'MH_CNPM_01', 1),
('CNPM', 'MH_CNPM_02', 1),
('CNPM', 'MH_CNPM_03', 1),
('CNPM', 'MH_CNPM_04', 0),
('CNPM', 'MH_CNPM_05', 0),
('CNPM', 'MH_CNPM_06', 0),
('CNPM', 'MH_CNPM_07', 1),
('CNPM', 'MH_CNPM_08', 0);

-- 2. Thêm môn học cho HTTT (Hệ thống thông tin)
INSERT INTO MonHoc (maMH, tenMH, soTinChi, loaiMon, soTietLyThuyet, soTietThucHanh) VALUES
('MH_HTTT_01', 'Mạng máy tính cơ bản', 3, 'BatBuoc', 30, 15),
('MH_HTTT_02', 'Cấu trúc dữ liệu', 3, 'BatBuoc', 30, 15),
('MH_HTTT_03', 'Hệ quản trị cơ sở dữ liệu', 3, 'BatBuoc', 30, 15),
('MH_HTTT_04', 'Bảo mật hệ thống', 3, 'TuChon', 30, 15),
('MH_HTTT_05', 'Quản trị mạng', 3, 'TuChon', 30, 15),
('MH_HTTT_06', 'Xử lý dữ liệu lớn', 3, 'TuChon', 30, 15),
('MH_HTTT_07', 'Phân tích dữ liệu', 3, 'BatBuoc', 30, 15),
('MH_HTTT_08', 'Triển khai hệ thống', 3, 'TuChon', 30, 15);

INSERT INTO ChuyenNganh_MonHoc (maCN, maMH, BatBuoc) VALUES
('HTTT', 'MH_HTTT_01', 1),
('HTTT', 'MH_HTTT_02', 1),
('HTTT', 'MH_HTTT_03', 1),
('HTTT', 'MH_HTTT_04', 0),
('HTTT', 'MH_HTTT_05', 0),
('HTTT', 'MH_HTTT_06', 0),
('HTTT', 'MH_HTTT_07', 1),
('HTTT', 'MH_HTTT_08', 0);

-- 3. Thêm môn học cho KHDL (Khoa học dữ liệu)
INSERT INTO MonHoc (maMH, tenMH, soTinChi, loaiMon, soTietLyThuyet, soTietThucHanh) VALUES
('MH_KHDL_01', 'Toán cao cấp', 3, 'BatBuoc', 45, 0),
('MH_KHDL_02', 'Xác suất thống kê', 3, 'BatBuoc', 30, 15),
('MH_KHDL_03', 'Nhập môn khoa học dữ liệu', 3, 'BatBuoc', 30, 15),
('MH_KHDL_04', 'Máy học cơ bản', 3, 'TuChon', 30, 15),
('MH_KHDL_05', 'Khai phá dữ liệu', 3, 'TuChon', 30, 15),
('MH_KHDL_06', 'Trực quan hóa dữ liệu', 3, 'TuChon', 30, 15),
('MH_KHDL_07', 'Xử lý ngôn ngữ tự nhiên', 3, 'BatBuoc', 30, 15),
('MH_KHDL_08', 'Phân tích mạng xã hội', 3, 'TuChon', 30, 15);

INSERT INTO ChuyenNganh_MonHoc (maCN, maMH, BatBuoc) VALUES
('KHDL', 'MH_KHDL_01', 1),
('KHDL', 'MH_KHDL_02', 1),
('KHDL', 'MH_KHDL_03', 1),
('KHDL', 'MH_KHDL_04', 0),
('KHDL', 'MH_KHDL_05', 0),
('KHDL', 'MH_KHDL_06', 0),
('KHDL', 'MH_KHDL_07', 1),
('KHDL', 'MH_KHDL_08', 0);

-- 4. Thêm môn học cho MMT (Mạng máy tính)
INSERT INTO MonHoc (maMH, tenMH, soTinChi, loaiMon, soTietLyThuyet, soTietThucHanh) VALUES
('MH_MMT_01', 'Mạng máy tính nâng cao', 3, 'BatBuoc', 30, 15),
('MH_MMT_02', 'Hệ điều hành', 3, 'BatBuoc', 30, 15),
('MH_MMT_03', 'An toàn thông tin', 3, 'BatBuoc', 30, 15),
('MH_MMT_04', 'Mạng không dây', 3, 'TuChon', 30, 15),
('MH_MMT_05', 'Mạng truyền thông', 3, 'TuChon', 30, 15),
('MH_MMT_06', 'Quản trị hệ thống', 3, 'TuChon', 30, 15),
('MH_MMT_07', 'Phân tích hiệu năng mạng', 3, 'BatBuoc', 30, 15),
('MH_MMT_08', 'Mạng di động', 3, 'TuChon', 30, 15);

INSERT INTO ChuyenNganh_MonHoc (maCN, maMH, BatBuoc) VALUES
('MMT', 'MH_MMT_01', 1),
('MMT', 'MH_MMT_02', 1),
('MMT', 'MH_MMT_03', 1),
('MMT', 'MH_MMT_04', 0),
('MMT', 'MH_MMT_05', 0),
('MMT', 'MH_MMT_06', 0),
('MMT', 'MH_MMT_07', 1),
('MMT', 'MH_MMT_08', 0);


INSERT INTO LopHocPhan (maLopHP, maMH, namHoc, hocKy, siSoToiDa, siSoHienTai, trangThai, ngayBatDau, ngayKetThuc, maGV) VALUES
-- CNPM
('LHP_CNPM_01', 'MH_CNPM_01', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV07'),
('LHP_CNPM_02', 'MH_CNPM_02', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV08'),
('LHP_CNPM_03', 'MH_CNPM_03', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV09'),
('LHP_CNPM_04', 'MH_CNPM_04', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV10'),
('LHP_CNPM_05', 'MH_CNPM_05', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV11'),
('LHP_CNPM_06', 'MH_CNPM_06', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV12'),
('LHP_CNPM_07', 'MH_CNPM_07', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV13'),
('LHP_CNPM_08', 'MH_CNPM_08', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV14'),

-- HTTT
('LHP_HTTT_01', 'MH_HTTT_01', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV15'),
('LHP_HTTT_02', 'MH_HTTT_02', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV16'),
('LHP_HTTT_03', 'MH_HTTT_03', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV17'),
('LHP_HTTT_04', 'MH_HTTT_04', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV18'),
('LHP_HTTT_05', 'MH_HTTT_05', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV19'),
('LHP_HTTT_06', 'MH_HTTT_06', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV20'),
('LHP_HTTT_07', 'MH_HTTT_07', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV21'),
('LHP_HTTT_08', 'MH_HTTT_08', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV22'),

-- KHDL
('LHP_KHDL_01', 'MH_KHDL_01', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV23'),
('LHP_KHDL_02', 'MH_KHDL_02', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV24'),
('LHP_KHDL_03', 'MH_KHDL_03', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV25'),
('LHP_KHDL_04', 'MH_KHDL_04', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV26'),
('LHP_KHDL_05', 'MH_KHDL_05', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV27'),
('LHP_KHDL_06', 'MH_KHDL_06', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV28'),
('LHP_KHDL_07', 'MH_KHDL_07', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV29'),
('LHP_KHDL_08', 'MH_KHDL_08', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV30'),

-- MMT
('LHP_MMT_01', 'MH_MMT_01', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV31'),
('LHP_MMT_02', 'MH_MMT_02', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV32'),
('LHP_MMT_03', 'MH_MMT_03', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV33'),
('LHP_MMT_04', 'MH_MMT_04', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV34'),
('LHP_MMT_05', 'MH_MMT_05', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV35'),
('LHP_MMT_06', 'MH_MMT_06', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV01'),
('LHP_MMT_07', 'MH_MMT_07', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV02'),
('LHP_MMT_08', 'MH_MMT_08', '2024-2025', 'HK1', 50, 0, 'ChuaMo', NULL, NULL, 'GV03');


INSERT INTO SinhVien VALUES ('2001215601','Nguyễn Văn Hải','2001215601@huit.edu.vn','0912314421','Long An','2004-08-22','Nu','2020-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215682','Võ Nguyễn Hữu Duy','huuduy.study@gmail.com','0912314421','Long An','2004-08-22','Nam','2020-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215602','Trần Thị Lan','2001215602@huit.edu.vn','0912337391','TP.HCM','2004-03-14','Nu','2020-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215603','Lê Minh Hoàng','2001215603@huit.edu.vn','0912335981','Bình Dương','2004-05-07','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215604','Phạm Thị Hương','2001215604@huit.edu.vn','0912326259','Long An','2004-06-13','Nam','2022-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215605','Hoàng Văn Dũng','2001215605@huit.edu.vn','0912340597','Long An','2002-08-16','Nu','2020-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215606','Vũ Thị Mai','2001215606@huit.edu.vn','0912330933','TP.HCM','2004-07-09','Nu','2022-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215607','Đỗ Văn Quân','2001215607@huit.edu.vn','0912321236','TP.HCM','2003-01-12','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215608','Đặng Thị Phương','2001215608@huit.edu.vn','0912326666','TP.HCM','2002-04-05','Nam','2020-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215609','Bùi Văn Tú','2001215609@huit.edu.vn','0912384395','Bình Dương','2004-06-02','Nu','2023-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215610','Phan Thị Ngọc','2001215610@huit.edu.vn','0912349603','Bình Dương','2003-08-15','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215611','Trương Minh Triết','2001215611@huit.edu.vn','0912371955','Đồng Nai','2004-08-31','Nu','2022-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215612','Lý Thị Thanh','2001215612@huit.edu.vn','0912396307','TP.HCM','2002-05-28','Nu','2020-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215613','Hồ Văn Lộc','2001215613@huit.edu.vn','0912395681','Đồng Nai','2004-02-01','Nam','2022-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215614','Ngô Thị Kim','2001215614@huit.edu.vn','0912362970','Bình Dương','2004-05-08','Nu','2022-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215615','Dương Văn Khánh','2001215615@huit.edu.vn','0912368278','TP.HCM','2002-11-01','Nam','2020-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215616','Đinh Thị Ngân','2001215616@huit.edu.vn','0912395725','TP.HCM','2002-03-17','Nu','2020-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215617','Vương Minh Đức','2001215617@huit.edu.vn','0912316908','Đồng Nai','2002-06-27','Nu','2020-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215618','Hà Thị Mỹ','2001215618@huit.edu.vn','0912391443','Đồng Nai','2003-01-06','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215619','Phùng Văn Tiến','2001215619@huit.edu.vn','0912346617','Đồng Nai','2003-02-07','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215620','Mai Thị Phương','2001215620@huit.edu.vn','0912333825','Long An','2003-04-30','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215621','Tạ Văn Khoa','2001215621@huit.edu.vn','0912363916','TP.HCM','2004-08-30','Nu','2023-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215622','Phùng Thị Thu','2001215622@huit.edu.vn','0912317652','Bình Dương','2002-08-13','Nam','2020-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215623','Trịnh Văn Tài','2001215623@huit.edu.vn','0912310246','Bình Dương','2003-07-22','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215624','Chu Thị Ánh','2001215624@huit.edu.vn','0912370145','Đồng Nai','2002-12-11','Nam','2020-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215625','Nguyễn Thị Thanh','2001215625@huit.edu.vn','0912393780','Bình Dương','2003-12-16','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215626','Lê Thị Phúc','2001215626@huit.edu.vn','0912329101','Bình Dương','2002-09-18','Nam','2020-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215627','Trần Văn Sơn','2001215627@huit.edu.vn','0912347961','TP.HCM','2002-08-25','Nu','2020-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215628','Phạm Minh Châu','2001215628@huit.edu.vn','0912394259','Bình Dương','2004-08-10','Nam','2023-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215629','Võ Thị Bích','2001215629@huit.edu.vn','0912372174','Long An','2002-02-12','Nu','2020-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215630','Huỳnh Văn Bình','2001215630@huit.edu.vn','0912385273','Đồng Nai','2004-05-13','Nu','2022-09-01','Dang hoc','HTTT','12DHTH11');

-- thêm 70 sinh viên
INSERT INTO SinhVien VALUES ('2001215631','Trần Thị Thanh','2001215631@huit.edu.vn','0912340001','Bình Dương','2004-03-20','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215632','Phạm Văn Sơn','2001215632@huit.edu.vn','0912340002','Long An','2003-11-15','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215633','Lê Thị Hương','2001215633@huit.edu.vn','0912340003','TP.HCM','2003-08-07','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215634','Nguyễn Văn Nam','2001215634@huit.edu.vn','0912340004','Bình Dương','2003-07-09','Nam','2021-09-01','Dang hoc','MMT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215635','Hoàng Thị Lan','2001215635@huit.edu.vn','0912340005','Long An','2004-01-22','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215636','Đặng Văn Hùng','2001215636@huit.edu.vn','0912340006','TP.HCM','2003-12-18','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215637','Vũ Thị Minh','2001215637@huit.edu.vn','0912340007','Bình Dương','2003-09-14','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215638','Phan Văn Quân','2001215638@huit.edu.vn','0912340008','Long An','2003-06-30','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215639','Trương Thị Mai','2001215639@huit.edu.vn','0912340009','TP.HCM','2003-05-11','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215640','Ngô Văn Khang','2001215640@huit.edu.vn','0912340010','Bình Dương','2003-04-06','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215641','Lê Thị Thu','2001215641@huit.edu.vn','0912340011','Long An','2003-03-19','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215642','Phạm Văn Bình','2001215642@huit.edu.vn','0912340012','TP.HCM','2003-02-23','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215643','Trần Thị Duyên','2001215643@huit.edu.vn','0912340013','Bình Dương','2003-01-27','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215644','Đỗ Văn Đức','2001215644@huit.edu.vn','0912340014','Long An','2002-12-12','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215645','Nguyễn Thị Hoa','2001215645@huit.edu.vn','0912340015','TP.HCM','2002-11-08','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215646','Bùi Văn Long','2001215646@huit.edu.vn','0912340016','Bình Dương','2002-10-03','Nam','2021-09-01','Dang hoc','MMT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215647','Lý Thị Phương','2001215647@huit.edu.vn','0912340017','Long An','2002-09-21','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215648','Trần Văn Tài','2001215648@huit.edu.vn','0912340018','TP.HCM','2002-08-14','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215649','Phạm Thị Nga','2001215649@huit.edu.vn','0912340019','Bình Dương','2002-07-30','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215650','Nguyễn Văn Hòa','2001215650@huit.edu.vn','0912340020','Long An','2002-06-17','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215651','Lê Thị Hạnh','2001215651@huit.edu.vn','0912340021','TP.HCM','2002-05-11','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215652','Hoàng Văn Phúc','2001215652@huit.edu.vn','0912340022','Bình Dương','2002-04-06','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215653','Đặng Thị Mai','2001215653@huit.edu.vn','0912340023','Long An','2002-03-19','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215654','Phan Văn Sơn','2001215654@huit.edu.vn','0912340024','TP.HCM','2002-02-23','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215655','Trương Thị Hương','2001215655@huit.edu.vn','0912340025','Bình Dương','2002-01-27','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215656','Nguyễn Văn Anh','2001215656@huit.edu.vn','0912340026','Long An','2001-12-12','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215657','Lê Thị Thu','2001215657@huit.edu.vn','0912340027','TP.HCM','2001-11-08','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215658','Phạm Văn Bình','2001215658@huit.edu.vn','0912340028','Bình Dương','2001-10-03','Nam','2021-09-01','Dang hoc','MMT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215659','Trần Thị Duyên','2001215659@huit.edu.vn','0912340029','Long An','2001-09-21','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215660','Đỗ Văn Đức','2001215660@huit.edu.vn','0912340030','TP.HCM','2001-08-14','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215661','Vũ Thị Lan','2001215661@huit.edu.vn','0912340031','Bình Dương','2001-07-10','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215662','Lê Văn Hùng','2001215662@huit.edu.vn','0912340032','Long An','2001-06-22','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215663','Phạm Thị Minh','2001215663@huit.edu.vn','0912340033','TP.HCM','2001-05-19','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215664','Trần Văn Nam','2001215664@huit.edu.vn','0912340034','Bình Dương','2001-04-25','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215665','Nguyễn Thị Hạnh','2001215665@huit.edu.vn','0912340035','Long An','2001-03-15','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215666','Hoàng Văn Phúc','2001215666@huit.edu.vn','0912340036','TP.HCM','2001-02-27','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215667','Đặng Thị Hoa','2001215667@huit.edu.vn','0912340037','Bình Dương','2001-01-20','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215668','Phan Văn Quang','2001215668@huit.edu.vn','0912340038','Long An','2000-12-30','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215669','Trương Thị Mai','2001215669@huit.edu.vn','0912340039','TP.HCM','2000-11-25','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215670','Ngô Văn Khang','2001215670@huit.edu.vn','0912340040','Bình Dương','2000-10-19','Nam','2021-09-01','Dang hoc','MMT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215671','Lê Thị Thu','2001215671@huit.edu.vn','0912340041','Long An','2000-09-15','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215672','Phạm Văn Bình','2001215672@huit.edu.vn','0912340042','TP.HCM','2000-08-10','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215673','Trần Thị Duyên','2001215673@huit.edu.vn','0912340043','Bình Dương','2000-07-04','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215674','Đỗ Văn Đức','2001215674@huit.edu.vn','0912340044','Long An','2000-06-01','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215675','Nguyễn Thị Hoa','2001215675@huit.edu.vn','0912340045','TP.HCM','2000-05-22','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215676','Bùi Văn Long','2001215676@huit.edu.vn','0912340046','Bình Dương','2000-04-16','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215677','Lý Thị Phương','2001215677@huit.edu.vn','0912340047','Long An','2000-03-08','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215678','Trần Văn Tài','2001215678@huit.edu.vn','0912340048','TP.HCM','2000-02-02','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215679','Phạm Thị Nga','2001215679@huit.edu.vn','0912340049','Bình Dương','2000-01-25','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215680','Nguyễn Văn Hòa','2001215680@huit.edu.vn','0912340050','Long An','1999-12-20','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215681','Lê Thị Hạnh','2001215681@huit.edu.vn','0912340051','TP.HCM','1999-11-15','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215683','Đặng Thị Mai','2001215683@huit.edu.vn','0912340053','Long An','1999-09-05','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215684','Phan Văn Sơn','2001215684@huit.edu.vn','0912340054','TP.HCM','1999-08-01','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215685','Trương Thị Hương','2001215685@huit.edu.vn','0912340055','Bình Dương','1999-07-20','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215686','Nguyễn Văn Anh','2001215686@huit.edu.vn','0912340056','Long An','1999-06-18','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215687','Lê Thị Thu','2001215687@huit.edu.vn','0912340057','TP.HCM','1999-05-14','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215688','Phạm Văn Bình','2001215688@huit.edu.vn','0912340058','Bình Dương','1999-04-10','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215689','Trần Thị Duyên','2001215689@huit.edu.vn','0912340059','Long An','1999-03-05','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215690','Đỗ Văn Đức','2001215690@huit.edu.vn','0912340060','TP.HCM','1999-02-01','Nam','2021-09-01','Dang hoc','MMT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215691','Vũ Thị Hằng','2001215691@huit.edu.vn','0912340061','Bình Dương','1999-01-15','Nu','2021-09-01','Dang hoc','CNPM','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215692','Lê Văn Bình','2001215692@huit.edu.vn','0912340062','Long An','1998-12-10','Nam','2021-09-01','Dang hoc','HTTT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215693','Phạm Thị Lan','2001215693@huit.edu.vn','0912340063','TP.HCM','1998-11-05','Nu','2021-09-01','Dang hoc','KHDL','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215694','Trần Văn Hoàng','2001215694@huit.edu.vn','0912340064','Bình Dương','1998-10-01','Nam','2021-09-01','Dang hoc','MMT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215695','Nguyễn Thị Phương','2001215695@huit.edu.vn','0912340065','Long An','1998-09-17','Nu','2021-09-01','Dang hoc','CNPM','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215696','Hoàng Văn Quân','2001215696@huit.edu.vn','0912340066','TP.HCM','1998-08-13','Nam','2021-09-01','Dang hoc','HTTT','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215697','Đặng Thị Hương','2001215697@huit.edu.vn','0912340067','Bình Dương','1998-07-09','Nu','2021-09-01','Dang hoc','KHDL','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215698','Phan Văn Long','2001215698@huit.edu.vn','0912340068','Long An','1998-06-05','Nam','2021-09-01','Dang hoc','MMT','12DHTH11');
INSERT INTO SinhVien VALUES ('2001215699','Trương Thị Thanh','2001215699@huit.edu.vn','0912340069','TP.HCM','1998-05-01','Nu','2021-09-01','Dang hoc','CNPM','12DHTH12');
INSERT INTO SinhVien VALUES ('2001215700','Ngô Văn Đức','2001215700@huit.edu.vn','0912340070','Bình Dương','1998-04-15','Nam','2021-09-01','Dang hoc','HTTT','12DHTH10');
INSERT INTO SinhVien VALUES ('2001215701','Lê Thị Mai','2001215701@huit.edu.vn','0912340071','Long An','1998-03-10','Nu','2021-09-01','Dang hoc','KHDL','12DHTH11');



INSERT INTO YeuCauMoLop (maYeuCau, ngayGui, tinhTrangTongQuat, trangThaiXuLy, maSV, maLopHP, maMH, soLuongThamGia, description) VALUES
-- CNPM
('YC_CNPM_01', '2025-01-05', 'DaGui', '1_GiaoVuNhan', '2001215601', 'LHP_CNPM_01', 'MH_CNPM_01', 35, 'Yêu cầu mở lớp CNPM 01'),
('YC_CNPM_02', '2025-01-06', 'DaGui', '1_GiaoVuNhan', '2001215602', 'LHP_CNPM_02', 'MH_CNPM_02', 40, 'Yêu cầu mở lớp CNPM 02'),
('YC_CNPM_03', '2025-01-07', 'DaGui', '1_GiaoVuNhan', '2001215603', 'LHP_CNPM_03', 'MH_CNPM_03', 32, 'Yêu cầu mở lớp CNPM 03'),

-- HTTT
('YC_HTTT_01', '2025-01-08', 'DaGui', '1_GiaoVuNhan', '2001215604', 'LHP_HTTT_01', 'MH_HTTT_01', 38, 'Yêu cầu mở lớp HTTT 01'),
('YC_HTTT_02', '2025-01-09', 'DaGui', '1_GiaoVuNhan', '2001215605', 'LHP_HTTT_02', 'MH_HTTT_02', 30, 'Yêu cầu mở lớp HTTT 02'),

-- KHDL
('YC_KHDL_01', '2025-01-10', 'DaGui', '1_GiaoVuNhan', '2001215606', 'LHP_KHDL_01', 'MH_KHDL_01', 33, 'Yêu cầu mở lớp KHDL 01'),
('YC_KHDL_02', '2025-01-11', 'DaGui', '1_GiaoVuNhan', '2001215607', 'LHP_KHDL_02', 'MH_KHDL_02', 29, 'Yêu cầu mở lớp KHDL 02'),

-- MMT
('YC_MMT_01', '2025-01-12', 'DaGui', '1_GiaoVuNhan', '2001215608', 'LHP_MMT_01', 'MH_MMT_01', 36, 'Yêu cầu mở lớp MMT 01'),
('YC_MMT_02', '2025-01-13', 'DaGui', '1_GiaoVuNhan', '2001215609', 'LHP_MMT_02', 'MH_MMT_02', 41, 'Yêu cầu mở lớp MMT 02');

-- Insert into BangTin
INSERT INTO BangTin VALUES('TB01', 'Lịch Thi Giữa Kỳ', 'Lịch thi giữa kỳ được công bố ngày 15/03', '2025-02-20', 'GV06', 'TatCa');
INSERT INTO BangTin VALUES('TB02', 'Bảo trì Hệ Thống', 'Hệ thống đăng ký sẽ bảo trì ngày 01/03', '2025-02-25', 'GV05', 'SinhVien');
INSERT INTO BangTin VALUES('TB03', 'Hội Thảo AI', 'Mời tham gia hội thảo AI ngày 10/04', '2025-03-01', 'GV01', 'TatCa');

-- Insert into DangKyLichDay
INSERT INTO DangKyLichDay (maDangKy, maGV, maLopHP, ngayDangKy, trangThai) VALUES
('DKLD01', 'GV03', 'LHP_CNPM_01', '2025-02-01', 'ChapNhan'),
('DKLD02', 'GV04', 'LHP_CNPM_02', '2025-02-02', 'ChapNhan'),
('DKLD03', 'GV05', 'LHP_CNPM_03', '2025-02-03', 'ChoDuyet'),
('DKLD04', 'GV07', 'LHP_HTTT_01', '2025-02-04', 'ChapNhan'),
('DKLD05', 'GV08', 'LHP_HTTT_02', '2025-02-05', 'TuChoi'),
('DKLD06', 'GV09', 'LHP_KHDL_01', '2025-02-06', 'ChapNhan'),
('DKLD07', 'GV10', 'LHP_KHDL_02', '2025-02-07', 'ChapNhan'),
('DKLD08', 'GV11', 'LHP_MMT_01', '2025-02-08', 'ChoDuyet'),
('DKLD09', 'GV12', 'LHP_MMT_02', '2025-02-09', 'ChapNhan'),
('DKLD10', 'GV13', 'LHP_MMT_03', '2025-02-10', 'ChapNhan');


-- Insert into PhanCongGiangVien
INSERT INTO PhanCongGiangVien (maPhanCong, maGV, maLopHP, ngayPhanCong) VALUES
-- GV03 đến GV35, bỏ GV06
('PC01', 'GV03', 'LHP_CNPM_01', CURDATE()),
('PC02', 'GV04', 'LHP_CNPM_02', CURDATE()),
('PC03', 'GV05', 'LHP_CNPM_03', CURDATE()),
('PC04', 'GV07', 'LHP_CNPM_04', CURDATE()),
('PC05', 'GV08', 'LHP_CNPM_05', CURDATE()),
('PC06', 'GV09', 'LHP_CNPM_06', CURDATE()),
('PC07', 'GV10', 'LHP_CNPM_07', CURDATE()),
('PC08', 'GV11', 'LHP_CNPM_08', CURDATE()),

('PC09', 'GV12', 'LHP_HTTT_01', CURDATE()),
('PC10', 'GV13', 'LHP_HTTT_02', CURDATE()),
('PC11', 'GV14', 'LHP_HTTT_03', CURDATE()),
('PC12', 'GV15', 'LHP_HTTT_04', CURDATE()),
('PC13', 'GV16', 'LHP_HTTT_05', CURDATE()),
('PC14', 'GV17', 'LHP_HTTT_06', CURDATE()),
('PC15', 'GV18', 'LHP_HTTT_07', CURDATE()),
('PC16', 'GV19', 'LHP_HTTT_08', CURDATE()),

('PC17', 'GV20', 'LHP_KHDL_01', CURDATE()),
('PC18', 'GV21', 'LHP_KHDL_02', CURDATE()),
('PC19', 'GV22', 'LHP_KHDL_03', CURDATE()),
('PC20', 'GV23', 'LHP_KHDL_04', CURDATE()),
('PC21', 'GV24', 'LHP_KHDL_05', CURDATE()),
('PC22', 'GV25', 'LHP_KHDL_06', CURDATE()),
('PC23', 'GV26', 'LHP_KHDL_07', CURDATE()),
('PC24', 'GV27', 'LHP_KHDL_08', CURDATE()),

('PC25', 'GV28', 'LHP_MMT_01', CURDATE()),
('PC26', 'GV29', 'LHP_MMT_02', CURDATE()),
('PC27', 'GV30', 'LHP_MMT_03', CURDATE()),
('PC28', 'GV31', 'LHP_MMT_04', CURDATE()),
('PC29', 'GV32', 'LHP_MMT_05', CURDATE()),
('PC30', 'GV33', 'LHP_MMT_06', CURDATE()),
('PC31', 'GV34', 'LHP_MMT_07', CURDATE()),
('PC32', 'GV35', 'LHP_MMT_08', CURDATE());

INSERT INTO MauThoiKhoaBieu (maLopHP, thuTrongTuan, tietBD, tietKT, phongHoc) VALUES
    -- CNPM
    ('LHP_CNPM_01', 2, '07:00', '08:40', 'A101'),
    ('LHP_CNPM_01', 4, '09:30', '11:10', 'A101'),
    ('LHP_CNPM_01', 6, '12:00', '13:40', 'A101'),
    ('LHP_CNPM_02', 3, '07:00', '08:40', 'A102'),
    ('LHP_CNPM_02', 5, '09:30', '11:10', 'A102'),
    ('LHP_CNPM_02', 7, '12:00', '13:40', 'A102'),
    ('LHP_CNPM_03', 2, '09:30', '11:10', 'A103'),
    ('LHP_CNPM_03', 4, '12:00', '13:40', 'A103'),
    ('LHP_CNPM_04', 3, '09:30', '11:10', 'A104'),
    ('LHP_CNPM_04', 5, '12:00', '13:40', 'A104'),
    ('LHP_CNPM_05', 2, '07:00', '08:40', 'A101'),
    ('LHP_CNPM_05', 4, '09:30', '11:10', 'A101'),
    ('LHP_CNPM_05', 6, '12:00', '13:40', 'A101'),
    ('LHP_CNPM_06', 3, '07:00', '08:40', 'A102'),
    ('LHP_CNPM_06', 5, '09:30', '11:10', 'A102'),
    ('LHP_CNPM_06', 7, '12:00', '13:40', 'A102'),
    ('LHP_CNPM_07', 2, '09:30', '11:10', 'A103'),
    ('LHP_CNPM_07', 4, '12:00', '13:40', 'A103'),
    ('LHP_CNPM_08', 3, '09:30', '11:10', 'A104'),
    ('LHP_CNPM_08', 5, '12:00', '13:40', 'A104'),

    -- HTTT
    ('LHP_HTTT_01', 2, '07:00', '08:40', 'B101'),
    ('LHP_HTTT_01', 4, '09:30', '11:10', 'B101'),
    ('LHP_HTTT_01', 6, '12:00', '13:40', 'B101'),
    ('LHP_HTTT_02', 3, '07:00', '08:40', 'B102'),
    ('LHP_HTTT_02', 5, '09:30', '11:10', 'B102'),
    ('LHP_HTTT_02', 7, '12:00', '13:40', 'B102'),
    ('LHP_HTTT_03', 2, '09:30', '11:10', 'B103'),
    ('LHP_HTTT_03', 4, '12:00', '13:40', 'B103'),
    ('LHP_HTTT_04', 3, '09:30', '11:10', 'B104'),
    ('LHP_HTTT_04', 5, '12:00', '13:40', 'B104'),
    ('LHP_HTTT_05', 2, '07:00', '08:40', 'B101'),
    ('LHP_HTTT_05', 4, '09:30', '11:10', 'B101'),
    ('LHP_HTTT_05', 6, '12:00', '13:40', 'B101'),
    ('LHP_HTTT_06', 3, '07:00', '08:40', 'B102'),
    ('LHP_HTTT_06', 5, '09:30', '11:10', 'B102'),
    ('LHP_HTTT_06', 7, '12:00', '13:40', 'B102'),
    ('LHP_HTTT_07', 2, '09:30', '11:10', 'B103'),
    ('LHP_HTTT_07', 4, '12:00', '13:40', 'B103'),
    ('LHP_HTTT_08', 3, '09:30', '11:10', 'B104'),
    ('LHP_HTTT_08', 5, '12:00', '13:40', 'B104'),

    -- KHDL
    ('LHP_KHDL_01', 2, '07:00', '08:40', 'C101'),
    ('LHP_KHDL_01', 4, '09:30', '11:10', 'C101'),
    ('LHP_KHDL_01', 6, '12:00', '13:40', 'C101'),
    ('LHP_KHDL_02', 3, '07:00', '08:40', 'C102'),
    ('LHP_KHDL_02', 5, '09:30', '11:10', 'C102'),
    ('LHP_KHDL_02', 7, '12:00', '13:40', 'C102'),
    ('LHP_KHDL_03', 2, '09:30', '11:10', 'C103'),
    ('LHP_KHDL_03', 4, '12:00', '13:40', 'C103'),
    ('LHP_KHDL_04', 3, '09:30', '11:10', 'C104'),
    ('LHP_KHDL_04', 5, '12:00', '13:40', 'C104'),
    ('LHP_KHDL_05', 2, '07:00', '08:40', 'C101'),
    ('LHP_KHDL_05', 4, '09:30', '11:10', 'C101'),
    ('LHP_KHDL_05', 6, '12:00', '13:40', 'C101'),
    ('LHP_KHDL_06', 3, '07:00', '08:40', 'C102'),
    ('LHP_KHDL_06', 5, '09:30', '11:10', 'C102'),
    ('LHP_KHDL_06', 7, '12:00', '13:40', 'C102'),
    ('LHP_KHDL_07', 2, '09:30', '11:10', 'C103'),
    ('LHP_KHDL_07', 4, '12:00', '13:40', 'C103'),
    ('LHP_KHDL_08', 3, '09:30', '11:10', 'C104'),
    ('LHP_KHDL_08', 5, '12:00', '13:40', 'C104'),

    -- MMT
    ('LHP_MMT_01', 2, '07:00', '08:40', 'D101'),
    ('LHP_MMT_01', 4, '09:30', '11:10', 'D101'),
    ('LHP_MMT_01', 6, '12:00', '13:40', 'D101'),
    ('LHP_MMT_02', 3, '07:00', '08:40', 'D102'),
    ('LHP_MMT_02', 5, '09:30', '11:10', 'D102'),
    ('LHP_MMT_02', 7, '12:00', '13:40', 'D102'),
    ('LHP_MMT_03', 2, '09:30', '11:10', 'D103'),
    ('LHP_MMT_03', 4, '12:00', '13:40', 'D103'),
    ('LHP_MMT_04', 3, '09:30', '11:10', 'D104'),
    ('LHP_MMT_04', 5, '12:00', '13:40', 'D104'),
    ('LHP_MMT_05', 2, '07:00', '08:40', 'D101'),
    ('LHP_MMT_05', 4, '09:30', '11:10', 'D101'),
    ('LHP_MMT_05', 6, '12:00', '13:40', 'D101'),
    ('LHP_MMT_06', 3, '07:00', '08:40', 'D102'),
    ('LHP_MMT_06', 5, '09:30', '11:10', 'D102'),
    ('LHP_MMT_06', 7, '12:00', '13:40', 'D102'),
    ('LHP_MMT_07', 2, '09:30', '11:10', 'D103'),
    ('LHP_MMT_07', 4, '12:00', '13:40', 'D103'),
    ('LHP_MMT_08', 3, '09:30', '11:10', 'D104'),
    ('LHP_MMT_08', 5, '12:00', '13:40', 'D104');

-- kết thúc proc

select * from yeucaumolop
select * from sinhvien
select * from lophocphan
select * from lop
select * from phanlop
select * from nguoidung
select * from giangvien
select * from phanconggiangvien
SELECT * FROM LopHocPhan WHERE trangThai = 'DangHoc'
SELECT * FROM ThoiKhoaBieuGiangVien where magv = 'gv07'
select * from monhoc
select * from chuyennganh
select * from chuyennganh_monhoc
select * from sinhvien_monhoc
select  * from yeucaumolop;
select * from lichsuthaydoiyeucau
select * from sinhvien_monhoc
select * from thoikhoabieugiangvien
DELETE FROM LichSuThayDoiYeuCau
WHERE maYeuCau IN ('YC001', 'YC002', 'YC003', 'YC004', 'YC005');

DELETE FROM LichSuThayDoiYeuCau;
DELETE FROM YeuCauMoLop;

-- Procedure kiểm tra và tạo thời khóa biểu
DELIMITER //
CREATE PROCEDURE sp_kiem_tra_va_tao_tkb(
    IN p_maLopHP VARCHAR(20),
    IN p_ngayBatDau DATE,
    IN p_ngayKetThuc DATE,
    IN p_maGV VARCHAR(20)
)
BEGIN
    DECLARE v_coXungDot BOOLEAN;
    DECLARE v_thuTrongTuan TINYINT;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy thông tin từ mẫu thời khóa biểu
    DECLARE cur CURSOR FOR 
        SELECT thuTrongTuan, tietBD, tietKT
        FROM MauThoiKhoaBieu 
        WHERE maLopHP = p_maLopHP;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Mở cursor
    OPEN cur;
    
    -- Kiểm tra từng buổi học
    check_loop: LOOP
        FETCH cur INTO v_thuTrongTuan, v_tietBD, v_tietKT;
        
        IF done THEN
            LEAVE check_loop;
        END IF;
        
        -- Kiểm tra xung đột
        CALL sp_kiem_tra_xung_dot_lich(p_maLopHP, p_ngayBatDau, v_tietBD, v_tietKT, v_coXungDot);
        
        IF v_coXungDot THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Phát hiện xung đột lịch học!';
        END IF;
    END LOOP;
    
    CLOSE cur;
    
    -- Nếu không có xung đột, tạo các thời khóa biểu
    CALL sp_tao_lich_hoc(p_maLopHP, p_ngayBatDau, p_ngayKetThuc);
    CALL sp_tao_tkb_lop_hoc_phan(p_maLopHP, p_ngayBatDau, p_ngayKetThuc);
    CALL sp_tao_tkb_giang_vien(p_maGV);
    
    -- Tạo thời khóa biểu cho sinh viên trong lớp
    INSERT INTO ThoiKhoaBieuSinhVien (
        maTKB, maSV, maLopHP, ngayHoc, tietBD, tietKT, phongHoc, loaiBuoi
    )
    SELECT 
        CONCAT(sv.maSV, '_', lhp.maLopHP, '_', DATE_FORMAT(tkb.ngayHoc, '%Y%m%d'), '_',
               SUBSTRING(REPLACE(tkb.tietBD, ':', ''), 1, 2)),
        sv.maSV,
        lhp.maLopHP,
        tkb.ngayHoc,
        tkb.tietBD,
        tkb.tietKT,
        tkb.phongHoc,
        tkb.loaiBuoi
    FROM SinhVien sv
    JOIN PhanLop pl ON sv.maSV = pl.maSV
    JOIN LopHocPhan lhp ON pl.maLopHP = lhp.maLopHP
    JOIN ThoiKhoaBieuLopHocPhan tkb ON lhp.maLopHP = tkb.maLopHP
    WHERE lhp.maLopHP = p_maLopHP
    AND pl.trangThai = 'DangHoc';
END //
DELIMITER ;

-- Procedure tạo thời khóa biểu cho toàn bộ hệ thống
DELIMITER //
CREATE PROCEDURE sp_tao_tkb_toan_bo_he_thong(
    IN p_ngayBatDau DATE,
    IN p_ngayKetThuc DATE
)
BEGIN
    DECLARE v_maLopHP VARCHAR(20);
    DECLARE v_maGV VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy danh sách lớp học phần
    DECLARE cur_lophp CURSOR FOR 
        SELECT maLopHP, maGV 
        FROM LopHocPhan 
        WHERE trangThai = 'DangHoc';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa dữ liệu cũ một cách an toàn
    TRUNCATE TABLE LichHoc;
    TRUNCATE TABLE ThoiKhoaBieuLopHocPhan;
    TRUNCATE TABLE ThoiKhoaBieuSinhVien;
    TRUNCATE TABLE ThoiKhoaBieuGiangVien;
    
    -- Mở cursor
    OPEN cur_lophp;
    
    -- Tạo lịch học cho từng lớp học phần
    create_schedule: LOOP
        FETCH cur_lophp INTO v_maLopHP, v_maGV;
        
        IF done THEN
            LEAVE create_schedule;
        END IF;
        
        -- Tạo lịch học cho lớp học phần
        CALL sp_tao_lich_hoc(v_maLopHP, p_ngayBatDau, p_ngayKetThuc);
        
        -- Tạo thời khóa biểu cho lớp học phần
        CALL sp_tao_tkb_lop_hoc_phan(v_maLopHP, p_ngayBatDau, p_ngayKetThuc);
        
        -- Tạo thời khóa biểu cho giảng viên
        CALL sp_tao_tkb_giang_vien(v_maGV);
        
        -- Tạo thời khóa biểu cho sinh viên trong lớp
        INSERT INTO ThoiKhoaBieuSinhVien (
            maTKB, maSV, maLopHP, ngayHoc, tietBD, tietKT, phongHoc, loaiBuoi
        )
        SELECT 
            CONCAT(sv.maSV, '_', lhp.maLopHP, '_', DATE_FORMAT(tkb.ngayHoc, '%Y%m%d'), '_',
                   SUBSTRING(REPLACE(tkb.tietBD, ':', ''), 1, 2)),
            sv.maSV,
            lhp.maLopHP,
            tkb.ngayHoc,
            tkb.tietBD,
            tkb.tietKT,
            tkb.phongHoc,
            tkb.loaiBuoi
        FROM SinhVien sv
        JOIN PhanLop pl ON sv.maSV = pl.maSV
        JOIN LopHocPhan lhp ON pl.maLopHP = lhp.maLopHP
        JOIN ThoiKhoaBieuLopHocPhan tkb ON lhp.maLopHP = tkb.maLopHP
        WHERE lhp.maLopHP = v_maLopHP
        AND pl.trangThai = 'DangHoc';
        
    END LOOP;
    
    CLOSE cur_lophp;
    
    -- Thông báo kết quả
    SELECT 
        (SELECT COUNT(*) FROM LichHoc) AS 'Số lượng lịch học',
        (SELECT COUNT(*) FROM ThoiKhoaBieuLopHocPhan) AS 'Số lượng TKB lớp học phần',
        (SELECT COUNT(*) FROM ThoiKhoaBieuSinhVien) AS 'Số lượng TKB sinh viên',
        (SELECT COUNT(*) FROM ThoiKhoaBieuGiangVien) AS 'Số lượng TKB giảng viên';
END //
DELIMITER ;


CALL sp_tao_tkb_toan_bo_he_thong('2025-04-01', '2025-06-30');



DELIMITER //

CREATE PROCEDURE sp_phan_lop_nhanh(
    IN p_ngayBatDau DATE,
    IN p_ngayKetThuc DATE
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_maSV VARCHAR(20);
    DECLARE v_maCN VARCHAR(20);
    DECLARE v_soLop INT;
    DECLARE v_count INT;
    
    -- Cursor để lấy danh sách sinh viên
    DECLARE cur_sv CURSOR FOR 
        SELECT maSV, maCN 
        FROM SinhVien;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa dữ liệu phân lớp cũ
    DELETE FROM PhanLop;
    
    -- Cập nhật trạng thái các lớp học phần
    UPDATE LopHocPhan 
    SET trangThai = 'DangHoc',
        ngayBatDau = p_ngayBatDau,
        ngayKetThuc = p_ngayKetThuc;
    
    OPEN cur_sv;
    
    read_loop: LOOP
        FETCH cur_sv INTO v_maSV, v_maCN;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Đếm số lớp học phần của chuyên ngành
        SELECT COUNT(*) INTO v_soLop
        FROM LopHocPhan lhp
        JOIN MonHoc mh ON lhp.maMH = mh.maMH
        JOIN ChuyenNganh_MonHoc cnmh ON mh.maMH = cnmh.maMH
        WHERE cnmh.maCN = v_maCN
        AND lhp.trangThai = 'DangHoc';
        
        -- Phân 4 lớp cho mỗi sinh viên
        SET v_count = 0;
        WHILE v_count < 4 DO
            INSERT INTO PhanLop (maSV, maLopHP, trangThai, ngayDangKy)
            SELECT 
                v_maSV,
                lhp.maLopHP,
                'DangHoc',
                CURDATE()
            FROM LopHocPhan lhp
            JOIN MonHoc mh ON lhp.maMH = mh.maMH
            JOIN ChuyenNganh_MonHoc cnmh ON mh.maMH = cnmh.maMH
            WHERE cnmh.maCN = v_maCN
            AND lhp.trangThai = 'DangHoc'
            AND NOT EXISTS (
                SELECT 1 
                FROM PhanLop pl 
                WHERE pl.maSV = v_maSV 
                AND pl.maLopHP = lhp.maLopHP
            )
            LIMIT 1;
            
            SET v_count = v_count + 1;
        END WHILE;
        
    END LOOP;
    
    CLOSE cur_sv;
    
    -- Cập nhật siSoHienTai cho tất cả các lớp học phần
    UPDATE LopHocPhan lhp
    SET lhp.siSoHienTai = (
        SELECT COUNT(*)
        FROM PhanLop pl
        WHERE pl.maLopHP = lhp.maLopHP
        AND pl.trangThai = 'DangHoc'
    );
    
    -- Tạo thời khóa biểu cho tất cả các lớp
    CALL sp_tao_tkb_toan_bo_he_thong(p_ngayBatDau, p_ngayKetThuc);
    
END //

DELIMITER ;

CALL sp_phan_lop_nhanh('2025-04-01', '2025-06-30');


CALL sp_xem_tkb_sinh_vien('2001215675');

-- proc cập nhật tkb gv dựa trên lophocphan
DELIMITER //

CREATE PROCEDURE sp_cap_nhat_tkb_tat_ca_giang_vien()
BEGIN
    DECLARE v_maGV VARCHAR(20);
    DECLARE v_maLopHP VARCHAR(20);
    DECLARE v_ngayHoc DATE;
    DECLARE v_tietBD VARCHAR(5);
    DECLARE v_tietKT VARCHAR(5);
    DECLARE v_phongHoc VARCHAR(10);
    DECLARE v_loaiBuoi ENUM('LyThuyet', 'ThucHanh');
    DECLARE v_maTKB VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    
    -- Cursor để lấy danh sách giảng viên có lớp học phần đang hoạt động
    DECLARE cur_gv CURSOR FOR 
        SELECT DISTINCT pcgv.maGV
        FROM PhanCongGiangVien pcgv
        JOIN LopHocPhan lhp ON pcgv.maLopHP = lhp.maLopHP
        WHERE lhp.trangThai = 'DangHoc';
    
    -- Cursor để lấy thông tin thời khóa biểu
    DECLARE cur_tkb CURSOR FOR 
        SELECT t.maLopHP, t.ngayHoc, t.tietBD, t.tietKT, t.phongHoc, t.loaiBuoi
        FROM ThoiKhoaBieuLopHocPhan t
        JOIN LopHocPhan lhp ON t.maLopHP = lhp.maLopHP
        JOIN PhanCongGiangVien pcgv ON lhp.maLopHP = pcgv.maLopHP
        WHERE pcgv.maGV = v_maGV
        AND lhp.trangThai = 'DangHoc';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Xóa toàn bộ thời khóa biểu cũ
    TRUNCATE TABLE ThoiKhoaBieuGiangVien;
    
    -- Mở cursor giảng viên
    OPEN cur_gv;
    
    gv_loop: LOOP
        FETCH cur_gv INTO v_maGV;
        IF done THEN
            LEAVE gv_loop;
        END IF;
        
        -- Reset done flag cho cursor thời khóa biểu
        SET done = FALSE;
        
        -- Mở cursor thời khóa biểu
        OPEN cur_tkb;
        
        tkb_loop: LOOP
            FETCH cur_tkb INTO v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT, v_phongHoc, v_loaiBuoi;
            
            IF done THEN
                LEAVE tkb_loop;
            END IF;
            
            -- Tạo mã thời khóa biểu
            SET v_maTKB = CONCAT(v_maGV, '_', v_maLopHP, '_', DATE_FORMAT(v_ngayHoc, '%Y%m%d'), '_',
                               REPLACE(v_tietBD, ':', ''));
            
            -- Thêm thời khóa biểu mới
            INSERT INTO ThoiKhoaBieuGiangVien (
                maTKB, maGV, maLopHP, ngayHoc, tietBD, tietKT, 
                phongHoc, loaiBuoi
            ) VALUES (
                v_maTKB, v_maGV, v_maLopHP, v_ngayHoc, v_tietBD, v_tietKT,
                v_phongHoc, v_loaiBuoi
            );
        END LOOP;
        
        CLOSE cur_tkb;
    END LOOP;
    
    CLOSE cur_gv;
    
    -- Thông báo kết quả
    SELECT 
        'Đã cập nhật thời khóa biểu cho tất cả giảng viên' AS 'Thông báo',
        (SELECT COUNT(DISTINCT maGV) FROM ThoiKhoaBieuGiangVien) AS 'Số giảng viên được cập nhật',
        (SELECT COUNT(*) FROM ThoiKhoaBieuGiangVien) AS 'Tổng số buổi học';
END //

DELIMITER ;
--
-- call proc
CALL sp_cap_nhat_tkb_tat_ca_giang_vien();
--
DELIMITER //

DELIMITER //

CREATE PROCEDURE sp_xem_tkb_giang_vien(IN p_maGV VARCHAR(20))
BEGIN
    SELECT 
        mh.tenMH AS 'Tên môn học',
        tkb.maLopHP AS 'Mã học phần',
        CONCAT(tkb.tietBD, ' - ', tkb.tietKT) AS 'Tiết học',
        tkb.phongHoc AS 'Phòng học',
        DATE_FORMAT(tkb.ngayHoc, '%d/%m/%Y') AS 'Ngày học',
        CASE DAYOFWEEK(tkb.ngayHoc)
            WHEN 1 THEN 'Chủ nhật'
            WHEN 2 THEN 'Thứ 2'
            WHEN 3 THEN 'Thứ 3'
            WHEN 4 THEN 'Thứ 4'
            WHEN 5 THEN 'Thứ 5'
            WHEN 6 THEN 'Thứ 6'
            WHEN 7 THEN 'Thứ 7'
        END AS 'Thứ',
        tkb.loaiBuoi AS 'Loại buổi',
        lhp.siSoHienTai AS 'Sĩ số'
    FROM thoikhoabieugiangvien tkb
    JOIN LopHocPhan lhp ON tkb.maLopHP = lhp.maLopHP
    JOIN MonHoc mh ON lhp.maMH = mh.maMH
    WHERE tkb.maGV = p_maGV
    ORDER BY tkb.ngayHoc, tkb.tietBD;
END //

DELIMITER ;

CALL sp_xem_tkb_giang_vien('GV07');

DELIMITER //

-- Trigger 1: Khi thêm/sửa LopHocPhan, tự động cập nhật PhanCongGiangVien
CREATE TRIGGER trg_auto_phan_cong_giang_vien
AFTER INSERT ON LopHocPhan
FOR EACH ROW
BEGIN
    -- Nếu có maGV trong LopHocPhan, tự động tạo phân công
    IF NEW.maGV IS NOT NULL THEN
        INSERT INTO PhanCongGiangVien (maPhanCong, maGV, maLopHP, ngayPhanCong)
        VALUES (
            CONCAT('PC', NEW.maLopHP, '_', NEW.maGV),
            NEW.maGV,
            NEW.maLopHP,
            CURDATE()
        );
    END IF;
END //

-- Trigger 2: Khi cập nhật maGV trong LopHocPhan
CREATE TRIGGER trg_update_phan_cong_giang_vien
AFTER UPDATE ON LopHocPhan
FOR EACH ROW
BEGIN
    IF NEW.maGV != OLD.maGV THEN
        -- Xóa phân công cũ
        DELETE FROM PhanCongGiangVien 
        WHERE maLopHP = NEW.maLopHP;
        
        -- Thêm phân công mới
        IF NEW.maGV IS NOT NULL THEN
            INSERT INTO PhanCongGiangVien (maPhanCong, maGV, maLopHP, ngayPhanCong)
            VALUES (
                CONCAT('PC', NEW.maLopHP, '_', NEW.maGV),
                NEW.maGV,
                NEW.maLopHP,
                CURDATE()
            );
        END IF;
    END IF;
END //

-- Trigger 3: Khi xóa LopHocPhan
CREATE TRIGGER trg_delete_phan_cong_giang_vien
BEFORE DELETE ON LopHocPhan
FOR EACH ROW
BEGIN
    -- Xóa phân công giảng viên
    DELETE FROM PhanCongGiangVien WHERE maLopHP = OLD.maLopHP;
    -- Xóa thời khóa biểu giảng viên
    DELETE FROM ThoiKhoaBieuGiangVien WHERE maLopHP = OLD.maLopHP;
END //

-- Trigger 4: Khi thêm/sửa PhanCongGiangVien
CREATE TRIGGER trg_auto_update_tkb_giang_vien
AFTER INSERT ON PhanCongGiangVien
FOR EACH ROW
BEGIN
    -- Xóa thời khóa biểu cũ của giảng viên cho lớp này
    DELETE FROM ThoiKhoaBieuGiangVien 
    WHERE maGV = NEW.maGV AND maLopHP = NEW.maLopHP;
    
    -- Thêm thời khóa biểu mới
    INSERT INTO ThoiKhoaBieuGiangVien (
        maTKB, maGV, maLopHP, ngayHoc, tietBD, tietKT, phongHoc, loaiBuoi
    )
    SELECT 
        CONCAT(NEW.maGV, '_', tkb.maLopHP, '_', DATE_FORMAT(tkb.ngayHoc, '%Y%m%d'), '_',
               SUBSTRING(REPLACE(tkb.tietBD, ':', ''), 1, 2)),
        NEW.maGV,
        tkb.maLopHP,
        tkb.ngayHoc,
        tkb.tietBD,
        tkb.tietKT,
        tkb.phongHoc,
        tkb.loaiBuoi
    FROM ThoiKhoaBieuLopHocPhan tkb
    WHERE tkb.maLopHP = NEW.maLopHP;
END //

-- Trigger 5: Khi xóa PhanCongGiangVien
CREATE TRIGGER trg_delete_tkb_giang_vien
BEFORE DELETE ON PhanCongGiangVien
FOR EACH ROW
BEGIN
    -- Xóa thời khóa biểu của giảng viên cho lớp này
    DELETE FROM ThoiKhoaBieuGiangVien 
    WHERE maGV = OLD.maGV AND maLopHP = OLD.maLopHP;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE sp_dong_bo_du_lieu_giang_vien()
BEGIN
    -- 1. Xóa dữ liệu không hợp lệ
    DELETE FROM PhanCongGiangVien 
    WHERE maLopHP NOT IN (SELECT maLopHP FROM LopHocPhan);
    
    DELETE FROM ThoiKhoaBieuGiangVien 
    WHERE maLopHP NOT IN (SELECT maLopHP FROM LopHocPhan)
    OR maGV NOT IN (SELECT maGV FROM PhanCongGiangVien);
    
    -- 2. Cập nhật PhanCongGiangVien từ LopHocPhan
    INSERT INTO PhanCongGiangVien (maPhanCong, maGV, maLopHP, ngayPhanCong)
    SELECT 
        CONCAT('PC', lhp.maLopHP, '_', lhp.maGV),
        lhp.maGV,
        lhp.maLopHP,
        CURDATE()
    FROM LopHocPhan lhp
    WHERE lhp.maGV IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 
        FROM PhanCongGiangVien pcgv 
        WHERE pcgv.maLopHP = lhp.maLopHP
    );
    
    -- 3. Cập nhật ThoiKhoaBieuGiangVien
    INSERT INTO ThoiKhoaBieuGiangVien (
        maTKB, maGV, maLopHP, ngayHoc, tietBD, tietKT, phongHoc, loaiBuoi
    )
    SELECT 
        CONCAT(pcgv.maGV, '_', tkb.maLopHP, '_', DATE_FORMAT(tkb.ngayHoc, '%Y%m%d'), '_',
               SUBSTRING(REPLACE(tkb.tietBD, ':', ''), 1, 2)),
        pcgv.maGV,
        tkb.maLopHP,
        tkb.ngayHoc,
        tkb.tietBD,
        tkb.tietKT,
        tkb.phongHoc,
        tkb.loaiBuoi
    FROM PhanCongGiangVien pcgv
    JOIN ThoiKhoaBieuLopHocPhan tkb ON pcgv.maLopHP = tkb.maLopHP
    WHERE NOT EXISTS (
        SELECT 1 
        FROM ThoiKhoaBieuGiangVien tkbgv 
        WHERE tkbgv.maGV = pcgv.maGV 
        AND tkbgv.maLopHP = tkb.maLopHP
    );
    
    -- Thông báo kết quả
    SELECT 
        'Đã đồng bộ dữ liệu giảng viên' AS 'Thông báo',
        (SELECT COUNT(*) FROM PhanCongGiangVien) AS 'Số phân công',
        (SELECT COUNT(*) FROM ThoiKhoaBieuGiangVien) AS 'Số buổi học';
END //

DELIMITER ;

SET SQL_SAFE_UPDATES = 0;
CALL sp_dong_bo_du_lieu_giang_vien();


