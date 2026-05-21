export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;
    const me = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });

    // if (me.role !== "Admin") {
    //   return sendError(
    //     event,
    //     createError({ statusCode: 403, message: "Anda tidak memiliki izin." }),
    //   );
    // }

    const { id } = event.context.params;
    const body = await readBody(event);
    const {
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId,
      isActive,
      barcode,
    } = body;

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Produk tidak ditemukan." }),
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(stock !== undefined && { stock }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categoryId && { categoryId }),
        ...(isActive !== undefined && { isActive }),
        ...(barcode !== undefined && { barcode }),
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    setResponseStatus(event, 200);
    return { message: "Produk berhasil diupdate.", product };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
