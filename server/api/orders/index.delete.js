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
        createError({
          statusCode: 403,
          message: "Hanya Admin yang bisa menghapus transaksi.",
        }),
      );
    }

    const body = await readBody(event);
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Tanggal awal dan akhir wajib diisi.",
        }),
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // ← sampai akhir hari

    if (start > end) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Tanggal awal tidak boleh lebih dari tanggal akhir.",
        }),
      );
    }

    const { count } = await prisma.order.deleteMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    setResponseStatus(event, 200);
    return { message: `${count} transaksi berhasil dihapus.`, count };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
