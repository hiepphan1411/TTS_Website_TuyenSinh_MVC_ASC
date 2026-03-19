using System;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Website_TuyenSinh.Models.repositories;

namespace Website_TuyenSinh.Controllers
{
    public class XetTuyenDaiHocController : Controller
    {
        private const int ID_LOAI = 112;

        private static readonly JsonSerializerSettings _jsonSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore
        };

        // GET: DangKyTuyenSinh
        public ActionResult Index()
        {
            var repo = new TuyenSinhRepository();
            var data = repo.getByLoai(ID_LOAI);
            ViewBag.FormConfigJson = JsonConvert.SerializeObject(data, _jsonSettings);
            return View();
        }

       

        public ActionResult getCauHinhTuyenSinh()
        {
            var repo = new TuyenSinhRepository();
            var data = repo.getAll();
            return Json(data, JsonRequestBehavior.AllowGet);
        }

    }
}