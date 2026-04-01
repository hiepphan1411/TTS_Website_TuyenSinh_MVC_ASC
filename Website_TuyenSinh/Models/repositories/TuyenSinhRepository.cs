using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using TuyenSinh.Models.Entities;
using WebApplicationTest3.Models.repositories;

namespace Website_TuyenSinh.Models.repositories
{
    public class TuyenSinhRepository
    {
        private readonly string _connectionString;

        public TuyenSinhRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["TempDbsContext"].ConnectionString;
        }

        //Lấy danh sách cấu hình lênnn
        public List<DM_DanhMuc> getAll()
        {
            var results = new List<DM_DanhMuc>();
            const string sql = @"SELECT * FROM DM_DanhMuc";

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
                            var item = new DM_DanhMuc
                            {
                                IDLoaiDanhMuc = reader.GetInt32(reader.GetOrdinal("IDLoaiDanhMuc")),
                                MaDanhMuc = reader.GetString(reader.GetOrdinal("MaDanhMuc")),
                                TenDanhMuc = reader.GetString(reader.GetOrdinal("TenDanhMuc")),
                                Text02 = reader.IsDBNull(reader.GetOrdinal("Text02")) ? null : reader.GetString(reader.GetOrdinal("Text02")),
                                Text03 = reader.IsDBNull(reader.GetOrdinal("Text03")) ? null : reader.GetString(reader.GetOrdinal("Text03")),
                                Text04 = reader.IsDBNull(reader.GetOrdinal("Text04")) ? null : reader.GetString(reader.GetOrdinal("Text04")),
                                Text05 = reader.IsDBNull(reader.GetOrdinal("Text05")) ? null : reader.GetString(reader.GetOrdinal("Text05")),
                                Text06 = reader.IsDBNull(reader.GetOrdinal("Text06")) ? null : reader.GetString(reader.GetOrdinal("Text06")),
                                Text07 = reader.IsDBNull(reader.GetOrdinal("Text07")) ? null : reader.GetString(reader.GetOrdinal("Text07")),
                                Text08 = reader.IsDBNull(reader.GetOrdinal("Text08")) ? null : reader.GetString(reader.GetOrdinal("Text08")),
                                Text09 = reader.IsDBNull(reader.GetOrdinal("Text09")) ? null : reader.GetString(reader.GetOrdinal("Text09")),
                                Text10 = reader.IsDBNull(reader.GetOrdinal("Text10")) ? null : reader.GetString(reader.GetOrdinal("Text10")),
                                Text12 = reader.IsDBNull(reader.GetOrdinal("Text12")) ? null : reader.GetString(reader.GetOrdinal("Text12")),
                                Text13 = reader.IsDBNull(reader.GetOrdinal("Text13")) ? null : reader.GetString(reader.GetOrdinal("Text13")),
                                Text14 = reader.IsDBNull(reader.GetOrdinal("Text14")) ? null : reader.GetString(reader.GetOrdinal("Text14")),
                                Text15 = reader.IsDBNull(reader.GetOrdinal("Text15")) ? null : reader.GetString(reader.GetOrdinal("Text15")),
                                BoolValue01 = reader.IsDBNull(reader.GetOrdinal("BoolValue01")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue01")),
                                BoolValue02 = reader.IsDBNull(reader.GetOrdinal("BoolValue02")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue02")),
                                BoolValue03 = reader.IsDBNull(reader.GetOrdinal("BoolValue03")) ? false : reader.GetBoolean(reader.GetOrdinal("BoolValue03")),
                                BoolValue04 = reader.IsDBNull(reader.GetOrdinal("BoolValue04")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue04")),
                                BoolValue05 = reader.IsDBNull(reader.GetOrdinal("BoolValue05")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue05")),
                                IsVisible = reader.GetBoolean(reader.GetOrdinal("IsVisible")),
                                NguoiTao = reader.GetInt32(reader.GetOrdinal("NguoiTao")),
                                NgayTao = reader.GetDateTime(reader.GetOrdinal("NgayTao")),
                                STT = reader.GetInt32(reader.GetOrdinal("STT"))

                            };
                            results.Add(item);
                        }
                    }
                }
            }
            return results;
        }

