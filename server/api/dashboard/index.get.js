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

    // Rata-rata order
    const rataRataOrder =
      totalTransaksi > 0
        ? Number(totalPendapatan._sum.totalAmount ?? 0) / totalTransaksi
        : 0;

    // Grafik pendapatan harian
    const orders = await prisma.order.findMany({
      where: whereCompleted,
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });

    const grafikHarian = {};
    for (const order of orders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      grafikHarian[date] =
        (grafikHarian[date] ?? 0) + Number(order.totalAmount);
    }

    const grafikData = Object.entries(grafikHarian).map(([date, total]) => ({
      date,
      total,
    }));

    // Top kategori
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
    for (const item of orderItems) {
      if (!item.product) continue;
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
    }

    const topKategori = Object.values(kategoriMap).sort(
      (a, b) => b.total - a.total,
    );

    // Transaksi terbaru
    const transaksiTerbaru = await prisma.order.findMany({
      where: whereCompleted,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        userName: true,
      },
    });

    setResponseStatus(event, 200);
    return {
      totalPendapatan: Number(totalPendapatan._sum.totalAmount ?? 0),
      totalTransaksi,
      rataRataOrder,
      grafikData,
      topKategori,
      transaksiTerbaru,
    };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
