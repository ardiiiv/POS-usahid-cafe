<script setup>
import JsBarcode from "jsbarcode";
import NavigationProduct from "~/components/products/NavigationProduct.vue";

const product = useProductsStore();
const toast = useToast();

onMounted(async () => await product.fetchProducts());

const search = ref("");
const currentPage = ref(1);
const pageSize = 10;

const filteredProducts = computed(() =>
  product.products
    .filter((p) => p.name.toLowerCase().includes(search.value.toLowerCase()))
    .sort((a, b) => {
      if (!a.barcode && b.barcode) return -1;
      if (a.barcode && !b.barcode) return 1;
      return 0;
    }),
);

const totalPages = computed(() =>
  Math.ceil(filteredProducts.value.length / pageSize),
);

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

// Reset ke halaman 1 kalau search berubah
watch(search, () => {
  currentPage.value = 1;
});
// Jumlah print per produk
const printQuantities = reactive({});

function getQty(id) {
  return printQuantities[id] ?? 1;
}

function setQty(id, val) {
  printQuantities[id] = Math.max(1, Number(val));
}

// Generate EAN-13
function generateEAN13() {
  const digits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  );
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return [...digits, checkDigit].join("");
}

const loadingId = ref(null);
async function handleGenerate(p) {
  const barcode = generateEAN13();
  loadingId.value = p.id;
  const { success, message } = await product.updateProduct(p.id, { barcode });
  if (success) {
    toast.add({ title: "Barcode berhasil digenerate!", color: "success" });
  } else {
    toast.add({ title: message, color: "error" });
  }
  loadingId.value = null;
}

// Render barcode ke canvas
function renderBarcode(barcode, elementId) {
  nextTick(() => {
    const el = document.getElementById(elementId);
    if (el && barcode) {
      JsBarcode(el, barcode, {
        format: "EAN13",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 8,
      });
    }
  });
}

// Print barcode satu produk dengan jumlah tertentu
function handlePrint(p) {
  const qty = getQty(p.id);
  const canvas = document.getElementById(`barcode-${p.id}`);
  const imgData = canvas?.toDataURL("image/png");

  // Buat array label sejumlah qty
  const labels = Array.from({ length: qty })
    .map(
      () => `
      <div class="label">
        <p class="name">${p.name}</p>
        <img src="${imgData}" />
        <p class="price">Rp ${Number(p.price).toLocaleString("id-ID")}</p>
      </div>
    `,
    )
    .join("");

  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Barcode - ${p.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: sans-serif;
            padding: 10mm;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4mm;
          }
          .label {
            border: 1px dashed #ccc;
            border-radius: 4px;
            padding: 4mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2mm;
            page-break-inside: avoid;
          }
          .name {
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            word-break: break-word;
          }
          .price {
            font-size: 11px;
            text-align: center;
            color: #333;
          }
          img {
            width: 100%;
            max-width: 160px;
          }
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="grid">
          ${labels}
        </div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
</script>

<template>
  <section class="flex flex-col gap-6 p-1">
    <div class="flex md:flex-row flex-col md:justify-between md:gap-0 gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">Barcode</h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Generate dan cetak barcode produk
        </p>
      </div>

      <UInput
        icon="i-lucide-search"
        placeholder="Cari produk..."
        size="lg"
        v-model="search"
        class="w-full sm:w-72"
      />
    </div>

    <!-- Search -->

    <!-- Loading -->
    <div v-if="product.loading" class="flex justify-center py-16">
      <UIcon
        name="i-lucide-loader"
        class="animate-spin text-3xl text-primary"
      />
    </div>

    <!-- Table -->
    <div v-else class="rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="text-left px-4 py-3 font-semibold">Produk</th>
            <th class="text-left px-4 py-3 font-semibold">Barcode</th>
            <th class="text-left px-4 py-3 font-semibold">Preview</th>
            <th class="text-left px-4 py-3 font-semibold w-32">Jumlah Print</th>
            <th class="text-left px-4 py-3 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="p in paginatedProducts"
            :key="p.id"
            class="hover:bg-slate-50 transition"
          >
            <!-- Produk -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img
                  :src="
                    p.imageUrl ??
                    'https://res.cloudinary.com/dts9igkjv/image/upload/v1776869660/Not_avaliable_pyp8yu.png'
                  "
                  class="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p class="font-semibold">{{ p.name }}</p>
                  <p class="text-xs text-muted">{{ p.category.name }}</p>
                </div>
              </div>
            </td>

            <!-- Barcode number -->
            <td class="px-4 py-3">
              <span v-if="p.barcode" class="font-mono text-sm">{{
                p.barcode
              }}</span>
              <span v-else class="text-muted text-xs italic"
                >Belum ada barcode</span
              >
            </td>

            <!-- Preview -->
            <td class="px-4 py-3">
              <canvas
                v-if="p.barcode"
                :id="`barcode-${p.id}`"
                :key="p.barcode"
                :ref="(el) => el && renderBarcode(p.barcode, `barcode-${p.id}`)"
              />
              <span v-else class="text-muted text-xs italic">-</span>
            </td>

            <!-- Jumlah Print -->
            <td class="px-4 py-3">
              <UInput
                v-if="p.barcode"
                type="number"
                size="sm"
                min="1"
                :model-value="getQty(p.id)"
                @update:model-value="setQty(p.id, $event)"
                class="w-20"
              />
              <span v-else class="text-muted text-xs italic">-</span>
            </td>

            <!-- Aksi -->
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <UButton
                  v-if="!p.barcode"
                  size="sm"
                  variant="outline"
                  color="primary"
                  icon="i-lucide-zap"
                  label="Generate"
                  :loading="loadingId === p.id"
                  @click="handleGenerate(p)"
                />
                <UButton
                  v-if="p.barcode"
                  size="sm"
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-refresh-cw"
                  label="Regenerate"
                  :loading="loadingId === p.id"
                  @click="handleGenerate(p)"
                />
                <UButton
                  v-if="p.barcode"
                  size="sm"
                  variant="solid"
                  color="primary"
                  icon="i-lucide-printer"
                  label="Print"
                  @click="handlePrint(p)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex items-center justify-between mt-4 px-4 py-4">
        <p class="text-sm text-muted">
          Menampilkan
          {{
            filteredProducts.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1
          }}-{{
            Math.min(currentPage * pageSize, filteredProducts.length)
          }}
          dari {{ filteredProducts.length }} produk
        </p>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-left"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />
          <span class="text-sm flex items-center px-2">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <UButton
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-lucide-chevron-right"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>
      </div>
    </div>
  </section>
</template>
