var daThuGonLoc = true;          
var duLieuDashboard = null;    

$(document).ready(function () {
    taiDuLieuMau();
    khoiTaoTabSuKien();
});

function taiDuLieuMau() {
    $.getJSON('~/Content/dashboard-data-test.json', function (data) {
        duLieuDashboard = data;
        khoiTaoDashboard(data);
    }).fail(function () {
        duLieuDashboard = getDuLieuNhung();
        khoiTaoDashboard(duLieuDashboard);
    });
}

function getDuLieuNhung() {
    return {
        kpi: {
            soLuongHoSo: "245 / 500",
            hoSoTrungTuyen: 156,
            hoSoNhapHoc: 120,
            tyLeNhapHoc: "76.9%",
            tangHoSoHomNay: "+12 hôm nay",
            tangTrungTuyenHomNay: "+5 hôm nay · 79% đủ ĐK",
            tangNhapHocHomNay: "+3 hôm nay · Đạt 65% chỉ tiêu",
            tangTyLe: "+2.3% so với đợt trước"
        },
        hoSoTheoNgay: [
            { ngay: "1/3", soLuong: 10 }, { ngay: "2/3", soLuong: 22 },
            { ngay: "3/3", soLuong: 14 }, { ngay: "4/3", soLuong: 18 },
            { ngay: "5/3", soLuong: 22 }, { ngay: "6/3", soLuong: 10 },
            { ngay: "7/3", soLuong: 8  }, { ngay: "8/3", soLuong: 15 },
            { ngay: "9/3", soLuong: 17 }, { ngay: "10/3", soLuong: 8 },
            { ngay: "11/3", soLuong: 22 }, { ngay: "12/3", soLuong: 16 },
            { ngay: "13/3", soLuong: 17 }, { ngay: "14/3", soLuong: 9 },
            { ngay: "15/3", soLuong: 20 }, { ngay: "16/3", soLuong: 21 },
            { ngay: "17/3", soLuong: 17 }, { ngay: "18/3", soLuong: 13 },
            { ngay: "19/3", soLuong: 20 }, { ngay: "20/3", soLuong: 14 },
            { ngay: "21/3", soLuong: 10 }, { ngay: "22/3", soLuong: 12 },
            { ngay: "23/3", soLuong: 9  }, { ngay: "24/3", soLuong: 15 },
            { ngay: "25/3", soLuong: 18 }, { ngay: "26/3", soLuong: 24 },
            { ngay: "27/3", soLuong: 16 }, { ngay: "28/3", soLuong: 8  },
            { ngay: "29/3", soLuong: 7  }, { ngay: "30/3", soLuong: 6  }
        ],
        soSanhNganh: [
            { nganh: "CNTT",      chiTieu: 180, nhapHoc: 60 },
            { nganh: "Luật",      chiTieu: 120, nhapHoc: 45 },
            { nganh: "Kinh tế",   chiTieu: 150, nhapHoc: 88 },
            { nganh: "Kế toán",   chiTieu: 100, nhapHoc: 82 },
            { nganh: "Marketing", chiTieu: 100, nhapHoc: 25 },
            { nganh: "NN Anh",    chiTieu: 60,  nhapHoc: 52 }
        ],
        phanBoTinh: [
            { tinh: "TP.HCM",     soLuong: 85 },
            { tinh: "Hà Nội",     soLuong: 38 },
            { tinh: "Đà Nẵng",    soLuong: 28 },
            { tinh: "Cần Thơ",    soLuong: 20 },
            { tinh: "Hải Phòng",  soLuong: 14 },
            { tinh: "Bình Dương", soLuong: 12 },
            { tinh: "Đồng Nai",   soLuong: 11 },
            { tinh: "Tây Ninh",   soLuong: 18 }
        ],
        funnelTuyenSinh: [
            { buoc: "Đăng ký",    soLuong: 500 },
            { buoc: "Đủ ĐK",      soLuong: 380 },
            { buoc: "Trúng tuyển",soLuong: 156 },
            { buoc: "Nhập học",   soLuong: 120 }
        ],
        trangThaiHoSo: [
            { trangThai: "Chờ duyệt", soLuong: 35, mauSac: "#ffc107" },
            { trangThai: "Thiếu HS",  soLuong: 18, mauSac: "#dc3545" },
            { trangThai: "Đã duyệt",  soLuong: 88, mauSac: "#28a745" },
            { trangThai: "Từ chối",   soLuong: 14, mauSac: "#6c757d" }
        ],
        soLuongHoSoTheoLoai: [
            { loai: "Hồ sơ",       soLuong: 20   },
            { loai: "Trúng tuyển", soLuong: 4506 },
            { loai: "Nhập học",    soLuong: 1179 },
            { loai: "Nguyện vọng", soLuong: 29   }
        ],
        trangThaiDangKyOnline: [
            { trangThai: "Chờ duyệt",          soLuong: 7 },
            { trangThai: "Duyệt",              soLuong: 4 },
            { trangThai: "Chờ bổ sung hồ sơ",  soLuong: 1 },
            { trangThai: "Dự kiến trúng tuyển", soLuong: 1 }
        ],
        nganhDangTuyenSinh: [
            { nganh: "Công nghệ thông tin", chiTieu: 180, dangKy: 85,  trungTuyen: 72, nhapHoc: 60, pctDat: 33 },
            { nganh: "Luật",                chiTieu: 120, dangKy: 95,  trungTuyen: 52, nhapHoc: 45, pctDat: 38 },
            { nganh: "Kế toán",             chiTieu: 150, dangKy: 128, trungTuyen: 96, nhapHoc: 88, pctDat: 59 },
            { nganh: "Marketing",           chiTieu: 100, dangKy: 112, trungTuyen: 85, nhapHoc: 82, pctDat: 82 },
            { nganh: "Ngôn ngữ Anh",        chiTieu: 100, dangKy: 68,  trungTuyen: 55, nhapHoc: 52, pctDat: 87 }
        ]
    };
}

