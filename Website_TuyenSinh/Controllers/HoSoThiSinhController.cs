using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebApplicationTest3.Controllers
{
    public class HoSoThiSinhController : Controller
    {
        // GET: HoSoThiSinh
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult TabHoSoThiSinh()
        {
            return PartialView("HoSoThiSinh_HoSoThiSinh");
        }

        public ActionResult TabKhungHoSo()
        {
            return PartialView("HoSoThiSinh_KhungHoSo");
        }

        public ActionResult TabThayDoiMatKhau()
        {
            return PartialView("HoSoThiSinh_ThayDoiMatKhau");
        }

        public ActionResult TabTraCuuKetQua()
        {
            return PartialView("HoSoThiSinh_TraCuuKetQua");
        }
    }
}