const candidateData = {
    personal: {
        fullName: 'Nguyễn Văn A',
        dateOfBirth: '07/01/2008',
        gender: 'Nam',
        cccd: '0123456789',
        idIssueDate: '01/02/2020',
        idIssuePlace: 'TP Hồ Chí Minh',
        placeOfBirth: 'TP Hồ Chí Minh',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        phone: '0134567258',
        graduationYear: '2025',
        highSchoolName: 'THPT Bùi Hữu Nghĩa',
        email: 'nguyenvana23@gmail.com',
        area: 'Khu vực 1',
        priority: 'Đối tượng ưu tiên 01',
    },
    application: {
        applicationId: '123456789',
        submissionDate: '12/02/2025',
        status: 'Đã được duyệt',
        admissionMethod:
            'Xét ưu tiên / Tuyển thẳng theo quy định của Điều 8 Bộ GD&ĐT',
        progress: 50,
    },
    recruitment: {
        recruitmentProgram: 'Khối xác tuyển sinh Khối xác 1',
        major: 'Công nghệ thông tin',
    },
    homeAddress: {
        province: 'TP Hồ Chí Minh',
        district: 'Phường/Xã Huyền Nhà Bè',
        address: 'Số nhà/ Tên đường 123 Quảng Trung, Phường 1T',
    },
    guardianAddress: {
        province: 'TP Hồ Chí Minh',
        district: 'Phường/Xã Huyền Nhà Bè',
        address: 'Số nhà/ Tên đường 123 Quảng Trung, Phường 1T',
    },
    languageCertificate: {
        name: 'IELTS Academic',
        score: 6.5,
        examDate: '12/02/2025',
        conversionPoints: 10,
        certificate: 'IDP Education',
        file: 'minhChung.pdf',
    },
    admissionInfo: {
        method: 'Phương thức xét tuyển',
        detail: 'Xét ưu tiên/Tuyển thẳng theo quy định của Điều 8 Bộ GD&ĐT',
    },
    guardian: {
        name: 'Trần Thị B',
        phone: '0123456789',
    },
    academics: {
        class10: { conduct: 'Hạnh kiểm', score: '—' },
        class11: { conduct: 'Hạnh kiểm', score: 'Giỏi' },
        class12: { conduct: 'Hạnh kiểm', score: 'Tốt' },
    },
    timeline: [
        {
            step: 'Đăng ký',
            date: '20/05/2025',
            description: 'Thông tin được lưu trên hệ thống',
            status: 'completed',
        },
        {
            step: 'Duyệt hồ sơ',
            date: '22/05/2025',
            description: 'Ban tuyển sinh đã xác nhận hồ sơ bạn',
            status: 'completed',
        },
        {
            step: 'Xét tuyển',
            date: null,
            description: 'Hồ sơ đang trong quá trình đánh giá chuyên môn',
            status: 'processing',
        },
        {
            step: 'Kết quả',
            date: null,
            description:
                'Thông báo thời gian trúng tuyển chính thức sẽ được gửi tại đây',
            status: 'pending',
        },
    ],
};

$(document).ready(function () {
    initializeInterface();
    initializeTabSwitching();
    initializePasswordForm();
    initializeFileUpload();
    initializeDetailButton();
});

function initializeInterface() {
    updateCandidateHeader();
    updateTimeline();
    drawCircularProgress('#progressCircle', candidateData.application.progress);
}

function updateCandidateHeader() {
    const data = candidateData;
    const app = data.application;

    $('.name').text(data.personal.fullName);

    const statusClass =
        app.status === 'Đã được duyệt' ? 'bg-success' : 'bg-warning';
    $('.check-status').attr('class', `check-status ${statusClass}`);
    $('.status').text(app.status.toUpperCase());

    $('.time-submit p:first-child').text(`Mã hồ sơ: ${app.applicationId}`);
    $('.time-submit p:last-child').text(`Ngày nộp: ${app.submissionDate}`);
}

/**
 * timeline tiến độ
 */
