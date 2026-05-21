<script setup>
import MainButton from "~/components/ui/BaseButton.vue";

const allItems = [
  {
    label: "Kasir",
    icon: "i-lucide-calculator",
    to: "/kasir",
    class: "text-lg",
  },
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    to: "/dashboard",
    class: "text-lg",
    adminOnly: true,
  },
  {
    label: "Produk",
    icon: "i-lucide-package",
    to: "/produk",
    class: "text-lg",
  },
  {
    label: "Barcode",
    icon: "i-lucide-barcode",
    to: "/barcode",
    class: "text-lg",
  },
  {
    label: "Kategori",
    icon: "i-lucide-tags",
    to: "/kategori",
    class: "text-lg",
    adminOnly: true,
  },
  {
    label: "Transaksi",
    icon: "i-lucide-receipt",
    to: "/transaksi",
    class: "text-lg",
  },
  {
    label: "Reports",
    icon: "i-lucide-bar-chart",
    to: "/reports",
    class: "text-lg",
    adminOnly: true,
  },
  {
    label: "Pengaturan",
    icon: "i-lucide-settings",
    to: "/pengaturan",
    class: "text-lg",
    adminOnly: true,
  },
];
const users = useUsersStore();
const auth = useAuthStore();
const toast = useToast();
const email = computed(() => users.profile?.email);
const name = computed(() => users.profile?.name);
const role = computed(() => users.profile?.role);

onMounted(async () => {
  await users.getProfile();
});

const items = computed(() => {
  if (role.value === "Admin") return allItems;
  return allItems.filter((item) => !item.adminOnly);
});

async function handleLogout() {
  await auth.logout();
  toast.add({ title: "Berhasil keluar.", color: "success" });
}

function navigation(route) {
  if (route === "kasir") {
    return "Kasir";
  }
  if (route === "dashboard") {
    return "Dashboard";
  }
  if (route === "produk") {
    return "Produk";
  }
  if (route === "kategori") {
    return "Kategori";
  }
  if (route === "transaksi") {
    return "Transaksi";
  }
  if (route === "reports") {
    return "Reports";
  }
  if (route === "pengaturan") {
    return "Pengaturan";
  }
  if (route === "barcode") {
    return "Barcode";
  }
}
</script>

<template>
  <UDashboardGroup class="bg-gray-50">
    <UDashboardSidebar toggle-side="right" class="bg-white">
      <template #header>
        <div class="flex items-center gap-2 py-2 w-full">
          <UIcon name="i-lucide-coffee" class="size-10 text-slate-700" />

          <div class="text-center">
            <h3 class="text-base font-bold text-slate-700 font-poppins">
              USAHID CAFE
            </h3>
            <p
              class="text-xs text-primary font-semibold font-poppins tracking-widest"
            >
              POINT OF SALE
            </p>
          </div>
        </div>
      </template>

      <UNavigationMenu :items="items" orientation="vertical" />

      <template #footer>
        <div class="flex flex-col gap-4 p-3 border-t border-default w-full">
          <div class="flex-1 min-w-0">
            <div class="flex gap-2">
              <p class="text-base font-semibold truncate">
                {{ name }}
              </p>
              <UBadge
                :color="role === 'Admin' ? 'secondary' : 'primary'"
                variant="subtle"
                class="text-xs"
                >{{ role }}</UBadge
              >
            </div>
            <p class="text-sm text-muted truncate">{{ email }}</p>
          </div>
          <MainButton
            :color="`error`"
            :variant="`solid`"
            :size="`md`"
            :block="true"
            :title="`Keluar`"
            @click="handleLogout()"
          />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar
          :title="navigation($route.name)"
          :ui="{
            title: 'text-2xl font-semibold text-primary font-poppins',
            root: 'bg-white',
          }"
        />
      </template>

      <template #body>
        <div class="w-full min-h-full font-poppins">
          <slot />
        </div>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
