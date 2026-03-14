import { getCookie, deleteCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const refreshToken = getCookie(event, "refreshToken");

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
        },
      });
    }

    deleteCookie(event, "refreshToken");

    setResponseStatus(event, 200);
    return { message: "Logout berhasil." };
  } catch (error) {
    console.log(error);
    deleteCookie(event, "refreshToken");
    setResponseStatus(event, 500);
    return { message: "terjadi kesalahan server." };
  }
});
