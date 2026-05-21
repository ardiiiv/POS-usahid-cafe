<script setup>
import CardProducts from "~/components/products/CardProducts.vue";
import NavigationProduct from "~/components/products/NavigationProduct.vue";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseInput from "~/components/ui/BaseInput.vue";
import ModalStruk from "~/components/modal/ModalStruk.vue";

const product = useProductsStore();
const orders = useOrdersStore();
const toast = useToast();
const quickNominal = [5000, 10000, 20000, 50000, 100000];
const showStruk = ref(false);
const lastOrder = ref(null);
const lastNominalBayar = ref(0);
// Barcode scanner
let barcodeBuffer = "";
let lastKeyTime = 0;
let barcodeTimer = null;

onMounted(async () => {
  await product.fetchProducts();
  window.addEventListener("keydown", handleBarcodeInput);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleBarcodeInput);
});

function handleAddToCart(p) {
  if (p.stock === 0) {
    toast.add({ title: "Stok habis!", color: "error" });
    return;
  }
  orders.addToCart(p);
}

async function handlePayment() {
  if (orders.cart.length === 0) {
    toast.add({ title: "Keranjang kosong!", color: "error" });
    return;
  }

  if (
    orders.paymentMethod === "CASH" &&
    orders.nominalBayar < orders.totalCart
  ) {
    toast.add({ title: "Nominal bayar kurang!", color: "error" });
    return;
  }

  // Simpan nominal sebelum cart di-clear
  lastNominalBayar.value = orders.nominalBayar;

  const { success, message, order } = await orders.createOrder();

  if (success) {
    lastOrder.value = order;
    showStruk.value = true; // ← tampilkan modal struk
    await product.fetchProducts();
  } else {
    toast.add({ title: message, color: "error" });
  }
}

function handleBarcodeInput(e) {
  // Abaikan kalau focus di input field
  if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

  const now = Date.now();

  if (e.key === "Enter") {
    if (barcodeBuffer.length >= 8) {
      const found = product.products.find((p) => p.barcode === barcodeBuffer);
      if (found) {
        handleAddToCart(found);
      } else {
        toast.add({ title: "Produk tidak ditemukan!", color: "error" });
      }
    }
    barcodeBuffer = "";
    return;
  }

  // Reset buffer kalau jeda terlalu lama (ketikan manual)
  if (now - lastKeyTime > 50) barcodeBuffer = "";

  barcodeBuffer += e.key;
  lastKeyTime = now;
}
</script>

