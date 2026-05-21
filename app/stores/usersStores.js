import { defineStore } from "pinia";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    profile: null,
    loading: false,
  }),

  getters: {
    totalUsers: (state) => state.users.length,
  },

  actions: {
    // ───── GET PROFILE ─────
    async getProfile() {
      const { $api } = useNuxtApp();
      try {
        const res = await $api.get("/users/profile");
        this.profile = res.data.user;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil profil.";
        return { success: false, message };
      }
    },

    // ───── GET ALL USERS ─────
    async fetchUsers() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.get("/users");
        this.users = res.data.users;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil data users.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ───── CREATE USER ─────
    async createUser(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.post("/users", payload);
        this.users.push(res.data.data);
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Gagal membuat akun.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ───── DELETE USER ─────
    async deleteUser(userId) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.delete(`/users/${userId}`);
        this.users = this.users.filter((user) => user.id !== userId);
        return { success: true, message: res.data.message };
      } catch (err) {
        const message = err.response?.data?.message || "Gagal menghapus akun.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ───── CHANGE PASSWORD ─────
    async changePassword(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.patch("/users/password", payload);
        return { success: true, message: res.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengubah password.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
