export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    if (!product) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Produk tidak ditemukan." }),
      );
    }

    setResponseStatus(event, 200);
    return { product };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
