import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const protectedRoutes = [
    "/api/users",
    "/api/categories",
    "/api/products",
    "/api/upload",
    "/api/orders",
    "/api/dashboard",
  ];

  const url = getRequestURL(event).pathname;
  const isProtected = protectedRoutes.some((route) => url.startsWith(route));

  if (!isProtected) return;

  const authHeader = getRequestHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    setResponseStatus(event, 401);
    return sendError(
      event,
      createError({ statusCode: 401, message: "Token tidak ditemukan." }),
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { sessionId: true },
    });

    if (!user || user.sessionId !== decoded.sessionId) {
      return sendError(
        event,
        createError({
          statusCode: 401,
          message: "Sesi tidak valid. Silahkan login kembali.",
        }),
      );
    }

    event.context.user = decoded;
  } catch (error) {
    setResponseStatus(event, 401);
    return sendError(
      event,
      createError({
        statusCode: 401,
        message: "Token tidak valid atau sudah kadaluarsa.",
      }),
    );
  }
});
