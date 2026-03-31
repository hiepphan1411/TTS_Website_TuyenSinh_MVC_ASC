using System;

namespace WebApplicationTest3.Models
{
    public class ThongKeDiemDanhNoiTruViewModel
    {
        public int Id { get; set; }
        public int? IDNguoiONoiTru { get; set; }
        public int? IDPhong { get; set; }
        public int? VangMat { get; set; }
        public DateTime? NgayDiemDanh { get; set; }
        public int? NguoiDiemDanh { get; set; }
        public int? IDLopHoc { get; set; }
        public string TenLopHoc { get; set; }
        public string MaNoiTru { get; set; }
        public string HoDem { get; set; }
        public string Ten { get; set; }
        public string TenNhomDiaDiemPhong { get; set; }
        public string TenDayNha { get; set; }
        public string MaDayNha { get; set; }
        public string MaPhong { get; set; }
        public int? IDPhanLoaiDoiTuong { get; set; }
        public string HoVaTen { get; set; }
        public int? SLVang { get; set; }
        public string NgayVang { get; set; }
    }
}