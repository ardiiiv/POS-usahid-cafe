export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;
    const body = await readBody(event);
    const { items, paymentMethod } = body;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { name: true },
    });

    if (!items || items.length === 0) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Pesanan tidak boleh kosong.",
        }),
      );
    }

    if (!["CASH", "QRIS"].includes(paymentMethod)) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Metode pembayaran tidak valid.",
        }),
      );
    }

    // generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.order.count();
    const orderNumber = `TRX-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    // validasi produk dan hitung total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return sendError(
          event,
          createError({ statusCode: 404, message: `Produk tidak ditemukan.` }),
        );
      }

      if (!product.isActive) {
        return sendError(
          event,
          createError({
            statusCode: 400,
            message: `Produk ${product.name} tidak aktif.`,
          }),
        );
      }

      if (product.stock < item.quantity) {
        return sendError(
          event,
          createError({
            statusCode: 400,
            message: `Stok ${product.name} tidak mencukupi.`,
          }),
        );
      }

      totalAmount += Number(product.price) * item.quantity;
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    // untuk order + kurangi stok dalam satu transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          paymentMethod,
          status: "COMPLETED",
          userName: user.name,
          userId: currentUser.id,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
          user: { select: { id: true, name: true } },
        },
      });

      // kurangi stok tiap produk
      for (const item of orderItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    setResponseStatus(event, 201);
    return { message: "Order berhasil dibuat.", order };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
