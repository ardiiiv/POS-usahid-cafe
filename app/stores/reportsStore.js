import { defineStore } from "pinia";

export const useReportsStore = defineStore("reports", {
  state: () => ({
    loading: false,
    totalPendapatan: 0,
    totalTransaksi: 0,
    pendapatanCash: 0,
    pendapatanQris: 0,
    pendapatanPerKategori: [],
    top10Produk: [],
    detailTransaksi: [],
  }),

  actions: {
    async fetchReports(params = {}) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.get("/reports", { params });
        this.totalPendapatan = res.data.totalPendapatan;
        this.totalTransaksi = res.data.totalTransaksi;
        this.pendapatanCash = res.data.pendapatanCash;
        this.pendapatanQris = res.data.pendapatanQris;
        this.pendapatanPerKategori = res.data.pendapatanPerKategori;
        this.top10Produk = res.data.top10Produk;
        this.detailTransaksi = res.data.detailTransaksi;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil data reports.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
