export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "User tidak ditemukan." }),
      );
    }

    setResponseStatus(event, 200);
    return { user };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
