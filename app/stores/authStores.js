import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.role === "Admin",
  },

  actions: {
    setAccessToken(token) {
      this.accessToken = token;
    },

    async login(payload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.post("/auth/login", payload);
        this.user = res.data.user;
        this.accessToken = res.data.token;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Email atau Password salah.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const { $api } = useNuxtApp();
      try {
        await $api.post("/auth/logout");
      } catch {}
      this.user = null;
      this.accessToken = null;
      navigateTo("/");
    },
  },
});
