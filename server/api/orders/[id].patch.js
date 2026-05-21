export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;
    const { id } = event.context.params;
    const body = await readBody(event);
    const { status } = body;

    if (!["COMPLETED", "CANCELLED"].includes(status)) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "Status tidak valid." }),
      );
    }

    // hanya admin yang bisa cancel/void
    if (status === "CANCELLED") {
      const me = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { role: true },
      });

      if (me.role !== "Admin") {
        return sendError(
          event,
          createError({
            statusCode: 403,
            message: "Hanya Admin yang bisa membatalkan order.",
          }),
        );
      }
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return sendError(
        event,
        createError({ statusCode: 404, message: "Order tidak ditemukan." }),
      );
    }

    if (existing.status !== "PENDING") {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Hanya order PENDING yang bisa diubah statusnya.",
        }),
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      });

      // kalau cancel, kembalikan stok
      if (status === "CANCELLED") {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return updated;
    });

    setResponseStatus(event, 200);
    return { message: `Order berhasil di-${status.toLowerCase()}.`, order };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
