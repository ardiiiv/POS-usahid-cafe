export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Order tidak ditemukan." }),
      );
    }

    setResponseStatus(event, 200);
    return { order };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