        // Lấy danh sách cấu hình theo IDLoaiDanhMuc
        public List<DM_DanhMuc> getByLoai(int idLoaiDanhMuc)
        {
            var results = new List<DM_DanhMuc>();
            const string sql = @"SELECT * FROM DM_DanhMuc WHERE IDLoaiDanhMuc = @id ORDER BY STT";

            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = sql;
                    cmd.Parameters.AddWithValue("@id", idLoaiDanhMuc);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var item = new DM_DanhMuc
                            {
                                IDLoaiDanhMuc = reader.GetInt32(reader.GetOrdinal("IDLoaiDanhMuc")),
                                MaDanhMuc = reader.GetString(reader.GetOrdinal("MaDanhMuc")),
                                TenDanhMuc = reader.GetString(reader.GetOrdinal("TenDanhMuc")),
                                Text02 = reader.IsDBNull(reader.GetOrdinal("Text02")) ? null : reader.GetString(reader.GetOrdinal("Text02")),
                                Text03 = reader.IsDBNull(reader.GetOrdinal("Text03")) ? null : reader.GetString(reader.GetOrdinal("Text03")),
                                Text04 = reader.IsDBNull(reader.GetOrdinal("Text04")) ? null : reader.GetString(reader.GetOrdinal("Text04")),
                                Text05 = reader.IsDBNull(reader.GetOrdinal("Text05")) ? null : reader.GetString(reader.GetOrdinal("Text05")),
                                Text06 = reader.IsDBNull(reader.GetOrdinal("Text06")) ? null : reader.GetString(reader.GetOrdinal("Text06")),
                                Text07 = reader.IsDBNull(reader.GetOrdinal("Text07")) ? null : reader.GetString(reader.GetOrdinal("Text07")),
                                Text08 = reader.IsDBNull(reader.GetOrdinal("Text08")) ? null : reader.GetString(reader.GetOrdinal("Text08")),
                                Text09 = reader.IsDBNull(reader.GetOrdinal("Text09")) ? null : reader.GetString(reader.GetOrdinal("Text09")),
                                Text10 = reader.IsDBNull(reader.GetOrdinal("Text10")) ? null : reader.GetString(reader.GetOrdinal("Text10")),
                                Text12 = reader.IsDBNull(reader.GetOrdinal("Text12")) ? null : reader.GetString(reader.GetOrdinal("Text12")),
                                Text13 = reader.IsDBNull(reader.GetOrdinal("Text13")) ? null : reader.GetString(reader.GetOrdinal("Text13")),
                                Text14 = reader.IsDBNull(reader.GetOrdinal("Text14")) ? null : reader.GetString(reader.GetOrdinal("Text14")),
                                Text15 = reader.IsDBNull(reader.GetOrdinal("Text15")) ? null : reader.GetString(reader.GetOrdinal("Text15")),
                                BoolValue01 = reader.IsDBNull(reader.GetOrdinal("BoolValue01")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue01")),
                                BoolValue02 = reader.IsDBNull(reader.GetOrdinal("BoolValue02")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue02")),
                                BoolValue03 = reader.IsDBNull(reader.GetOrdinal("BoolValue03")),
                                BoolValue04 = reader.IsDBNull(reader.GetOrdinal("BoolValue04")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue04")),
                                BoolValue05 = reader.IsDBNull(reader.GetOrdinal("BoolValue05")) ? (bool?)null : reader.GetBoolean(reader.GetOrdinal("BoolValue05")),
                                IsVisible = reader.GetBoolean(reader.GetOrdinal("IsVisible")),
                                NguoiTao = reader.GetInt32(reader.GetOrdinal("NguoiTao")),
                                NgayTao = reader.GetDateTime(reader.GetOrdinal("NgayTao")),
                                STT = reader.GetInt32(reader.GetOrdinal("STT"))
                            };
                            results.Add(item);
                        }
                    }
                }
            }

            return results;
        }

    }
}