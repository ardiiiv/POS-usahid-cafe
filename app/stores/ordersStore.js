import { defineStore } from "pinia";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    orders: [],
    cart: [],
    paymentMethod: "CASH",
    nominalBayar: 0,
    loading: false,
  }),

  getters: {
    totalCart: (state) =>
      state.cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      ),

    kembalian: (state) =>
      state.paymentMethod === "CASH"
        ? state.nominalBayar -
          state.cart.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0,
          )
        : 0,

    cartCount: (state) =>
      state.cart.reduce((sum, item) => sum + item.quantity, 0),
  },

  actions: {
    // ───── CART ─────
    addToCart(product) {
      const existing = this.cart.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return;
        existing.quantity++;
      } else {
        this.cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: 1,
        });
      }
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => item.productId !== productId);
    },

    updateQuantity(productId, quantity) {
      const item = this.cart.find((item) => item.productId === productId);
      if (!item) return;
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.stock) {
        item.quantity = quantity;
      }
    },

    clearCart() {
      this.cart = [];
      this.nominalBayar = 0;
      this.paymentMethod = "CASH";
    },

    setPaymentMethod(method) {
      this.paymentMethod = method;
    },

    setNominalBayar(nominal) {
      this.nominalBayar = nominal;
    },

    // ───── ORDERS ─────
    async createOrder() {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.post("/orders", {
          items: this.cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: this.paymentMethod,
        });

        this.clearCart();
        return { success: true, order: res.data.order };
      } catch (err) {
        const message = err.response?.data?.message || "Gagal membuat order.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async fetchOrders(params = {}) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.get("/orders", { params });
        this.orders = res.data.orders;
        return { success: true };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengambil orders.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async updateStatus(id, status) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.patch(`/orders/${id}`, { status });
        const index = this.orders.findIndex((o) => o.id === id);
        if (index !== -1) this.orders[index] = res.data.order;
        return { success: true, message: res.data.message };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal mengupdate status.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    async deleteOrders(startDate, endDate) {
      const { $api } = useNuxtApp();
      this.loading = true;
      try {
        const res = await $api.delete("/orders", {
          data: { startDate, endDate },
        });
        return {
          success: true,
          message: res.data.message,
          count: res.data.count,
        };
      } catch (err) {
        const message =
          err.response?.data?.message || "Gagal menghapus transaksi.";
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
  },
});
