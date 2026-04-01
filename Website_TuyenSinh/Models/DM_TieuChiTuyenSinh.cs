using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Web.Mvc;

namespace TuyenSinh.Models.Entities
{
    [Table("_DM_TieuChiTuyenSinh")]
    public class DM_TieuChiTuyenSinh
    {
        [Key]
        public int Id { get; set; }

        [StringLength(20)]
        public string MaTieuChi { get; set; }

        [StringLength(200)]
        public string TenTieuChi { get; set; }

        [StringLength(500)]
        public string Fields { get; set; }

        [StringLength(500)]
        public string CongThucTinhDiemTongCong { get; set; }

        public int? STT { get; set; }

        public bool? IsSuDung { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? StepLamTron { get; set; }

        public int? IDCachNhapDiem { get; set; }

        [StringLength(200)]
        public string DSIDHeDT { get; set; }

        [StringLength(200)]
        public string DSIDLoaiHinhDT { get; set; }

        [StringLength(500)]
        public string DSIDNganh { get; set; }
    }
}