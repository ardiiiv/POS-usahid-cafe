export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params;
    const body = await readBody(event);
    const { name, icon } = body;

    if (!name) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "Nama kategori wajib diisi." }),
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Kategori tidak ditemukan." }),
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, icon },
    });

    setResponseStatus(event, 200);
    return { message: "Kategori berhasil diupdate.", category };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
