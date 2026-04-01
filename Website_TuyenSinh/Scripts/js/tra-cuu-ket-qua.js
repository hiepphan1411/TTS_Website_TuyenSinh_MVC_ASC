$(function () {
    // Dữ liệu test
    const testData = {
        123456789: {
            hoVaTen: 'Nguyễn Văn A',
            ngaySinh: '01/01/2004',
            gioiTinh: 'Nam',
            soCCCD: '0123456789',
            soDienThoai: '0987654321',
            soHoSo: '123456789',
            trangThai: 'Trúng tuyển',
            nganh: 'Công nghệ thông tin',
            loaiDaoTao: 'Đại học chính quy',
            diemXetTuyen: 29.5,
            xepLoai: 'Xuất sắc',
            daHocDangKy: false,
        },
        987654321: {
            hoVaTen: 'Trần Thị B',
            ngaySinh: '15/03/2005',
            gioiTinh: 'Nữ',
            soCCCD: '0986654321',
            soDienThoai: '0912345678',
            soHoSo: '987654321',
            trangThai: 'Không trúng tuyển',
            nganh: 'Kinh tế',
            loaiDaoTao: 'Đại học chính quy',
            diemXetTuyen: 18.5,
            xepLoai: 'Không đủ tiêu chuẩn',
            daHocDangKy: false,
        },
    };

    // Hàm tìm kiếm theo CCCD, SĐT, hoặc mã hồ sơ
    function searchStudent(keyword) {
        for (let key in testData) {
            const student = testData[key];
            if (
                student.soHoSo === keyword ||
                student.soCCCD === keyword ||
                student.soDienThoai === keyword
            ) {
                return student;
            }
        }
        return null;
    }

    // Xử lý submit form tra cứu
    $('#frmTraCuu').on('submit', function (e) {
        e.preventDefault();

        var keyword = $('#maHoSo').val().trim();

        // Kiểm tra input
        if (!keyword) {
            showAlert('Vui lòng nhập mã hồ sơ, số CCCD hoặc SĐT', 'warning');
            return;
        }

        // Tìm dữ liệu test
        var result = searchStudent(keyword);

        if (!result) {
            showAlert(
                'Không tìm thấy thông tin. Vui lòng kiểm tra lại mã hồ sơ hoặc số CCCD / SĐT',
                'error',
            );
            $('#resultContainer').html('');
            return;
        }

        // Hiển thị kết quả
        displayResult(result);
        $('#resultContainer').slideDown();
        $('html, body').animate(
            { scrollTop: $('#resultContainer').offset().top - 100 },
            500,
        );
    });

    function displayResult(data) {
        var isSuccess = data.trangThai === 'Trúng tuyển';

        var html = `
            <div class="result-container">
                <div class="row g-4">
                    <div class="col-lg-4">
                        <div class="result-info-card">
                            <div class="info-row">
                              <div class="info-row-sub">
                                  <span class="info-label">MÃ HỒ SƠ</span>
                                  <span class="info-value">${data.soHoSo}</span>
                              </div>
                              <div class="info-row-sub">
                                  <span class="info-label">NGÀY SINH</span>
                                  <span class="info-value">${data.ngaySinh}</span>
                              </div>
                            </div>
                            <div class="info-row">
                              <div class="info-row-sub">
                                  <span class="info-label">HỌ TÊN</span>
                                  <span class="info-value">${escapeHtml(data.hoVaTen)}</span>
                              </div>
                              <div class="info-row-sub">
                                  <span class="info-label">CMND</span>
                                  <span class="info-value">${data.soCCCD}</span>
                              </div>
                            </div>
                            <div class="info-row">
                              <div class="info-row-sub">
                                  <span class="info-label">LIÊN KẾT</span>
                                  <span class="info-value" style="color: #007bff; text-decoration: underline; cursor: pointer;">Nhập học</span>
                              </div>
                            </div>

                            ${isSuccess
                ? `
                            <div class="success-badge">
                                <i class="fas fa-check-circle"></i>
                                <div class="badge-text">
                                    <div class="badge-title">CHÚC MỪNG!</div>
                                    <div class="badge-subtitle">BẠN ĐÃ TRÚNG TUYỂN</div>
                                </div>
                            </div>
                            `
                : `
                            <div class="error-badge">
                                <i class="fas fa-times-circle"></i>
                                <div class="badge-text">
                                    <div class="badge-title">THÔNG BÁO</div>
                                    <div class="badge-subtitle">KHÔNG TRÚNG TUYỂN</div>
                                </div>
                            </div>
                            `
            }
                        </div>
                    </div>

                    <!-- Thông tin trúng tuyển -->
                    <div class="col-lg-8">
                        <div class="result-admission-card">
                            <!-- Header với nút -->
                            <div class="card-header">
                                <h3 class="card-title">Thông tin trúng tuyển</h3>
                                ${isSuccess
                ? `
                                <a href="javascript:void(0)" class="btn btn-success btn-sm">
                                    <i class="fa fa-graduation-cap"></i> ĐỢT XẾT TUYỂN 2026-DHCQ
                                </a>
                                `
                : ''
            }
                            </div>

                            <!-- Content -->
                            <div class="card-content">
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">MÃ TUYỂN SINH</span>
                                        <span class="value">${data.soHoSo}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">TÊN NGÀNH</span>
                                        <span class="value">${escapeHtml(data.nganh)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">HỆ ĐÀO TẠO</span>
                                        <span class="value">${data.loaiDaoTao}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">ĐỢT XẾT TUYỂN</span>
                                        <span class="value">${data.xepLoai}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">LOẠI HÌNH ĐÀO TẠO</span>
                                        <span class="value">${data.gioiTinh}</span>
                                    </div>
                                </div>

                                <!-- Actions -->
                                ${isSuccess
                ? `
                                <div class="card-actions">
                                    <button type="button" class="btn btn-primary btn-lg">
                                        <i class="fa fa-paper-plane" aria-hidden="true"></i> NHẬP HỌC NGAY
                                    </button>
                                    <button type="button" class="btn btn-outline-primary btn-lg">
                                        <i class="fa fa-print"></i> In giấy báo trúng tuyển
                                    </button>
                                </div>
                                `
                : ''
            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#resultContainer').html(html);
    }

    function showAlert(message, type) {
        var alertClass = type === 'error' ? 'alert-danger' : 'alert-warning';
        var icon =
            type === 'error'
                ? 'bi-exclamation-circle'
                : 'bi-exclamation-triangle';

        var alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi ${icon}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        $('#resultContainer').html(alertHtml);
        $('#resultContainer').slideDown();
    }

    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

    // Reset form
    $('#btnReset').on('click', function () {
        $('#frmTraCuu')[0].reset();
        $('#resultContainer').slideUp();
    });
});
