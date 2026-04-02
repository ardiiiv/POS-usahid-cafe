import { getCookie, deleteCookie } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const refreshToken = getCookie(event, "refreshToken");

    if (!refreshToken) {
      setResponseStatus(event, 401);
      return sendError(event, createError({statusCode: 401, message: "Unauthorized"}))
    }

    const tokenInDb = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: { user: true },
    });

    if (!tokenInDb) {
      deleteCookie(event, "refreshToken");
      setResponseStatus(event, 401);
      return sendError(event, createError({statusCode: 401, message: "Invalid token"}))
    }

    if (tokenInDb.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      deleteCookie(event, "refreshToken");

      setResponseStatus(event, 401);
      return sendError(event, createError({statusCode: 401, message: "Refresh token expired"}))
    }

    const newAccessToken = generateToken(tokenInDb.user);

    return { token: newAccessToken };
  } catch (error) {
    console.log(error);
    setResponseStatus(event, 500);
    return sendError(event, createError({statusCode: 500, message: "terjadi kesalahan server"}))
  }
});