function khoiTaoDashboard(data) {
    capNhatKPI(data.kpi);
    buildChartHoSoTheoNgay(data.hoSoTheoNgay);
    buildChartSoSanhNganh(data.soSanhNganh);
    buildChartPhanBoTinh(data.phanBoTinh);
    buildChartFunnelTuyenSinh(data.funnelTuyenSinh);
    buildChartTrangThaiHoSo(data.trangThaiHoSo);
    renderBangSoLuongHoSo(data.soLuongHoSoTheoLoai);
    renderBangTrangThaiOnline(data.trangThaiDangKyOnline);
    renderBangNganhTuyenSinh(data.nganhDangTuyenSinh);
}

function capNhatKPI(kpi) {
    $('#kpiHoSo').text(kpi.soLuongHoSo);
    $('#kpiTrungTuyen').text(kpi.hoSoTrungTuyen);
    $('#kpiNhapHoc').text(kpi.hoSoNhapHoc);
    $('#kpiTyLeNhapHoc').text(kpi.tyLeNhapHoc);
    $('#kpiHoSoTrend').html('<i class="bi bi-arrow-up-short"></i> ' + kpi.tangHoSoHomNay);
    $('#kpiTrungTuyenTrend').html('<i class="bi bi-arrow-up-short"></i> ' + kpi.tangTrungTuyenHomNay);
    $('#kpiNhapHocTrend').html('<i class="bi bi-arrow-up-short"></i> ' + kpi.tangNhapHocHomNay);
    $('#kpiTyLeTrend').html('<i class="bi bi-arrow-up-short"></i> ' + kpi.tangTyLe);
}

