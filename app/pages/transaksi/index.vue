<script setup>
import ModalStruk from "~/components/modal/ModalStruk.vue";

const orders = useOrdersStore();
const auth = useAuthStore();
const toast = useToast();

// ── Filter ──
const startDate = ref("");
const endDate = ref("");
const selectedMethod = ref("ALL");
const selectedStatus = ref("ALL");
const isDeleteOpen = ref(false);
const deleteStartDate = ref("");
const deleteEndDate = ref("");

const methodOptions = [
  { label: "Semua Metode", value: "ALL" },
  { label: "Cash", value: "CASH" },
  { label: "QRIS", value: "QRIS" },
];

const statusOptions = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Selesai", value: "COMPLETED" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

// ── Pagination ──
const page = ref(1);
const pageSize = 10;

// ── Struk Modal ──
const isStrukOpen = ref(false);
const selectedOrder = ref(null);
const users = useUsersStore();

onMounted(async () => {
  await users.fetchUsers();
  await users.getProfile();
});

function openStruk(order) {
  selectedOrder.value = order;
  isStrukOpen.value = true;
}

onMounted(async () => await orders.fetchOrders());

async function handleFilter() {
  const params = {};
  if (startDate.value) params.startDate = startDate.value;
  if (endDate.value) params.endDate = endDate.value;
  if (selectedMethod.value !== "ALL")
    params.paymentMethod = selectedMethod.value;
  if (selectedStatus.value !== "ALL") params.status = selectedStatus.value;
  page.value = 1;
  await orders.fetchOrders(params);
}

async function handleReset() {
  startDate.value = "";
  endDate.value = "";
  selectedMethod.value = "ALL";
  selectedStatus.value = "ALL";
  page.value = 1;
  await orders.fetchOrders();
}

// ── Cancel Order ──
const isCancelOpen = ref(false);
const cancelTarget = ref(null);

function openCancel(order) {
  cancelTarget.value = order;
  isCancelOpen.value = true;
}

async function confirmCancel() {
  if (cancelTarget.value) {
    const { success, message } = await orders.updateStatus(
      cancelTarget.value.id,
      "CANCELLED",
    );
    if (success) {
      toast.add({ title: "Order berhasil dibatalkan.", color: "success" });
    } else {
      toast.add({ title: message, color: "error" });
    }
  }
  isCancelOpen.value = false;
  cancelTarget.value = null;
}

// ── Computed ──
const paginatedOrders = computed(() => {
  const start = (page.value - 1) * pageSize;
  return orders.orders.slice(start, start + pageSize);
});

const totalPages = computed(() => Math.ceil(orders.orders.length / pageSize));

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusColor = {
  PENDING: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

const statusLabel = {
  PENDING: "Pending",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function openDelete() {
  isDeleteOpen.value = true;
}

async function confirmDelete() {
  if (!deleteStartDate.value || !deleteEndDate.value) {
    toast.add({ title: "Tanggal awal dan akhir wajib diisi.", color: "error" });
    return;
  }
  const { success, message, count } = await orders.deleteOrders(
    deleteStartDate.value,
    deleteEndDate.value,
  );
  if (success) {
    toast.add({ title: message, color: "success" });
    await orders.fetchOrders();
    isDeleteOpen.value = false;
    deleteStartDate.value = "";
    deleteEndDate.value = "";
  } else {
    toast.add({ title: message, color: "error" });
  }
}

// ── Visible page numbers ──
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  return [...pages].sort((a, b) => a - b);
});
</script>

