using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace WebApplicationTest3
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "DangKyChinhQuy",
                url: "dang-ky-chinh-quy",
                defaults: new { controller = "DangKyXetTuyen", action = "Index", typeCauHinh = 43 }
            );

            routes.MapRoute(
                name: "SauDaiHoc",
                url: "tuyen-sinh-sau-dai-hoc",
                defaults: new { controller = "DangKyXetTuyen", action = "Index", typeCauHinh = 112 }
            );

            routes.MapRoute(
                name: "LienThong",
                url: "lien-thong-dai-hoc",
                defaults: new { controller = "DangKyXetTuyen", action = "Index", typeCauHinh = 153 }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
