using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplicationTest3.Models;

namespace WebApplicationTest3.Controllers
{
    public class ThongKeDiemDanhKTXController : Controller
    {
        // GET: ThongKeDiemDanhKTX
        public ActionResult Index(ParamThongKeDiemDanhNoiTru param)
        {
            int loai = param.LoaiThongKe ?? 1;
            int thang = param.Thang ?? DateTime.Now.Month;
            int nam = param.Nam ?? DateTime.Now.Year;

            List<ThongKeDiemDanhNoiTruViewModel> viewModel = new List<ThongKeDiemDanhNoiTruViewModel>{
                new ThongKeDiemDanhNoiTruViewModel
                {
                    Id = 1, IDNguoiONoiTru = 101, IDPhong = 201,
                    IDLopHoc = 1, TenLopHoc = "Bác sĩ đa khoa K44",
                    MaNoiTru = "1944112071", HoDem = "Trần Hữu", Ten = "Chiến",
                    HoVaTen = "Trần Hữu Chiến",
                    TenNhomDiaDiemPhong = "KTX cơ sở 1", TenDayNha = "Dãy A",
                    MaDayNha = "A", MaPhong = "201",
                    VangMat = 1, SLVang = 4,
                    NgayVang = $"02/{thang:D2}, 10/{thang:D2}, 15/{thang:D2}, 18/{thang:D2}",
                    NgayDiemDanh = new DateTime(nam, thang, 2)
                },
                new ThongKeDiemDanhNoiTruViewModel
                {
                    Id = 2, IDNguoiONoiTru = 102, IDPhong = 201,
                    IDLopHoc = 1, TenLopHoc = "Bác sĩ đa khoa K44",
                    MaNoiTru = "1944611344", HoDem = "Lê Minh", Ten = "Tùng",
                    HoVaTen = "Lê Minh Tùng",
                    TenNhomDiaDiemPhong = "KTX cơ sở 1", TenDayNha = "Dãy A",
                    MaDayNha = "A", MaPhong = "201",
                    VangMat = 1, SLVang = 3,
                    NgayVang = $"01/{thang:D2}, 03/{thang:D2}, 20/{thang:D2}",
                    NgayDiemDanh = new DateTime(nam, thang, 1)
                },
                new ThongKeDiemDanhNoiTruViewModel
                {
                    Id = 3, IDNguoiONoiTru = 103, IDPhong = 305,
                    IDLopHoc = 2, TenLopHoc = "Y học cổ truyền K44",
                    MaNoiTru = "1944200123", HoDem = "Nguyễn Thị", Ten = "Lan",
                    HoVaTen = "Nguyễn Thị Lan",
                    TenNhomDiaDiemPhong = "KTX cơ sở 2", TenDayNha = "Dãy B",
                    MaDayNha = "B", MaPhong = "305",
                    VangMat = 1, SLVang = 2,
                    NgayVang = $"05/{thang:D2}, 16/{thang:D2}",
                    NgayDiemDanh = new DateTime(nam, thang, 5)
                },
                new ThongKeDiemDanhNoiTruViewModel
                {
                    Id = 4, IDNguoiONoiTru = 104, IDPhong = 305,
                    IDLopHoc = 2, TenLopHoc = "Y học cổ truyền K44",
                    MaNoiTru = "1944200456", HoDem = "Phạm Văn", Ten = "Hùng",
                    HoVaTen = "Phạm Văn Hùng",
                    TenNhomDiaDiemPhong = "KTX cơ sở 2", TenDayNha = "Dãy B",
                    MaDayNha = "B", MaPhong = "305",
                    VangMat = 1, SLVang = 1,
                    NgayVang = $"12/{thang:D2}",
                    NgayDiemDanh = new DateTime(nam, thang, 12)
                },
            }; ;
            return View(viewModel);
        }


    }
}