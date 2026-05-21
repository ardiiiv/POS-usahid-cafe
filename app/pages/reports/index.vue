<script setup>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const reports = useReportsStore();
const isExportOpen = ref(false);

// ── Filter Tanggal ──
const startDate = ref(
  new Date(new Date().setDate(new Date().getDate() - 30))
    .toISOString()
    .slice(0, 10),
);
const endDate = ref(new Date().toISOString().slice(0, 10));

onMounted(async () => {
  await reports.fetchReports({
    startDate: startDate.value,
    endDate: endDate.value,
  });
});

// ── Chart Pendapatan per Kategori ──
const chartData = computed(() => ({
  labels: reports.pendapatanPerKategori.map((k) => k.name),
  datasets: [
    {
      label: "Pendapatan",
      data: reports.pendapatanPerKategori.map((k) => k.total),
      backgroundColor: "rgba(234, 179, 8, 0.8)",
      borderRadius: 6,
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
        callback: (val) => {
          if (val >= 1000000) return `${val / 1000000}jt`;
          if (val >= 1000) return `${val / 1000}k`;
          return val;
        },
      },
      grid: { color: "rgba(0,0,0,0.05)" },
    },
    x: { grid: { display: false } },
  },
};

// ── Export Excel ──
function exportExcel() {
  // Buat CSV sederhana dulu, nanti bisa upgrade ke xlsx
  const rows = [
    ["No. Transaksi", "Tanggal", "Oleh", "Total", "Metode"],
    ...reports.detailTransaksi.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString("id-ID"),
      o.userName,
      Number(o.totalAmount),
      o.paymentMethod,
    ]),
  ];

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-${startDate.value}-${endDate.value}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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
  <section class="flex flex-col gap-6 pb-8">
    <!-- Container 1: Filter + Export -->
    <div class="flex lg:flex-row lg:justify-between flex-col gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">Laporan</h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Analisis pendapatan dan performa penjualan
        </p>
      </div>
      <div class="flex lg:flex-row flex-col lg:items-end gap-3">
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
          :loading="reports.loading"
          @click="reports.fetchReports({ startDate, endDate })"
        />
        <UButton
          variant="solid"
          color="success"
          icon="i-lucide-file-spreadsheet"
          label="Export Excel"
          block
          @click="isExportOpen = true"
        />
      </div>
    </div>

    <!-- Container 2: Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-circle-dollar-sign" class="size-5" />
          <span>Total Pendapatan</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          Rp {{ Number(reports.totalPendapatan).toLocaleString("id-ID") }}
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
          {{ reports.totalTransaksi }}
        </p>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-banknote-arrow-up" class="size-5" />
          <span>Pendapatan Cash</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          Rp {{ Number(reports.pendapatanCash).toLocaleString("id-ID") }}
        </p>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2"
      >
        <div class="flex items-center gap-2 text-muted text-sm">
          <UIcon name="i-lucide-scan-qr-code" class="size-5" />
          <span>Pendapatan QRIS</span>
        </div>
        <p class="text-2xl font-bold text-slate-800">
          Rp {{ Number(reports.pendapatanQris).toLocaleString("id-ID") }}
        </p>
      </div>
    </div>

    <!-- Container 3: Chart + Top 10 Produk -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Chart Pendapatan per Kategori -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
      >
        <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
          <UIcon name="i-lucide-chart-column-big" class="size-6" /> Pendapatan
          per Kategori
        </h2>
        <div v-if="reports.loading" class="flex justify-center py-16">
          <UIcon
            name="i-lucide-loader-circle"
            class="animate-spin text-primary size-8"
          />
        </div>
        <div
          v-else-if="reports.pendapatanPerKategori.length === 0"
          class="text-center text-muted text-sm py-16"
        >
          Tidak ada data.
        </div>
        <div v-else class="h-64">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Top 10 Produk Terlaris -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3"
      >
        <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
          <UIcon name="i-lucide-trophy" class="size-6" /> Top 10 Produk Terlaris
        </h2>
        <div v-if="reports.loading" class="flex justify-center py-16">
          <UIcon
            name="i-lucide-loader-circle"
            class="animate-spin text-primary size-8"
          />
        </div>
        <div
          v-else-if="reports.top10Produk.length === 0"
          class="text-center text-muted text-sm py-16"
        >
          Tidak ada data.
        </div>
        <div
          v-else
          class="flex flex-col divide-y divide-slate-100 overflow-y-auto max-h-64"
        >
          <div
            v-for="(p, index) in reports.top10Produk"
            :key="p.id"
            class="flex items-center justify-between py-2 gap-2"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-muted w-6"
                >#{{ index + 1 }}</span
              >
              <span class="text-sm font-medium text-slate-700">{{
                p.name
              }}</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-sm font-bold text-primary">
                Rp {{ Number(p.total).toLocaleString("id-ID") }}
              </span>
              <span class="text-xs text-muted">{{ p.quantity }}×</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Container 4: Detail Transaksi -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-700 flex gap-2 items-center">
          <UIcon name="i-lucide-receipt-text" class="size-6" /> Detail Transaksi
          ({{ reports.totalTransaksi }})
        </h2>
      </div>

      <div v-if="reports.loading" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-circle"
          class="animate-spin text-primary size-8"
        />
      </div>

      <div
        v-else-if="reports.detailTransaksi.length === 0"
        class="text-center text-muted text-sm py-16"
      >
        Tidak ada transaksi.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-muted uppercase"
              >
                No. Transaksi
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-muted uppercase"
              >
                Tanggal
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-muted uppercase"
              >
                Oleh
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-muted uppercase"
              >
                Total
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-muted uppercase"
              >
                Metode
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="order in reports.detailTransaksi"
              :key="order.id"
              class="hover:bg-slate-50 transition"
            >
              <td
                class="px-5 py-3 font-mono text-xs font-semibold text-slate-700"
              >
                {{ order.orderNumber }}
              </td>
              <td class="px-5 py-3 text-slate-600 whitespace-nowrap">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-5 py-3 text-slate-600">
                {{ order.userName }}
              </td>
              <td
                class="px-5 py-3 font-semibold text-primary whitespace-nowrap"
              >
                Rp {{ Number(order.totalAmount).toLocaleString("id-ID") }}
              </td>
              <td class="px-5 py-3">
                <UBadge
                  :color="order.paymentMethod === 'CASH' ? 'success' : 'info'"
                  variant="subtle"
                  size="sm"
                >
                  {{ order.paymentMethod }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Modal Confirm Export -->
    <UModal v-model:open="isExportOpen" title="Export Excel">
      <template #body>
        <div class="flex flex-col gap-3">
          <p class="text-sm text-slate-600">
            Pastikan rentang tanggal sudah sesuai sebelum export:
          </p>
          <div class="bg-slate-50 rounded-xl p-3 flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted">Dari Tanggal</span>
              <span class="font-semibold text-slate-700">
                {{
                  new Date(startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted">Sampai Tanggal</span>
              <span class="font-semibold text-slate-700">
                {{
                  new Date(endDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted">Total Transaksi</span>
              <span class="font-semibold text-slate-700"
                >{{ reports.totalTransaksi }} transaksi</span
              >
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted">Total Pendapatan</span>
              <span class="font-semibold text-primary">
                Rp {{ Number(reports.totalPendapatan).toLocaleString("id-ID") }}
              </span>
            </div>
          </div>
          <p class="text-xs text-muted">
            Sudah sesuai? Klik Export untuk mengunduh file.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="outline"
            color="neutral"
            label="Batal"
            @click="isExportOpen = false"
          />
          <UButton
            variant="solid"
            color="success"
            icon="i-lucide-file-spreadsheet"
            label="Ya, Export"
            @click="
              () => {
                exportExcel();
                isExportOpen = false;
              }
            "
          />
        </div>
      </template>
    </UModal>
  </section>
</template>