function buildChartHoSoTheoNgay(duLieu) {
    var danhSachNgay    = $.map(duLieu, function (d) { return d.ngay; });
    var danhSachSoLuong = $.map(duLieu, function (d) { return d.soLuong; });

    $('#chartHoSoTheoNgay').kendoChart({
        theme: 'default',
        legend: { visible: false },
        chartArea: { background: 'transparent', margin: { top: 5, bottom: 0 } },
        seriesDefaults: { type: 'area', style: 'smooth' },
        series: [{
            name: 'Hồ sơ',
            data: danhSachSoLuong,
            color: '#3a74f0',
            opacity: 0.18,
            line: { color: '#3a74f0', width: 2.5 },
            markers: { visible: false }
        }],
        categoryAxis: {
            categories: danhSachNgay,
            majorGridLines: { color: '#f0f0f0', width: 1 },
            labels: { font: '11px Segoe UI', color: '#9ba9bd', step: 1 },
            line: { visible: false }
        },
        valueAxis: {
            min: 4,
            max: 26,
            majorUnit: 2,
            majorGridLines: { color: '#f0f0f0', width: 1 },
            labels: { font: '11px Segoe UI', color: '#9ba9bd' },
            line: { visible: false }
        },
        tooltip: {
            visible: true,
            template: '#= category #: <b>#= value #</b> hồ sơ',
            background: '#2a4591',
            color: '#fff',
            font: '12px Segoe UI'
        }
    });
}

function buildChartSoSanhNganh(duLieu) {
    var danhSachNganh   = $.map(duLieu, function (d) { return d.nganh; });
    var danhSachChiTieu = $.map(duLieu, function (d) { return d.chiTieu; });
    var danhSachNhapHoc = $.map(duLieu, function (d) { return d.nhapHoc; });

    $('#chartSoSanhNganh').kendoChart({
        theme: 'default',
        legend: {
            visible: true,
            position: 'top',
            labels: { font: '12px Segoe UI', color: '#505050' }
        },
        chartArea: { background: 'transparent', margin: { top: 0, bottom: 0 } },
        seriesDefaults: { type: 'column', gap: 0.6, spacing: 0.1 },
        series: [
            {
                name: 'Chỉ tiêu',
                data: danhSachChiTieu,
                color: '#c0c0c0',
                opacity: 0.85
            },
            {
                name: 'Nhập học',
                data: danhSachNhapHoc,
                color: '#3a74f0'
            }
        ],
        categoryAxis: {
            categories: danhSachNganh,
            majorGridLines: { visible: false },
            labels: { font: '11.5px Segoe UI', color: '#9ba9bd' },
            line: { visible: false }
        },
        valueAxis: {
            majorGridLines: { color: '#f5f5f5', width: 1 },
            labels: { font: '11px Segoe UI', color: '#9ba9bd' },
            line: { visible: false }
        },
        tooltip: {
            visible: true,
            shared: true,
            sharedTemplate: '<b>#= category #</b><br/>#= points[0].series.name #: #= points[0].value #<br/>#= points[1].series.name #: #= points[1].value #',
            font: '12px Segoe UI'
        }
    });
}

function buildChartPhanBoTinh(duLieu) {
    var danhSachTinh    = $.map(duLieu, function (d) { return d.tinh; });
    var danhSachSoLuong = $.map(duLieu, function (d) { return d.soLuong; });

    $('#chartPhanBoTinh').kendoChart({
        theme: 'default',
        legend: { visible: false },
        chartArea: { background: 'transparent', margin: { top: 0, bottom: 0 } },
        seriesDefaults: { type: 'bar' },
        series: [{
            data: danhSachSoLuong,
            color: '#1ba5a0',
            opacity: 0.9
        }],
        categoryAxis: {
            categories: danhSachTinh,
            majorGridLines: { visible: false },
            labels: { font: '11.5px Segoe UI', color: '#505050' },
            line: { visible: false }
        },
        valueAxis: {
            majorGridLines: { color: '#f5f5f5', width: 1 },
            labels: { font: '11px Segoe UI', color: '#9ba9bd' },
            line: { visible: false }
        },
        tooltip: {
            visible: true,
            template: '#= category #: <b>#= value #</b>',
            font: '12px Segoe UI'
        }
    });
}


