using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using TuyenSinh.Models.Entities;

namespace WebApplicationTest3.Models.repositories
{
    public class TieuChiTSRepository
    {
        private readonly string _connectionString;

        public TieuChiTSRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["TempDbsContext"].ConnectionString;
        }

        public List<DM_TieuChiTuyenSinh> getAllTieuChiTS()
        {
            var result = new List<DM_TieuChiTuyenSinh>();
            const string sql = @"SELECT * FROM _DM_TieuChiTuyenSinh WHERE IsSuDung = 1";

            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();

                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = sql;
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var item = new DM_TieuChiTuyenSinh()
                            {
                                Id = Convert.ToInt32(reader["Id"]),
                                MaTieuChi = reader["MaTieuChi"] as string,
                                TenTieuChi = reader["TenTieuChi"] as string,
                                Fields = reader["Fields"] as string,
                                CongThucTinhDiemTongCong = reader["CongThucTinhDiemTongCong"] as string,
                                STT = reader["STT"] != DBNull.Value 
                                    ? Convert.ToInt32(reader["STT"]) : (int?)null,
                                IsSuDung = reader["IsSuDung"] != DBNull.Value 
                                    ? Convert.ToBoolean(reader["IsSuDung"]) : (bool?)null,
                                StepLamTron = reader["StepLamTron"] != DBNull.Value 
                                    ? Convert.ToDecimal(reader["StepLamTron"]) : (decimal?)null,
                                IDCachNhapDiem = reader["IDCachNhapDiem"] != DBNull.Value 
                                    ? Convert.ToInt32(reader["IDCachNhapDiem"]) : (int?)null,
                                DSIDHeDT = reader["DSIDHeDT"] as string,
                                DSIDLoaiHinhDT = reader["DSIDLoaiHinhDT"] as string,
                                DSIDNganh = reader["DSIDNganh"] as string
                            };
                            result.Add(item);
                        }
                    }
                }
            }

            return result;
        }
    }
}