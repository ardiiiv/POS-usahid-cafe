export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;

    const me = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });

    if (me.role !== "Admin") {
      return sendError(
        event,
        createError({ statusCode: 403, message: "Anda tidak memiliki izin." }),
      );
    }

    const { id } = event.context.params;
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Produk tidak ditemukan." }),
      );
    }

    await prisma.product.delete({ where: { id } });

    setResponseStatus(event, 200);
    return { message: `Produk ${existing.name} berhasil dihapus.` };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