function buildChartFunnelTuyenSinh(duLieu) {
    var danhSachBuoc    = $.map(duLieu, function (d) { return d.buoc; });
    var danhSachSoLuong = $.map(duLieu, function (d) { return d.soLuong; });

    $('#chartFunnelTuyenSinh').kendoChart({
        theme: 'default',
        legend: { visible: false },
        chartArea: { background: 'transparent', margin: { top: 0, bottom: 0 } },
        seriesDefaults: { type: 'bar' },
        series: [{
            data: danhSachSoLuong,
            color: '#3a74f0',
            opacity: 0.85
        }],
        categoryAxis: {
            categories: danhSachBuoc,
            majorGridLines: { visible: false },
            labels: { font: '12px Segoe UI', color: '#505050' },
            line: { visible: false }
        },
        valueAxis: {
            majorGridLines: { color: '#f5f5f5', width: 1 },
            labels: { font: '11px Segoe UI', color: '#9ba9bd' },
            line: { visible: false }
        },
        tooltip: {
            visible: true,
            template: '#= category #: <b>#= value #</b>',
            font: '12px Segoe UI'
        }
    });
}

//hàm vẽ funnel mặc định
//function buildChartFunnelTuyenSinh(duLieu) {
//    var dataFunnel = $.map(duLieu, function (d) {
//        return {
//            category: d.buoc,
//            value: d.soLuong
//        };
//    });

//    $('#chartFunnelTuyenSinh').kendoChart({
//        theme: 'default',
//        legend: { visible: false },
//        chartArea: { background: 'transparent', margin: { top: 0, bottom: 0 } },

//        series: [{
//            type: 'funnel',
//            data: dataFunnel,
//            color: '#3a74f0',
//            opacity: 0.85,

//            labels: {
//                visible: true,
//                background: 'transparent',
//                color: '#fff',
//                template: '#= category #: #= value #'
//            },

//            dynamicSlope: false,
//            dynamicHeight: false,
//            segmentSpacing: 1
//        }],

//        tooltip: {
//            visible: true,
//            template: '#= category #: <b>#= value #</b>',
//            font: '12px Segoe UI'
//        }
//    });
//}

function buildChartTrangThaiHoSo(duLieu) {
    var danhSachSeries = $.map(duLieu, function (d) {
        return { category: d.trangThai, value: d.soLuong, color: d.mauSac };
    });

    $('#chartTrangThaiHoSo').kendoChart({
        theme: 'default',
        legend: { visible: false },
        chartArea: { background: 'transparent', margin: 0 },
        seriesDefaults: { type: 'donut' },
        series: [{
            data: danhSachSeries,
            holeSize: 100,
            labels: { visible: false }
        }],
        tooltip: {
            visible: true,
            template: '#= category #: <b>#= value #</b>',
            font: '12px Segoe UI'
        }
    });
}

function renderBangSoLuongHoSo(duLieu) {
    var tbody = $('#tbodySoLuongHoSo');
    tbody.empty();

    $.each(duLieu, function (i, item) {
        var dong = '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + item.loai + '</td>' +
            '<td class="text-end">' + kinhDoangSoLuong(item.soLuong) + '</td>' +
            '</tr>';
        tbody.append(dong);
    });

    $('#paginationHoSoLabel').text('Hiển thị 1-' + duLieu.length + ' của 1');
}

function renderBangTrangThaiOnline(duLieu) {
    var tbody = $('#tbodyTrangThaiOnline');
    tbody.empty();

    $.each(duLieu, function (i, item) {
        var dong = '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + item.trangThai + '</td>' +
            '<td class="text-end">' + kinhDoangSoLuong(item.soLuong) + '</td>' +
            '</tr>';
        tbody.append(dong);
    });

    $('#paginationTrangThaiLabel').text('Hiển thị 1-' + duLieu.length + ' của 1');
}