<template>
  <!-- ── Modal: Hapus Transaksi ── -->
  <UModal v-model:open="isDeleteOpen" title="Hapus Transaksi">
    <template #body>
      <div class="flex flex-col gap-5">
        <div
          class="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
        >
          <UIcon
            name="i-lucide-triangle-alert"
            class="size-5 text-red-500 shrink-0 mt-0.5"
          />
          <p class="text-sm text-red-700 leading-relaxed">
            Pastikan transaksi pada rentang ini sudah
            <span class="font-semibold">diexport/diunduh</span>. Data yang
            dihapus <span class="font-semibold">tidak dapat dikembalikan</span>.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Dari Tanggal</label
            >
            <UInput type="date" v-model="deleteStartDate" size="md" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Sampai Tanggal</label
            >
            <UInput type="date" v-model="deleteEndDate" size="md" />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          label="Batal"
          @click="isDeleteOpen = false"
        />
        <UButton
          variant="solid"
          color="error"
          label="Hapus Sekarang"
          icon="i-lucide-trash-2"
          :loading="orders.loading"
          @click="confirmDelete"
        />
      </div>
    </template>
  </UModal>

  <div class="flex flex-col gap-6 p-1">
    <!-- ── Page Header ── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">
          Riwayat Transaksi
        </h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Kelola dan pantau semua transaksi penjualan
        </p>
      </div>
      <UButton
        v-if="users.profile && users.profile.role !== 'Karyawan'"
        variant="soft"
        color="error"
        size="sm"
        icon="i-lucide-trash-2"
        label="Hapus Transaksi"
        @click="openDelete"
      />
    </div>

    <!-- ── Filter Card ── -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 mb-1">
          <UIcon
            name="i-lucide-sliders-horizontal"
            class="size-4 text-slate-400"
          />
          <span
            class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >Filter Transaksi</span
          >
        </div>
        <div class="flex flex-col lg:flex-row lg:items-end gap-3">
          <!-- Tanggal -->
          <div class="flex flex-col sm:flex-row gap-2 flex-1">
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-xs font-medium text-slate-500"
                >Dari Tanggal</label
              >
              <UInput
                type="date"
                v-model="startDate"
                size="md"
                class="w-full"
              />
            </div>
            <div class="items-end pb-0.5 text-slate-300 hidden sm:block">
              <UIcon name="i-lucide-arrow-right" class="size-4 mb-2.5" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-xs font-medium text-slate-500"
                >Sampai Tanggal</label
              >
              <UInput type="date" v-model="endDate" size="md" class="w-full" />
            </div>
          </div>

          <!-- Divider vertical -->
          <div class="hidden lg:block w-px h-10 bg-slate-100 self-end mb-0.5" />

          <!-- Metode & Status -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-500"
                >Metode Bayar</label
              >
              <USelect
                :items="methodOptions"
                v-model="selectedMethod"
                size="md"
                class="w-full sm:w-44"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-500">Status</label>
              <USelect
                :items="statusOptions"
                v-model="selectedStatus"
                size="md"
                class="w-full sm:w-44"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 lg:self-end">
            <UButton
              variant="solid"
              color="primary"
              icon="i-lucide-search"
              label="Cari"
              @click="handleFilter"
              class="flex-1 lg:flex-none"
            />
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-rotate-ccw"
              label="Reset"
              @click="handleReset"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Table Card ── -->
    <div
      class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <!-- Table Header Bar -->
      <div
        class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100"
      >
        <div class="flex items-center gap-2">
          <div class="w-1.5 h-5 rounded-full bg-primary" />
          <span class="text-sm font-semibold text-slate-700">
            {{ orders.orders.length.toLocaleString("id-ID") }}
            <span class="font-normal text-slate-400">transaksi ditemukan</span>
          </span>
        </div>
        <span class="text-xs text-slate-400">
          Halaman <span class="font-semibold text-slate-600">{{ page }}</span> /
          {{ totalPages || 1 }}
        </span>
      </div>

      <!-- Loading -->
      <div
        v-if="orders.loading"
        class="flex flex-col items-center justify-center py-20 gap-3"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 text-primary animate-spin"
        />
        <p class="text-sm text-slate-400">Memuat transaksi...</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="orders.orders.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3 text-slate-400"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center"
        >
          <UIcon name="i-lucide-receipt" class="size-8 text-slate-300" />
        </div>
        <div class="text-center">
          <p class="text-sm font-medium text-slate-500">Tidak ada transaksi</p>
          <p class="text-xs text-slate-400 mt-0.5">
            Coba ubah filter atau tambah transaksi baru
          </p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                No. Transaksi
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                Waktu
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Kasir
              </th>
              <th
                class="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center"
              >
                Item
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                Total
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Metode
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="order in paginatedOrders"
              :key="order.id"
              class="hover:bg-slate-50/70 transition-colors duration-100 group"
            >
              <!-- No. Transaksi -->
              <td class="px-5 py-3.5">
                <span
                  class="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
                >
                  {{ order.orderNumber }}
                </span>
              </td>

              <!-- Waktu -->
              <td class="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                {{ formatDate(order.createdAt) }}
              </td>

              <!-- Kasir -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                  >
                    <UIcon name="i-lucide-user" class="size-3 text-primary" />
                  </div>
                  <span class="text-slate-600 text-sm">{{
                    order.user?.name ?? "-"
                  }}</span>
                </div>
              </td>

              <!-- Item -->
              <td class="px-5 py-3.5 text-center">
                <span
                  class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
                >
                  {{ order.items?.length ?? 0 }}
                </span>
              </td>

              <!-- Total -->
              <td class="px-5 py-3.5">
                <span class="font-bold text-slate-800 whitespace-nowrap">
                  Rp {{ Number(order.totalAmount).toLocaleString("id-ID") }}
                </span>
              </td>

              <!-- Metode -->
              <td class="px-5 py-3.5">
                <UBadge
                  :color="
                    order.paymentMethod === 'CASH' ? 'success' : 'secondary'
                  "
                  variant="subtle"
                  size="sm"
                  class="font-semibold tracking-wide"
                >
                  {{ order.paymentMethod }}
                </UBadge>
              </td>

              <!-- Status -->
              <td class="px-5 py-3.5">
                <UBadge
                  :color="statusColor[order.status]"
                  variant="subtle"
                  size="sm"
                >
                  <template #leading>
                    <span
                      :class="[
                        'inline-block w-1.5 h-1.5 rounded-full',
                        order.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : order.status === 'PENDING'
                            ? 'bg-yellow-500'
                            : 'bg-red-500',
                      ]"
                    />
                  </template>
                  {{ statusLabel[order.status] }}
                </UBadge>
              </td>

              <!-- Aksi -->
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-center gap-1.5">
                  <UButton
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    icon="i-lucide-printer"
                    label="Struk"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="openStruk(order)"
                  />
                  <UButton
                    v-if="order.status === 'PENDING'"
                    variant="ghost"
                    color="error"
                    size="xs"
                    icon="i-lucide-x"
                    label="Batal"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="openCancel(order)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination ── -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50"
      >
        <p class="text-xs text-slate-400 hidden sm:block">
          Menampilkan
          <span class="font-semibold text-slate-600"
            >{{ (page - 1) * pageSize + 1 }}–{{
              Math.min(page * pageSize, orders.orders.length)
            }}</span
          >
          dari
          <span class="font-semibold text-slate-600">{{
            orders.orders.length
          }}</span>
        </p>
        <div class="flex items-center gap-1">
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
            :disabled="page === 1"
            @click="page--"
          />
          <template v-for="(p, idx) in visiblePages" :key="p">
            <span
              v-if="idx > 0 && visiblePages[idx - 1] !== p - 1"
              class="text-slate-300 px-1 text-sm select-none"
              >···</span
            >
            <UButton
              :variant="p === page ? 'solid' : 'ghost'"
              :color="p === page ? 'primary' : 'neutral'"
              size="sm"
              :label="String(p)"
              @click="page = p"
              class="min-w-8"
            />
          </template>
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-right"
            :disabled="page === totalPages"
            @click="page++"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Struk -->
  <ModalStruk
    v-model="isStrukOpen"
    :order="selectedOrder"
    :nominal-bayar="
      selectedOrder?.totalAmount ? Number(selectedOrder.totalAmount) : 0
    "
  />

  <!-- Modal Cancel -->
  <UModal v-model:open="isCancelOpen" title="Batalkan Order">
    <template #body>
      <div
        class="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100"
      >
        <UIcon
          name="i-lucide-circle-alert"
          class="size-5 text-orange-500 shrink-0 mt-0.5"
        />
        <p class="text-sm text-orange-700 leading-relaxed">
          Yakin ingin membatalkan order
          <span class="font-bold text-slate-800">{{
            cancelTarget?.orderNumber
          }}</span
          >? Stok produk akan otomatis dikembalikan.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          label="Tidak"
          @click="isCancelOpen = false"
        />
        <UButton
          variant="solid"
          color="error"
          label="Ya, Batalkan"
          icon="i-lucide-x"
          @click="confirmCancel"
        />
      </div>
    </template>
  </UModal>
</template>
