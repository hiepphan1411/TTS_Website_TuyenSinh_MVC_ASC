using System.Web.Mvc;

namespace TTS_Website_TuyenSinh_MVC_ASC.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return RedirectToAction("Index", "ThongTinXetTuyen");
        }
    }
}
