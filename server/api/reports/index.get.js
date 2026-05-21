export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { startDate, endDate } = query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const whereCompleted = {
      status: "COMPLETED",
      createdAt: { gte: start, lte: end },
    };

    // Total pendapatan
    const totalPendapatan = await prisma.order.aggregate({
      where: whereCompleted,
      _sum: { totalAmount: true },
    });

    // Total transaksi
    const totalTransaksi = await prisma.order.count({
      where: whereCompleted,
    });

    // Pendapatan cash
    const pendapatanCash = await prisma.order.aggregate({
      where: { ...whereCompleted, paymentMethod: "CASH" },
      _sum: { totalAmount: true },
    });

    // Pendapatan QRIS
    const pendapatanQris = await prisma.order.aggregate({
      where: { ...whereCompleted, paymentMethod: "QRIS" },
      _sum: { totalAmount: true },
    });

    // Pendapatan per kategori
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: "COMPLETED", createdAt: { gte: start, lte: end } },
        productId: { not: null },
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, icon: true } },
          },
        },
      },
    });

    const kategoriMap = {};
    const produkMap = {};

    for (const item of orderItems) {
      if (!item.product) continue;

      // Per kategori
      const cat = item.product.category;
      if (!kategoriMap[cat.id]) {
        kategoriMap[cat.id] = {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          total: 0,
        };
      }
      kategoriMap[cat.id].total += Number(item.priceAtTime) * item.quantity;

      // Per produk
      const produkId = item.product.id;
      if (!produkMap[produkId]) {
        produkMap[produkId] = {
          id: produkId,
          name: item.productName || item.product.name,
          total: 0,
          quantity: 0,
        };
      }
      produkMap[produkId].total += Number(item.priceAtTime) * item.quantity;
      produkMap[produkId].quantity += item.quantity;
    }

    const pendapatanPerKategori = Object.values(kategoriMap).sort(
      (a, b) => b.total - a.total,
    );

    const top10Produk = Object.values(produkMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Detail transaksi
    const detailTransaksi = await prisma.order.findMany({
      where: whereCompleted,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        userName: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            priceAtTime: true,
          },
        },
      },
    });

    setResponseStatus(event, 200);
    return {
      totalPendapatan: Number(totalPendapatan._sum.totalAmount ?? 0),
      totalTransaksi,
      pendapatanCash: Number(pendapatanCash._sum.totalAmount ?? 0),
      pendapatanQris: Number(pendapatanQris._sum.totalAmount ?? 0),
      pendapatanPerKategori,
      top10Produk,
      detailTransaksi,
    };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
