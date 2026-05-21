import { defineStore } from "pinia";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    loading: false,
    totalPendapatan: 0,
    totalTransaksi: 0,
    rataRataOrder: 0,
    grafikData: [],
    topKategori: [],
    transaksiTerbaru: [],
  }),

  actions: {
    async fetchDashboard(params = {}) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.get("/dashboard", { params });
        this.totalPendapatan = res.data.totalPendapatan;
        this.totalTransaksi = res.data.totalTransaksi;
        this.rataRataOrder = res.data.rataRataOrder;
        this.grafikData = res.data.grafikData;
        this.topKategori = res.data.topKategori;
        this.transaksiTerbaru = res.data.transaksiTerbaru;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil data dashboard.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
