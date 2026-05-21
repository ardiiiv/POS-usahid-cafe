import { getCookie, deleteCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const refreshToken = getCookie(event, "refreshToken");

    if (refreshToken) {
      const tokenInDb = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (tokenInDb) {
        // Hapus refresh token
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });

        // Clear sessionId
        await prisma.user.update({
          where: { id: tokenInDb.userId },
          data: { sessionId: null },
        });
      }
    }

    deleteCookie(event, "refreshToken");

    setResponseStatus(event, 200);
    return { message: "Logout berhasil." };
  } catch (error) {
    console.log(error);
    deleteCookie(event, "refreshToken");
    setResponseStatus(event, 500);
    return sendError(
      event,
      createError({ statusCode: 500, message: "terjadi kesalahan server." }),
    );
  }
});
