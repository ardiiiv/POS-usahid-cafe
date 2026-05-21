<script setup>
import BaseButton from "../ui/BaseButton.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
  nominalBayar: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function handlePrint() {
  window.print();
}
</script>

<template>
  <UModal
    :open="modelValue"
    @update:open="emit('update:modelValue', $event)"
    :ui="{ width: 'max-w-sm' }"
    title="Transaksi Berhasil"
  >
    <template #body>
      <div v-if="order" id="struk-print" class="flex flex-col gap-3 p-2">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-lg font-bold tracking-widest uppercase">
            Usahid Cafe
          </h2>
          <p class="text-xs text-muted">Struk Pembayaran</p>
          <p class="text-xs text-muted">{{ formatDate(order.createdAt) }}</p>
          <p class="text-xs text-muted font-mono">{{ order.orderNumber }}</p>
        </div>

        <hr class="border-dashed" />

        <!-- Items -->
        <div class="flex flex-col gap-1">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex justify-between text-sm"
          >
            <span class="flex-1">
              {{ item.productName || item.product?.name }} x{{ item.quantity }}
            </span>
            <span class="font-semibold">
              Rp
              {{
                (Number(item.priceAtTime) * item.quantity).toLocaleString(
                  "id-ID",
                )
              }}
            </span>
          </div>
        </div>

        <hr class="border-dashed" />

        <!-- Total -->
        <div class="flex flex-col gap-1">
          <div class="flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span
              >Rp {{ Number(order.totalAmount).toLocaleString("id-ID") }}</span
            >
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted">Bayar ({{ order.paymentMethod }})</span>
            <span>
              Rp
              {{
                order.paymentMethod === "CASH"
                  ? nominalBayar.toLocaleString("id-ID")
                  : Number(order.totalAmount).toLocaleString("id-ID")
              }}
            </span>
          </div>
          <div
            v-if="order.paymentMethod === 'CASH'"
            class="flex justify-between text-sm"
          >
            <span class="text-muted">Kembalian</span>
            <span class="text-green-600 font-semibold">
              Rp
              {{
                (nominalBayar - Number(order.totalAmount)).toLocaleString(
                  "id-ID",
                )
              }}
            </span>
          </div>
        </div>

        <hr class="border-dashed" />

        <!-- Footer -->
        <p class="text-center text-xs text-muted">
          — Terima kasih sudah berkunjung! 🧡 —
        </p>
        <p class="text-center text-xs text-muted">
          Oleh: {{ order.user?.name }}
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <BaseButton
          :variant="`outline`"
          :color="`neutral`"
          :title="`Tutup`"
          :block="true"
          @click="emit('update:modelValue', false)"
        />
        <BaseButton
          :variant="`solid`"
          :color="`primary`"
          :title="`Print Struk`"
          :icon="`i-lucide-printer`"
          :block="true"
          @click="handlePrint"
        />
      </div>
    </template>
  </UModal>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #struk-print,
  #struk-print * {
    visibility: visible;
  }
  #struk-print {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
}
</style>
