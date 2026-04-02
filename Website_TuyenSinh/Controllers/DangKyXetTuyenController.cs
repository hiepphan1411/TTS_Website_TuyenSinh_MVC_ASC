using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using TuyenSinh.Models.Entities;
using WebApplicationTest3.Models;
using WebApplicationTest3.Models.repositories;
using Website_TuyenSinh.Models.repositories;

namespace Website_TuyenSinh.Controllers
{
    public class DangKyXetTuyenController : Controller
    {
        private static readonly JsonSerializerSettings _jsonSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };
        string apiToHop = "";

        // GET: DangKyChinhQuy, TuyenSinhSauDaiHoc
        public ActionResult Index(int typeCauHinh)
        {
            var repo = new TuyenSinhRepository();
            var danhMucRepo = new TieuChiTSRepository();

            TieuChiTuyenSinhViewModel model = null;

            model = new TieuChiTuyenSinhViewModel
            {
                TieuChiList = danhMucRepo.getAllTieuChiTS(),
            };

            ViewBag.ShowSidebar = true;

            var data = repo.getByLoai(typeCauHinh);

            if (model.TieuChiList != null && model.TieuChiList.Count > 0 && typeCauHinh == 43)
            {
                data.Add(new DM_DanhMuc
                {
                    IDLoaiDanhMuc = typeCauHinh,
                    MaDanhMuc = "",
                    TenDanhMuc = "Thông tin xét tuyển",
                    Text02 = "ThongTinXetTuyen"
                });
            }
            ViewBag.FormConfigJson = JsonConvert.SerializeObject(data, _jsonSettings);

            return View(model);
        }

        // GET: DangKyTuyenSinh
        public async Task<ActionResult> RazorLogicChinhQuy()
        {
            var repo = new TuyenSinhRepository();
            var danhMucRepo = new TieuChiTSRepository();

            var requestData = new
            {
                pIDCTTS = 226,
                pIDTieuChiTS = 1
            };

            TieuChiTuyenSinhViewModel model = null;

            model = new TieuChiTuyenSinhViewModel
            {
                TieuChiList = danhMucRepo.getAllTieuChiTS(),
            };

            return View(model);
        }

        public ActionResult getCauHinhTuyenSinh()
        {
            var repo = new TuyenSinhRepository();
            var data = repo.getAll();
            return Json(data, JsonRequestBehavior.AllowGet);
        }

    }
}