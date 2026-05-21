export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { status, startDate, endDate, userId } = query;

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(userId && { userId }),
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    setResponseStatus(event, 200);
    return { orders };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
