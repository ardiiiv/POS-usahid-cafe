export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { categoryId, isActive, search, barcode } = query;

    const products = await prisma.product.findMany({
      where: {
        ...(isActive !== undefined
          ? { isActive: isActive === "true" }
          : { isActive: true }),
        ...(categoryId && { categoryId }),
        // ...(isActive !== undefined && { isActive: isActive === "true" }),
        ...(search && {
          name: { contains: search, mode: "insensitive" },
        }),
        ...(barcode && { barcode }),
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    setResponseStatus(event, 200);
    return { products };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
