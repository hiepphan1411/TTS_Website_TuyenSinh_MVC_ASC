using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TuyenSinh.Models.Entities
{
    public class DM_DanhMuc
    {
        [Key, Column(Order = 0)]
        public int IDLoaiDanhMuc { get; set; }

        [Key, Column(Order = 1), MaxLength(100)]
        public string MaDanhMuc { get; set; }

        [MaxLength(500)]
        public string TenDanhMuc { get; set; }

        //Tên tab/nhóm
        [MaxLength(200)] public string Text02 { get; set; }

        //Số cột
        [MaxLength(10)]  public string Text03 { get; set; }

        //MaDanhMuc
        [MaxLength(100)] public string Text04 { get; set; }

        //Text05
        [MaxLength(200)] public string Text05 { get; set; }

        //Is cấu hình cha
        [MaxLength(5)]   public string Text06 { get; set; }

        [MaxLength(5)]   public string Text07 { get; set; }

        [MaxLength(200)] public string Text08 { get; set; }

        [MaxLength(200)] public string Text09 { get; set; }

        [MaxLength(100)] public string Text10 { get; set; }

        [MaxLength(5)]   public string Text12 { get; set; }

        [MaxLength(20)]  public string Text13 { get; set; }

        [MaxLength(500)] public string Text14 { get; set; }

        [MaxLength(5)]   public string Text15 { get; set; }

        public bool?  BoolValue01 { get; set; }  // IsRequired
        public bool?  BoolValue02 { get; set; }  // IsVisible
        public bool   BoolValue03 { get; set; }  // ExcludedColumn
        public bool?  BoolValue04 { get; set; }  // ReadOnly 
        public bool?  BoolValue05 { get; set; }  // IsNotUpdate

        public bool   IsVisible   { get; set; }
        public int    NguoiTao    { get; set; }
        public DateTime NgayTao   { get; set; }
        public int    STT         { get; set; }
    }
}
