using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
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
        string apiToHop = "https://ts-dntu.ascvn.vn/TuyenSinh/GetToHopMonForSelect";

        // GET: DangKyChinhQuy, TuyenSinhSauDaiHoc
        public ActionResult Index(int typeCauHinh)
        {
            var repo = new TuyenSinhRepository();

            ViewBag.ShowSidebar = true;

            var data = repo.getByLoai(typeCauHinh);
            ViewBag.FormConfigJson = JsonConvert.SerializeObject(data, _jsonSettings);

            return View();
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

            if (!string.IsNullOrEmpty(apiToHop))
            {
                using (var client = new HttpClient())
                {
                    var json = JsonConvert.SerializeObject(requestData);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    try
                    {
                        var response = await client.PostAsync(apiToHop, content);
                        var responseString = await response.Content.ReadAsStringAsync();

                        model = new TieuChiTuyenSinhViewModel
                        {
                            TieuChiList = danhMucRepo.getAllTieuChiTS(),
                            ToHopMonJson = responseString
                        };
                    }
                    catch (Exception e)
                    {
                        System.Diagnostics.Debug.WriteLine($"API call failed: {e.Message}");
                        model = new TieuChiTuyenSinhViewModel
                        {
                            TieuChiList = danhMucRepo.getAllTieuChiTS()
                        };
                    }
                }
            }

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