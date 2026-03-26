using System;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
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

        // GET: DangKyTuyenSinh
        public ActionResult DangKyChinhQuy()
        {
            var typeCauHinh = 112;

            var repo = new TuyenSinhRepository();
            ViewBag.ShowSidebar = true;
            var data = repo.getByLoai(typeCauHinh);
            ViewBag.FormConfigJson = JsonConvert.SerializeObject(data, _jsonSettings);
            return View();
        }

        public ActionResult getCauHinhTuyenSinh()
        {
            var repo = new TuyenSinhRepository();
            var data = repo.getAll();
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        //Get cấu hình cho tuyển sinh sau đại học 
        public ActionResult TuyenSinhSauDaiHoc()
        {
            var typeCauHinh = 112;

            var repo = new TuyenSinhRepository();
            ViewBag.ShowSidebar = true;
            var data = repo.getByLoai(typeCauHinh);
            ViewBag.FormConfigJson = JsonConvert.SerializeObject(data, _jsonSettings);

            return View();
        }
    }
}