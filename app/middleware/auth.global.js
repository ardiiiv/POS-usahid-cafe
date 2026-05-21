export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  const publicRoutes = ["/"];
  if (publicRoutes.includes(to.path)) return;

  if (!auth.accessToken) {
    try {
      const headers = useRequestHeaders(["cookie"]);

      const res = await $fetch("/api/auth/refresh", {
        method: "POST",
        headers,
      });

      auth.setAccessToken(res.token);

      // fetch user dari DB
      const { user } = await $fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${res.token}`,
        },
      });

      auth.user = user;
    } catch (e) {
      console.log("error:", e.data || e.message);
      return navigateTo("/");
    }
  }

  // route yang hanya bisa diakses Admin
  const adminOnlyRoutes = [
    "/dashboard",
    "/kategori",
    "/reports",
    "/pengaturan",
  ];
  if (adminOnlyRoutes.includes(to.path) && auth.user?.role !== "Admin") {
    return navigateTo("/kasir");
  }
});