function renderBangNganhTuyenSinh(duLieu) {
    var tbody = $('#tbodyNganhTuyenSinh');
    tbody.empty();

    $.each(duLieu, function (i, item) {
        var classPct = layClassPhanTram(item.pctDat);
        var dong = '<tr>' +
            '<td>' + item.nganh + '</td>' +
            '<td class="text-center">' + item.chiTieu + '</td>' +
            '<td class="text-center">' + item.dangKy + '</td>' +
            '<td class="text-center">' + item.trungTuyen + '</td>' +
            '<td class="text-center">' + item.nhapHoc + '</td>' +
            '<td class="text-center"><span class="' + classPct + '">' + item.pctDat + '%</span></td>' +
            '</tr>';
        tbody.append(dong);
    });
}

function layClassPhanTram(pct) {
    if (pct < 40)       return 'pct-dat-red';
    else if (pct < 55)  return 'pct-dat-orange';
    else if (pct < 70)  return 'pct-dat-yellow';
    else                return 'pct-dat-green';
}

// Format số có dấu phẩy
function kinhDoangSoLuong(so) {
    return so.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function thuGonMoRongLoc() {
    var $wrap = $('#filterExtendedWrap');
    var $icon = $('#iconThuGon');
    var $label = $('#labelThuGon');

    daThuGonLoc = !daThuGonLoc;

    if (daThuGonLoc) {
        $wrap.addClass('collapsed');
        $icon.removeClass('bi-funnel').addClass('bi-funnel-fill');
        $label.text('Mở rộng lọc');
        $('#btnThuGonLoc').addClass('active');
    } else {
        $wrap.removeClass('collapsed');
        $icon.removeClass('bi-funnel-fill').addClass('bi-funnel');
        $label.text('Thu gọn lọc');
        $('#btnThuGonLoc').removeClass('active');
    }
}

// Xử lý tab lọc
function xoaTagLoc(phanTu) {
    $(phanTu).closest('.filter-tag').remove();
}

function timKiemDuLieu() {
    var namTuyenSinh = $('#namTuyenSinh').val();
    console.log('Tìm kiếm với năm:', namTuyenSinh);
    if (duLieuDashboard) {
        khoiTaoDashboard(duLieuDashboard);
    }
}

function dongBoDuLieu() {
    var $btn = $('#btnThuGonLoc');

    $btn.prop('disabled', true);
    setTimeout(function () {
        $btn.prop('disabled', false);
        taiDuLieuMau();
    }, 1000);
    console.log('Đồng bộ dữ liệu...');
}

function lamMoiDashboard() {
    var $btn = $('#btnLamMoi').find('i');
    $btn.addClass('spin');
    setTimeout(function () {
        $btn.removeClass('spin');
        taiDuLieuMau();
    }, 800);
}

function xuatBaoCao() {
    alert('Xuất báo cáooo');
}

function khoiTaoTabSuKien() {
    $('#tab-tong-quan').on('shown.bs.tab', function () {
        if (duLieuDashboard) {
            setTimeout(function () {
                buildChartHoSoTheoNgay(duLieuDashboard.hoSoTheoNgay);
                buildChartSoSanhNganh(duLieuDashboard.soSanhNganh);
                buildChartPhanBoTinh(duLieuDashboard.phanBoTinh);
                buildChartFunnelTuyenSinh(duLieuDashboard.funnelTuyenSinh);
                buildChartTrangThaiHoSo(duLieuDashboard.trangThaiHoSo);
            }, 50);
        }
    });

    $('#tab-ho-so').on('shown.bs.tab', function () {
        if (duLieuDashboard) {
            renderBangSoLuongHoSo(duLieuDashboard.soLuongHoSoTheoLoai);
            renderBangTrangThaiOnline(duLieuDashboard.trangThaiDangKyOnline);
            renderBangNganhTuyenSinh(duLieuDashboard.nganhDangTuyenSinh);
        }
    });
}
(function addSpinStyle() {
    var style = document.createElement('style');
    style.textContent = '.spin { animation: spinAnim 0.8s linear infinite; } @keyframes spinAnim { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
})();
