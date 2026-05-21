export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, description, price, stock, imageUrl, categoryId, barcode } =
      body;

    if (!name || !price || !categoryId) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Nama, harga, dan kategori wajib diisi.",
        }),
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Kategori tidak ditemukan." }),
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock: stock ?? 0,
        imageUrl,
        categoryId,
        barcode: barcode || null,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    setResponseStatus(event, 201);
    return { message: "Produk berhasil dibuat.", product };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
