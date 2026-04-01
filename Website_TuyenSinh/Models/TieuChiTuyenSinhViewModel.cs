using System.Collections.Generic;
using TuyenSinh.Models.Entities;

namespace WebApplicationTest3.Models
{
    public class TieuChiTuyenSinhViewModel
    {
        public List<DM_TieuChiTuyenSinh> TieuChiList { get; set; }
        public string ToHopMonJson { get; set; }
    }
}