<template>
  <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Produk -->
    <div class="col-span-2 pb-6 flex flex-col gap-4">
      <div class="flex md:flex-row md:justify-between md:gap-0 flex-col gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-800 tracking-tight">Kasir</h1>
          <p class="text-sm text-slate-400 mt-0.5">
            Buat transaksi dan proses pembayaran
          </p>
        </div>
        <NavigationProduct />
      </div>

      <CardProducts>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BaseCard
            v-for="p in product.filteredProducts"
            :key="p.id"
            class="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            :class="p.stock === 0 ? 'opacity-50 pointer-events-none' : ''"
            @click="handleAddToCart(p)"
          >
            <div class="flex flex-col h-full">
              <div class="mb-2">
                <UBadge
                  color="primary"
                  variant="subtle"
                  class="font-poppins"
                  size="md"
                  :icon="p.category.icon"
                >
                  {{ p.category.name }}
                </UBadge>
              </div>

              <div class="overflow-hidden rounded-xl">
                <img
                  :src="
                    p.imageUrl ??
                    'https://res.cloudinary.com/dts9igkjv/image/upload/v1776869660/Not_avaliable_pyp8yu.png'
                  "
                  :alt="p.name"
                  class="w-full h-36 object-cover hover:scale-105 transition"
                />
              </div>

              <div class="flex-1 mt-3">
                <h3 class="text-base font-semibold font-poppins line-clamp-2">
                  {{ p.name }}
                </h3>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <p class="text-primary font-bold text-base">
                  Rp {{ Number(p.price).toLocaleString("id-ID") }}
                </p>
                <span
                  class="text-xs font-semibold px-2 py-1 rounded-lg"
                  :class="
                    p.stock === 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600'
                  "
                >
                  Stok {{ p.stock }}
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
      </CardProducts>
    </div>

    <!-- Cart -->
    <div
      class="w-full pb-4 lg:fixed lg:top-22 lg:right-8 lg:w-1/4 lg:h-[calc(100vh-88px)] lg:pb-6 lg:z-10"
    >
      <div
        class="bg-white rounded-xl border border-slate-300 h-full flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-center p-4 border-b border-slate-200"
        >
          <h3 class="font-semibold text-lg">
            Pesanan
            <span v-if="orders.cartCount > 0" class="text-primary"
              >({{ orders.cartCount }})</span
            >
          </h3>
          <BaseButton
            v-if="orders.cart.length > 0"
            variant="ghost"
            color="error"
            size="sm"
            title="Kosongkan"
            @click="orders.clearCart()"
          />
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div
            v-if="orders.cart.length === 0"
            class="flex flex-col items-center justify-center h-full text-muted gap-2"
          >
            <UIcon name="i-lucide-shopping-cart" class="text-4xl" />
            <p class="text-sm font-poppins">
              Pilih produk untuk mulai transaksi
            </p>
          </div>

          <div
            v-for="item in orders.cart"
            :key="item.productId"
            class="flex items-center gap-3 border border-slate-100 rounded-xl p-2"
          >
            <img
              :src="
                item.imageUrl ??
                'https://res.cloudinary.com/dts9igkjv/image/upload/v1776869660/Not_avaliable_pyp8yu.png'
              "
              :alt="item.name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">{{ item.name }}</p>
              <p class="text-primary text-sm font-bold">
                Rp
                {{
                  (Number(item.price) * item.quantity).toLocaleString("id-ID")
                }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <BaseButton
                variant="outline"
                color="neutral"
                size="xs"
                title=""
                icon="i-lucide-minus"
                @click="
                  orders.updateQuantity(item.productId, item.quantity - 1)
                "
              />
              <UInput
                type="number"
                size="xs"
                min="1"
                :max="item.stock"
                class="w-12 text-center"
                :model-value="item.quantity"
                @update:model-value="
                  orders.updateQuantity(item.productId, Number($event))
                "
              />
              <BaseButton
                variant="outline"
                color="neutral"
                size="xs"
                title=""
                icon="i-lucide-plus"
                :class="
                  item.quantity >= item.stock
                    ? 'opacity-50 pointer-events-none'
                    : ''
                "
                @click="
                  orders.updateQuantity(item.productId, item.quantity + 1)
                "
              />
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="p-4 border-t border-slate-200 flex flex-col gap-3">
          <!-- Metode Bayar -->
          <div class="grid grid-cols-2 gap-2">
            <BaseButton
              variant="solid"
              size="md"
              title="Cash"
              :color="orders.paymentMethod === 'CASH' ? 'primary' : 'neutral'"
              @click="orders.setPaymentMethod('CASH')"
            />
            <BaseButton
              variant="solid"
              size="md"
              title="QRIS"
              :color="orders.paymentMethod === 'QRIS' ? 'primary' : 'neutral'"
              @click="orders.setPaymentMethod('QRIS')"
            />
          </div>

          <!-- Nominal Bayar (Cash only) -->
          <div
            v-if="orders.paymentMethod === 'CASH'"
            class="flex flex-col gap-2"
          >
            <BaseInput
              type="number"
              title=""
              name="nominal"
              placeholder="Nominal bayar..."
              :model-value="
                orders.nominalBayar > 0 ? String(orders.nominalBayar) : ''
              "
              @update:model-value="orders.setNominalBayar(Number($event))"
            />
            <!-- Quick nominal -->
            <div class="flex flex-wrap gap-1">
              <BaseButton
                v-for="n in quickNominal"
                :key="n"
                variant="outline"
                color="neutral"
                size="xs"
                :title="`${(n / 1000).toFixed(0)}rb`"
                @click="orders.setNominalBayar(n)"
              />
              <BaseButton
                variant="outline"
                color="neutral"
                size="xs"
                title="Pas"
                @click="orders.setNominalBayar(orders.totalCart)"
              />
            </div>
            <!-- Kembalian -->
            <div
              v-if="orders.nominalBayar > 0"
              class="flex justify-between text-sm"
            >
              <span class="text-muted">Kembalian</span>
              <span
                class="font-semibold"
                :class="
                  orders.kembalian < 0 ? 'text-red-500' : 'text-green-600'
                "
              >
                Rp {{ orders.kembalian.toLocaleString("id-ID") }}
              </span>
            </div>
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted">Total</span>
            <span class="text-lg font-bold text-primary">
              Rp {{ orders.totalCart.toLocaleString("id-ID") }}
            </span>
          </div>

          <!-- Tombol Bayar -->
          <BaseButton
            variant="solid"
            color="primary"
            size="xl"
            :block="true"
            :title="orders.loading ? 'Memproses...' : 'Bayar Sekarang'"
            icon="i-lucide-credit-card"
            :class="
              orders.cart.length === 0 || orders.loading
                ? 'opacity-50 pointer-events-none'
                : ''
            "
            @click="handlePayment"
          />
        </div>
      </div>
    </div>
  </section>

  <ModalStruk
    v-model="showStruk"
    :order="lastOrder"
    :nominal-bayar="lastNominalBayar"
  />
</template>
