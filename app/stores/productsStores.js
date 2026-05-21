import { defineStore } from "pinia";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    loading: false,
    searchQuery: "",
    selectedCategoryId: "",
  }),

  getters: {
    filteredProducts(state) {
      return state.products.filter((p) => {
        const matchSearch =
          !state.searchQuery ||
          p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          (p.description &&
            p.description
              .toLowerCase()
              .includes(state.searchQuery.toLowerCase()));

        const matchCategory =
          !state.selectedCategoryId ||
          p.categoryId === state.selectedCategoryId;

        return matchSearch && matchCategory;
      });
    },
  },

  actions: {
    async fetchProducts() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.get("/products");
        this.products = res.data.products;
      } catch (err) {
        return { success: false, message: "Gagal mengambil data produk." };
      } finally {
        this.loading = false;
      }
    },

    async createProduct(data) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.post("/products", data);
        await this.fetchProducts();
        return { success: true, product: res.data.product };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal menambahkan produk.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.put(`/products/${id}`, payload);
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) this.products[index] = res.data.product;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengupdate produk.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        await $api.delete(`/products/${id}`);
        await this.fetchProducts();
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal menghapus produk.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async adjustStock(id, delta) {
      const product = this.products.find((p) => p.id === id);
      if (!product)
        return { success: false, message: "Produk tidak ditemukan." };

      const newStock = product.stock + delta;
      if (newStock < 0)
        return { success: false, message: "Stok tidak boleh kurang dari 0." };

      return await this.updateProduct(id, { stock: newStock });
    },

    setSearch(query) {
      this.searchQuery = query;
    },

    setCategory(categoryId) {
      this.selectedCategoryId = categoryId;
    },

    resetFilter() {
      this.searchQuery = "";
      this.selectedCategoryId = "";
    },
  },
});
