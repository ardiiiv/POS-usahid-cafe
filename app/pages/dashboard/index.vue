<script setup>
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const dashboard = useDashboardStore();

// ── Filter Tanggal ──
const startDate = ref(
  new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .slice(0, 10),
);
const endDate = ref(new Date().toISOString().slice(0, 10));

onMounted(async () => {
  await dashboard.fetchDashboard({
    startDate: startDate.value,
    endDate: endDate.value,
  });
});

async function handleFilter() {
  await dashboard.fetchDashboard({
    startDate: startDate.value,
    endDate: endDate.value,
  });
}

// ── Grafik ──
const chartData = computed(() => ({
  labels: dashboard.grafikData.map((d) => {
    const date = new Date(d.date);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  }),
  datasets: [
    {
      label: "Pendapatan",
      data: dashboard.grafikData.map((d) => d.total),
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#22c55e",
      tension: 0.4,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` Rp ${Number(ctx.raw).toLocaleString("id-ID")}`,
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: (val) => `Rp ${Number(val).toLocaleString("id-ID")}`,
      },
      grid: { color: "rgba(0,0,0,0.05)" },
    },
    x: {
      grid: { display: false },
    },
  },
};

// ── Top Kategori ──
const maxKategori = computed(() =>
  Math.max(...dashboard.topKategori.map((k) => k.total), 1),
);

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <section class="flex flex-col gap-6 pb-1">
    <!-- Container 1: Filter Tanggal -->
    <div class="flex md:flex-row flex-col md:gap-0 gap-4 justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">
          Dashboard
        </h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Ringkasan performa penjualan cafe
        </p>
      </div>
      <div class="flex md:flex-row flex-col gap-3">
        <div class="flex flex-col gap-1">
          <p class="text-xs text-muted font-semibold">Dari Tanggal</p>
          <UInput type="date" v-model="startDate" size="md" />
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs text-muted font-semibold">Sampai Tanggal</p>
          <UInput type="date" v-model="endDate" size="md" />
        </div>
        <UButton
          variant="solid"
          color="primary"
          icon="i-lucide-search"
          label="Terapkan"
          block
          :loading="dashboard.loading"
          @click="handleFilter"
          class="self-end"
        />
      </div>
    </div>

    <!-- Container 2: Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-circle-dollar-sign" class="size-5" />
          <span>Total Pendapatan</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          Rp {{ Number(dashboard.totalPendapatan).toLocaleString("id-ID") }}
        </p>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-receipt" class="size-5" />
          <span>Total Transaksi</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          {{ dashboard.totalTransaksi }}
        </p>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-trending-up" class="size-5" />
          <span>Rata-rata Order</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          Rp {{ Number(dashboard.rataRataOrder).toLocaleString("id-ID") }}
        </p>
      </div>
    </div>

    <!-- Container 3: Grafik Pendapatan Harian -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
    >
      <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
        <UIcon name="i-lucide-chart-area" class="size-6" /> Grafik Pendapatan
        Harian
      </h2>
      <div v-if="dashboard.loading" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-circle"
          class="animate-spin text-primary size-8"
        />
      </div>
      <div
        v-else-if="dashboard.grafikData.length === 0"
        class="flex justify-center py-16 text-muted text-sm"
      >
        Tidak ada data pada rentang tanggal ini.
      </div>
      <div v-else class="h-64">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Container 4: Top Kategori + Transaksi Terbaru -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top Kategori -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
      >
        <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
          <UIcon name="i-lucide-trophy" class="size-6" /> Top Penjualan per
          Kategori
        </h2>
        <div
          v-if="dashboard.topKategori.length === 0"
          class="text-muted text-sm text-center py-8"
        >
          Tidak ada data.
        </div>
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="(cat, index) in dashboard.topKategori"
            :key="cat.id"
            class="flex flex-col gap-1"
          >
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <UIcon
                  v-if="cat.icon"
                  :name="cat.icon"
                  class="size-4 text-primary"
                />
                <span class="font-medium">{{ cat.name }}</span>
              </div>
              <span class="font-semibold text-primary">
                Rp {{ Number(cat.total).toLocaleString("id-ID") }}
              </span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div
                class="h-2 rounded-full bg-primary transition-all duration-500"
                :style="{ width: `${(cat.total / maxKategori) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Transaksi Terbaru -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
      >
        <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
          <UIcon name="i-lucide-clock" class="size-6" /> Transaksi Terbaru
        </h2>
        <div
          v-if="dashboard.transaksiTerbaru.length === 0"
          class="text-muted text-sm text-center py-8"
        >
          Tidak ada data.
        </div>
        <div v-else class="flex flex-col divide-y divide-slate-100">
          <div
            v-for="order in dashboard.transaksiTerbaru"
            :key="order.id"
            class="py-3 flex items-center justify-between gap-2"
          >
            <div>
              <p class="text-sm font-semibold font-mono text-slate-700">
                {{ order.orderNumber.slice(-8) }}
              </p>
              <p class="text-xs text-muted">
                {{ formatDate(order.createdAt) }} · {{ order.userName }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                :color="order.paymentMethod === 'CASH' ? 'success' : 'info'"
                variant="subtle"
                size="sm"
              >
                {{ order.paymentMethod }}
              </UBadge>
              <span class="text-sm font-bold text-primary whitespace-nowrap">
                Rp {{ Number(order.totalAmount).toLocaleString("id-ID") }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
