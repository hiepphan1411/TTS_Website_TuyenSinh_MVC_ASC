const candidateData = {
    personal: {
        fullName: 'Nguyễn Văn A',
        dateOfBirth: '15/03/2007',
        gender: 'Nam',
        cccd: '0123147258369',
        placeOfBirth: 'An Giang',
        nationality: 'Việt Nam',
        ethnicity: 'Kinh',
        phone: '0123456789',
        email: '123.student@123.edu.vn',
    },
    application: {
        applicationId: '123456789',
        submissionDate: '15/06/2025',
        status: 'Đã được duyệt',
        admissionMethod:
            'Xét ưu tiên / Tuyển thẳng theo quy định của Điều 8 Bộ GD&ĐT',
        progress: 50,
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

// Initialize password change form
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
