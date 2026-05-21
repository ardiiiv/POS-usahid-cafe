import { defineStore } from "pinia";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    totalCategories: (state) => state.categories.length,
  },

  actions: {
    async fetchCategories() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        this.error = null;

        const res = await $api.get("/categories");
        this.categories = res.data.categories;

        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil kategori.";

        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async createCategory(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        this.error = null;

        const res = await $api.post("/categories", payload);
        this.categories.push(res.data.category);

        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal membuat kategori.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id, payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        this.error = null;

        const res = await $api.put(`/categories/${id}`, payload);
        const index = this.categories.findIndex((c) => c.id === id);

        if (index !== -1) this.categories[index] = res.data.category;

        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengupdate kategori.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        this.error = null;

        const res = await $api.delete(`/categories/${id}`);
        this.categories = this.categories.filter((c) => c.id !== id);

        return { success: true, message: res.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal menghapus kategori.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
