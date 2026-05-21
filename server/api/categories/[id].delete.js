export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Kategori tidak ditemukan." }),
      );
    }

    // cegah hapus kategori yang masih punya produk
    if (existing._count.products > 0) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: `Kategori masih memiliki ${existing._count.products} produk. Hapus produk terlebih dahulu.`,
        }),
      );
    }

    await prisma.category.delete({ where: { id } });

    setResponseStatus(event, 200);
    return { message: `Kategori ${existing.name} berhasil dihapus.` };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
