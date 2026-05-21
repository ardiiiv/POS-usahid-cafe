export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, icon } = body;

    if (!name) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "Nama kategori wajib diisi." }),
      );
    }

    const existing = await prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "Kategori sudah ada." }),
      );
    }

    const category = await prisma.category.create({
      data: { name, icon },
    });

    setResponseStatus(event, 201);
    return { message: "Kategori berhasil dibuat.", category };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
