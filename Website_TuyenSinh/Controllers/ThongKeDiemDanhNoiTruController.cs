using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.Ajax.Utilities;
using WebApplicationTest3.Models;

namespace WebApplicationTest3.Controllers
{
    public class ThongKeDiemDanhNoiTruController : Controller
    {
        // GET: /ThongKeDiemDanhNoiTru/Index
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult ThongKeDiemDanhNoiTru()
        {
            return View("Index");
        }

        [HttpPost]
        public JsonResult GetThongKe(ParamThongKeDiemDanhNoiTru param)
        {
            try
            {
                var data = GetDataDemo(param);
                return Json(new { success = true, data = data }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message }, JsonRequestBehavior.AllowGet);
            }
        }


        //Test
        private object GetDataDemo(ParamThongKeDiemDanhNoiTru param)
        {
            int loai = param.LoaiThongKe ?? 1;
            int thang = param.Thang ?? DateTime.Now.Month;
            int nam = param.Nam ?? DateTime.Now.Year;

            var allData = new List<ThongKeDiemDanhNoiTruViewModel>
            {
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
            };

            if (param.IDNhomDiaDiem.HasValue && param.IDNhomDiaDiem.Value > 0)
            {
                string tenNhom = param.IDNhomDiaDiem.Value == 1 ? "KTX cơ sở 1" : "KTX cơ sở 2";
                allData = allData.Where(x => x.TenNhomDiaDiemPhong == tenNhom).ToList();
            }

            switch (loai)
            {
                case 1:
                    var theoLop = allData
                        .GroupBy(x => new { x.IDLopHoc, x.TenLopHoc })
                        .Select((g, idx) => new
                        {
                            Stt = idx + 1,
                            TenLopHoc = g.Key.TenLopHoc,
                            SLVang = g.Sum(x => x.SLVang ?? 0),
                            NgayVang = string.Join(", ", g.SelectMany(x =>
                                (x.NgayVang ?? "").Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries))
                                .Distinct().OrderBy(d => d))
                        }).ToList();
                    return theoLop;

                case 2:
                    var theoSV = allData.Select((x, idx) => new
                    {
                        Stt = idx + 1,
                        MaNoiTru = x.MaNoiTru,
                        HoVaTen = x.HoVaTen,
                        TenLopHoc = x.TenLopHoc,
                        TenNhomDiaDiemPhong = x.TenNhomDiaDiemPhong,
                        TenDayNha = x.TenDayNha,
                        MaPhong = x.MaPhong,
                        SLVang = x.SLVang ?? 0,
                        NgayVang = x.NgayVang
                    }).ToList();
                    return theoSV;

                case 3:
                    var theoPhong = allData
                        .GroupBy(x => new { x.TenNhomDiaDiemPhong, x.TenDayNha, x.MaPhong })
                        .Select((g, idx) => new
                        {
                            Stt = idx + 1,
                            TenNhomDiaDiemPhong = g.Key.TenNhomDiaDiemPhong,
                            TenDayNha = g.Key.TenDayNha,
                            MaPhong = g.Key.MaPhong,
                            SLSVVang = g.Count(),
                            NgayVang = string.Join(", ", g.SelectMany(x =>
                                (x.NgayVang ?? "").Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries))
                                .Distinct().OrderBy(d => d))
                        }).ToList();
                    return theoPhong;

                default:
                    return new List<object>();
            }
        }


    }
}