import axios from "axios";
import { useAuthStore } from "~/stores/authStores";

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
  });

  // REQUEST INTERCEPTOR
  api.interceptors.request.use((config) => {
    const auth = useAuthStore();

    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    return config;
  });

  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const auth = useAuthStore();
      const originalRequest = error.config;
      const message = error.response?.data?.message || "";

      if (
        error.response?.status === 401 &&
        message.includes("Sesi tidak valid")
      ) {
        await auth.logout();
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(
            "/api/auth/refresh",
            {},
            { withCredentials: true },
          );

          const newToken = res.data.token;

          auth.setAccessToken(newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        } catch (err) {
          await auth.logout();
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    provide: {
      api,
    },
  };
});
