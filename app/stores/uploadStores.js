import { defineStore } from "pinia";

export const useUploadStore = defineStore("upload", {
  state: () => ({
    loading: false,
    url: null,
  }),

  actions: {
    async uploadImage(file) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await $api.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        this.url = res.data.url;
        return { success: true, url: res.data.url };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengupload gambar.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async deleteImage(imageUrl) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        await $api.delete("/upload/image", { data: { imageUrl } });
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal menghapus gambar.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    resetUrl() {
      this.url = null;
    },
  },
});