function updateTimeline() {
    const timeline = candidateData.timeline;
    const $timelineList = $('.timeline');

    $timelineList.find('li').remove();

    // timeline mới
    timeline.forEach(function (item) {
        let liClass = 'mb-3';
        if (item.status === 'completed') {
            liClass += ' active';
        } else if (item.status === 'processing') {
            liClass += ' processing';
        }

        const dateHtml = item.date ? item.date + '<br>' : 'Chờ cập nhật<br>';

        const timelineItem = `
            <li class="${liClass}">
                <span class="timeline-dot"></span>
                <strong>${item.step}</strong>
                <small>${dateHtml}${item.description}</small>
            </li>
        `;

        $timelineList.append(timelineItem);
    });
}

//  Cập nhật dữ liệu hồ sơ

function updateCandidateData(newData) {
    // dữ liệu mới
    $.extend(true, candidateData, newData);

    // Cập nhật giao diện
    initializeInterface();
}
// Lấy dữ liệu hồ sơ hiện tại

function getCandidateData() {
    return candidateData;
}

// vẽ biểu đồ tròn

function drawCircularProgress(selector, percentage) {
    const container = $(selector);
    if (!container.length) return;

    const size = 100;
    const radius = 35;
    const circumference = 2 * Math.PI * radius;

    const greenPercent = percentage;
    const remainingPercent = 100 - percentage;
    const yellowPercent = remainingPercent * 0.6;
    const grayPercent = remainingPercent * 0.4;

    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg)">
            <!-- Background circle -->
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                fill="none" 
                stroke="#e9ecef" 
                stroke-width="4">
            </circle>
            
            <!-- Green circle (Đã hoàn thành) -->
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                fill="none" 
                stroke="#20c997" 
                stroke-width="4"
                stroke-dasharray="${(greenPercent / 100) * circumference} ${circumference}"
                stroke-dashoffset="0"
                stroke-linecap="round">
            </circle>
            
            <!-- Yellow circle (Đang xử lý) -->
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                fill="none" 
                stroke="#ffc107" 
                stroke-width="4"
                stroke-dasharray="${(yellowPercent / 100) * circumference} ${circumference}"
                stroke-dashoffset="${-((greenPercent / 100) * circumference)}"
                stroke-linecap="round">
            </circle>
            
            <!-- Gray circle (Chưa xử lý) -->
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" 
                fill="none" 
                stroke="#adb5bd" 
                stroke-width="4"
                stroke-dasharray="${(grayPercent / 100) * circumference} ${circumference}"
                stroke-dashoffset="${-(((greenPercent + yellowPercent) / 100) * circumference)}"
                stroke-linecap="round">
            </circle>
        </svg>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
            <div style="font-size: 15px; font-weight: bold; color: #495057;">${Math.round(percentage)}%</div>
        </div>
    `;

    container.html(svg);

    if (!container.css('position') || container.css('position') === 'static') {
        container.css('position', 'relative');
    }
}

function updateCircularProgress(selector, percentage) {
    drawCircularProgress(selector, Math.min(100, Math.max(0, percentage)));
}

// tab

function initializeTabSwitching() {
    const tabItems = $('.tab-item');
    const tabPanes = $('.tab-pane');
    const headerTitle = $('#tabHeaderTitle');

    const tabTitles = [
        'THÔNG TIN THÍ SINH ĐĂNG KÝ',
        'KHUNG HỒ SỐ TRỰC TUYẾN',
        'ĐỔI MẬT KHẨU',
        'TRA CỨU KẾT QUẢ',
        'CHI TIẾT HỒ SƠ ĐĂNG KÝ',
    ];

    tabItems.on('click', function () {
        const index = $(this).index();

        tabItems.removeClass('active');

        $(this).addClass('active');

        tabPanes.removeClass('active');

        tabPanes.eq(index).addClass('active');

        if (headerTitle.length > 0 && tabTitles[index]) {
            headerTitle.text(tabTitles[index]);
        }
    });
}

// Initialize detail button
function initializeDetailButton() {
    $('.btn-detail-record').on('click', function () {

        $('.tab-pane').removeClass('active');

        $('#chiTietHoSoTab').addClass('active');

        loadDetailTabData();

        $('#tabHeaderTitle').text('CHI TIẾT HỒ SƠ ĐĂNG KÝ');

        $('.tab-item').removeClass('active');

        // Scroll lên đầu trang
        $('html, body').animate({ scrollTop: 0 }, 300);
    });
}

// Load dữ liệu vào tab chi tiết
function loadDetailTabData() {
    const data = candidateData;
    const $container = $('#chiTietHoSoContent');

    $container.empty();

    const $panel = buildDetailPanel(data);
    $container.append($panel);
}

function buildDetailPanel(data) {
    let sectionNum = 1;

    const html = `
    <div class="chi-tiet-content">

        ${buildSection(
        sectionNum++,
        '. Thông tin thí sinh',
        [
            { label: 'Họ và tên', value: data.personal.fullName },
            { label: 'Ngày sinh', value: data.personal.dateOfBirth },
            { label: 'Giới tính', value: data.personal.gender },
            { label: 'Số CMND/CCCD', value: data.personal.cccd },
            { label: 'Ngày cấp', value: data.personal.idIssueDate },
            { label: 'Nơi cấp', value: data.personal.idIssuePlace },
            { label: 'Số điện thoại', value: data.personal.phone },
            { label: 'Email', value: data.personal.email },
            { label: 'Dân tộc', value: data.personal.ethnicity },
            {
                label: 'Năm tốt nghiệp',
                value: data.personal.graduationYear,
            },
            {
                label: 'Tên trường THPT lớp 12',
                value: data.personal.highSchoolName,
            },
            {
                label: 'Đối tượng ưu tiên tuyển sinh',
                value: data.personal.area,
            },
            { label: 'Khu vực tuyển sinh', value: data.personal.priority },
        ],
        'chi-tiet-grid-6col',
        `
            <div class="chi-tiet-sub-box">
                <div class="chi-tiet-sub-title">Hộ khẩu thường trú</div>
                <div class="chi-tiet-grid-3col">
                    ${buildItem('Thành phố/ Tỉnh', data.homeAddress.province)}
                    ${buildItem('Phường/ Xã', data.homeAddress.district)}
                    ${buildItem('Số nhà/ Tên đường', data.homeAddress.address)}
                </div>
            </div>

            <div class="chi-tiet-sub-box">
                <div class="chi-tiet-sub-title">Địa chỉ liên hệ hiện tại</div>
                <div class="chi-tiet-grid-3col">
                    ${buildItem('Thành phố/ Tỉnh', data.guardianAddress.province)}
                    ${buildItem('Phường/ Xã', data.guardianAddress.district)}
                    ${buildItem('Số nhà/ Tên đường', data.guardianAddress.address)}
                </div>
            </div>
            `,
    )}

        <!-- Chứng chỉ -->
        <div class="chi-tiet-section">
            <div class="chi-tiet-section-header">
                <span class="chi-tiet-section-number">${sectionNum++}</span>
                <span class="chi-tiet-section-title">. Chứng chỉ ngoại ngữ</span>
            </div>
            <div class="chi-tiet-section-content">
                <div class="chi-tiet-certificate-box">
                    <div class="chi-tiet-certificate-box-sub">
                        <div style="display: flex; align-items: center; gap: 15px;">
                           <div class="icon-record"><i class="fa fa-certificate"></i></div>
                            <div>
                                <p style="margin: 0; font-weight: 600;">${data.languageCertificate.name}</p>
                                <p style="margin: 0; font-weight: 500; font-size: 13px; color: #666;">Điểm thi: ${data.languageCertificate.score} | Ngày thi: ${data.languageCertificate.examDate}</p>
                            </div>
                        </div>
                        <div class="chi-tiet-certificate-box-center">
                            <p >Điểm quy đổi: ${data.languageCertificate.conversionPoints}</p>
                            <p >Đơn vị cấp: ${data.languageCertificate.certificate}</p>
                        </div>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #666;">Đã đính kèm tệp: ${data.languageCertificate.file}</p>
                </div>
            </div>
        </div>

        <!-- Thông tin xét tuyển -->
        <div class="chi-tiet-section">
            <div class="chi-tiet-section-header">
                <span class="chi-tiet-section-number">${sectionNum++}</span>
                <span class="chi-tiet-section-title">. Thông tin xét tuyển</span>
            </div>
            <div class="chi-tiet-section-content">
                <div class="chi-tiet-info-box">
                    <div class="icon-record"><i class="fa fa-book"></i></div>
                    <div class="chi-tiet-info-content">
                        <p class="chi-tiet-info-label">PHƯƠNG THỨC XÉT TUYỂN</p>
                        <p class="chi-tiet-info-value">${data.admissionInfo.detail}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Thông tin người tư vấn -->
        <div class="chi-tiet-section">
            <div class="chi-tiet-section-header">
                <span class="chi-tiet-section-number">${sectionNum++}</span>
                <span class="chi-tiet-section-title">. Thông tin người giới thiệu/ tư vấn</span>
            </div>
            <div class="chi-tiet-section-content">
                <div class="chi-tiet-info-box">
                    <div class="icon-record"><i class="fa fa-user"></i></div>
                    <div class="chi-tiet-info-content">
                        <p class="chi-tiet-info-value" style="font-weight: 600;">${data.guardian.name}</p>
                        <p class="chi-tiet-info-value">Số điện thoại: ${data.guardian.phone}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="chi-tiet-footer">
            <button type="button" class="btn-back-detail">
            <i class="fa fa-arrow-left"></i>
                Quay lại
            </button>
        </div>

    </div>
    `;

    const $panel = $(html);

    $panel.find('.btn-back-detail').on('click', function () {
        $('.tab-pane').removeClass('active');
        $('#hoSoThiSinh').addClass('active');
        $('.tab-item').removeClass('active');
        $('.tab-item').first().addClass('active');
        $('#tabHeaderTitle').text('THÔNG TIN THÍ SINH ĐĂNG KÝ');
        $('html, body').animate({ scrollTop: 0 }, 300);
    });

    return $panel;
}

// Helper function to build section
function buildSection(number, title, fields, gridClass = '', extraHtml = '') {
    let html = `
        <div class="chi-tiet-section">
            <div class="chi-tiet-section-header">
                <span class="chi-tiet-section-number">${number}</span>
                <span class="chi-tiet-section-title">${title}</span>
            </div>
            <div class="chi-tiet-section-content">
                <div class="chi-tiet-review-grid ${gridClass}">
    `;

    fields.forEach((field) => {
        if (field.inline) {
            // Hiển thị inline (label và value trên 1 dòng)
            html += `
                    <div class="chi-tiet-review-item chi-tiet-review-item-inline">
                        <span class="chi-tiet-review-label">${field.label}:</span>
                        <span class="chi-tiet-review-value">${field.value || '—'}</span>
                    </div>
            `;
        } else {
            // Hiển thị bình thường (label trên, value dưới)
            html += `
                    <div class="chi-tiet-review-item">
                        <div class="chi-tiet-review-label">${field.label}</div>
                        <div class="chi-tiet-review-value">${field.value || '—'}</div>
                    </div>
            `;
        }
    });

    html += `
                </div>
                ${extraHtml}
            </div>
        </div>
    `;

    return html;
}

// Helper function to build item for grid
function buildItem(label, value) {
    return `
        <div class="chi-tiet-review-item">
            <div class="chi-tiet-review-label">${label}</div>
            <div class="chi-tiet-review-value">${value || '—'}</div>
        </div>
    `;
}
function initializePasswordForm() {
    const form = $('#changePasswordForm');
    const passwordToggles = $('.password-toggle');

    passwordToggles.on('click', function () {
        const wrapper = $(this).closest('.password-input-wrapper');
        const input = wrapper.find('.password-input');
        const toggle = $(this);

        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            toggle.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.attr('type', 'password');
            toggle.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Form submission
    form.on('submit', function (e) {
        e.preventDefault();

        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        form.find('.form-group').removeClass('error');
        form.find('.error-message').hide();

        let hasError = false;

        if (!currentPassword) {
            showPasswordError(
                $('#currentPassword'),
                'Vui lòng nhập mật khẩu cũ',
            );
            hasError = true;
        }

        if (!newPassword) {
            showPasswordError($('#newPassword'), 'Vui lòng nhập mật khẩu mới');
            hasError = true;
        } else if (newPassword.length < 6) {
            showPasswordError(
                $('#newPassword'),
                'Mật khẩu phải có ít nhất 6 ký tự',
            );
            hasError = true;
        }

        if (!confirmPassword) {
            showPasswordError(
                $('#confirmPassword'),
                'Vui lòng xác nhận mật khẩu',
            );
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            showPasswordError(
                $('#confirmPassword'),
                'Mật khẩu xác nhận không khớp',
            );
            hasError = true;
        }

        if (hasError) return;

        console.log('Form submitted:', {
            currentPassword,
            newPassword,
        });

        alert('Cập nhật mật khẩu thành công!');

        form[0].reset();
        form.find('.fa-eye-slash')
            .removeClass('fa-eye-slash')
            .addClass('fa-eye');
        form.find('.password-input').attr('type', 'password');
    });

    form.find('.password-input').on('blur', function () {
        const value = $(this).val();
        const parent = $(this).closest('.form-group');

        if (!value) {
            parent.addClass('error');
        } else {
            parent.removeClass('error');
        }
    });
}

function showPasswordError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    formGroup.addClass('error');

    if (!formGroup.find('.error-message').length) {
        formGroup.append(`<div class="error-message">${message}</div>`);
    } else {
        formGroup.find('.error-message').text(message);
    }

    formGroup.find('.error-message').show();
}

// file upload
function initializeFileUpload() {
    const fileInput = $('#hiddenFileInput');
    const uploadButtons = $('.btn-upload, .btn-upload-outline, .btn-change');

    uploadButtons.on('click', function (e) {
        e.preventDefault();

        uploadButtons.data('selectedButton', false);

        $(this).data('selectedButton', true);

        fileInput.click();
    });

    // chọn file
    fileInput.on('change', function () {
        const file = this.files[0];

        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (file.size > maxSize) {
                alert('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.');

                this.value = '';
                return;
            }

            const clickedButton = uploadButtons.filter(function () {
                return $(this).data('selectedButton');
            });

            if (clickedButton.length > 0) {
                const card = clickedButton.closest('.khung-document-card');
                const fileName = file.name;
                const fileSize = (file.size / (1024 * 1024)).toFixed(2) + 'MB';

                const fileIcon = getFileIcon(file.type, fileName);

                let fileDisplay = card.find('.khung-card-file');
                const fileHTML = `
                    <div class="khung-card-file">
                        <i class="fa ${fileIcon}" aria-hidden="true"></i>
                        <div class="file-info">
                            <p>${fileName}</p>
                            <span>${fileSize}</span>
                        </div>
                    </div>
                `;

                if (fileDisplay.length > 0) {
                    fileDisplay.replaceWith(fileHTML);
                } else {
                    const cardUpload = card.find('.khung-card-upload');
                    if (cardUpload.length > 0) {
                        cardUpload.replaceWith(fileHTML);
                    }
                }

                // trạng thái button
                clickedButton
                    .removeClass('btn-upload btn-upload-outline btn-change')
                    .addClass('btn-change')
                    .text('Thay đổi hồ sơ');

                // "ĐÃ NỘP"
                const cardHeader = card.find('.khung-card-header');
                cardHeader
                    .removeClass('required optional')
                    .addClass('approved')
                    .text('ĐÃ NỘP');

                console.log('File selected:', {
                    name: fileName,
                    size: fileSize,
                    type: file.type,
                });
            }

            this.value = '';
            uploadButtons.data('selectedButton', false);
        }
    });
}

// icon file theo loại file
function getFileIcon(fileType, fileName) {
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        return 'fa-file-pdf-o';
    } else if (
        fileType.includes('word') ||
        fileType.includes('document') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx')
    ) {
        return 'fa-file-word-o';
    } else if (
        fileType.includes('sheet') ||
        fileType.includes('excel') ||
        fileName.endsWith('.xls') ||
        fileName.endsWith('.xlsx')
    ) {
        return 'fa-file-excel-o';
    } else if (
        fileType.includes('image') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.png')
    ) {
        return 'fa-file-image-o';
    } else {
        return 'fa-file-o';
    }
}
