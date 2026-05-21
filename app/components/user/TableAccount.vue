<script setup>
import { h, ref } from "vue";
import ModalConfirm from "../modal/ModalConfirm.vue";

const users = useUsersStore();
const auth = useAuthStore();

onMounted(async () => {
  await users.fetchUsers();
});

const data = computed(() => {
  return [...users.users].sort((a, b) => {
    if (a.id === auth.user?.id) return -1;
    if (b.id === auth.user?.id) return 1;
    return 0;
  });
});

// State untuk modal
const isOpen = ref(false);
const selectedRow = ref(null);

function openDeleteModal(row) {
  selectedRow.value = row;
  isOpen.value = true;
}

async function confirmDelete() {
  if (selectedRow.value) {
    await users.deleteUser(selectedRow.value.id);
  }
  isOpen.value = false;
  selectedRow.value = null;
}

const columns = [
  {
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => {
      const name = row.getValue("name");
      const isCurrentUser = row.original.id === auth.user?.id;

      return h("div", { class: "flex items-center gap-1" }, [
        h("span", name),
        isCurrentUser
          ? h("span", { class: "text-xs text-muted italic" }, "(anda)")
          : null,
      ]);
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const value = row.getValue("role");

      const color = {
        Admin: "secondary",
        Karyawan: "primary",
      }[value];

      return h(
        UBadge,
        {
          class: "capitalize",
          variant: "subtle",
          color,
        },
        () => value,
      );
    },
  },
  {
    accessorKey: "Aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const isCurrentUser = row.original.id === auth.user?.id;

      if (isCurrentUser) return null;

      return h(UButton, {
        color: "error",
        variant: "soft",
        icon: "i-lucide-trash",
        size: "md",
        onClick: () => openDeleteModal(row.original),
      });
    },
  },
];
</script>

<template>
  <UTable :data="data" :columns="columns" />

  <ModalConfirm
    v-model="isOpen"
    :name="selectedRow?.name"
    @confirm="confirmDelete"
  />
</template>
