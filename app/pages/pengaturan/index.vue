<script setup>
import FormChangePassword from "~/components/auth/FormChangePassword.vue";
import ModalForm from "~/components/modal/ModalForm.vue";
import FormCreateUser from "~/components/user/FormCreateUser.vue";
import TableAccount from "~/components/user/TableAccount.vue";
import BaseButton from "../../components/ui/BaseButton.vue";

const users = useUsersStore();
const auth = useAuthStore();

onMounted(async () => {
  await users.fetchUsers();
  await users.getProfile();
});

const open = ref(false);
const getAllUser = computed(() => users.totalUsers);
</script>

<template>
  <div class="flex flex-col gap-6 p-1">
    <div class="grid lg:grid-cols-2 grid-cols-1 gap-6">
      <!-- Ubah Password -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div class="p-2 bg-primary/10 rounded-xl">
            <UIcon name="i-lucide-lock-keyhole" class="size-6 text-primary" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-800">
              Ubah Password
            </h3>
            <p class="text-xs text-muted">Perbarui kata sandi akun kamu</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <FormChangePassword />
        </div>
      </section>

      <!-- Manajemen Akun (Admin only) -->
      <section class="flex flex-col gap-4">
        <div
          class="flex items-center justify-between pb-2 border-b border-slate-100"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-secondary/10 rounded-xl">
              <UIcon name="i-lucide-users" class="size-6 text-secondary" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-800">
                Manajemen Akun
              </h3>
              <p class="text-xs text-muted">{{ getAllUser }} akun terdaftar</p>
            </div>
          </div>
          <ModalForm v-model="open" title="Tambah Akun Baru">
            <template #trigger>
              <BaseButton
                variant="solid"
                size="md"
                icon="i-lucide-plus"
                title="Tambah Akun"
                @click="open = true"
              />
            </template>
            <FormCreateUser @close="open = false" />
          </ModalForm>
        </div>

        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div
            class="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-slate-100"
          >
            <UIcon name="i-lucide-circle-user" class="size-4 text-primary" />
            <p class="text-xs text-slate-600">
              Login sebagai
              <span class="font-semibold text-slate-800">{{
                auth.user?.name
              }}</span>
              <UBadge
                :color="auth.user?.role === 'Admin' ? 'secondary' : 'primary'"
                variant="subtle"
                size="sm"
                class="ml-1"
                >{{ auth.user?.role }}</UBadge
              >
            </p>
          </div>
          <div class="p-2">
            <TableAccount />
          </div>
        </div>
      </section>

      <!-- Info Profil (Karyawan only) -->
      <!-- <section v-else class="flex flex-col gap-4">
        <div class="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div class="p-2 bg-primary/10 rounded-xl">
            <UIcon name="i-lucide-circle-user" class="size-6 text-primary" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-800">
              Informasi Akun
            </h3>
            <p class="text-xs text-muted">Detail akun kamu</p>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div
            class="flex flex-col items-center gap-3 py-8 bg-primary/5 border-b border-slate-100"
          >
            <div
              class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <UIcon name="i-lucide-user" class="size-8 text-primary" />
            </div>
            <div class="text-center">
              <p class="text-lg font-bold text-slate-800">
                {{ auth.user?.name }}
              </p>
              <UBadge color="primary" variant="subtle" size="md" class="mt-1">
                {{ auth.user?.role }}
              </UBadge>
            </div>
          </div>

          <div class="flex flex-col divide-y divide-slate-100">
            <div class="flex items-center gap-3 px-5 py-4">
              <UIcon name="i-lucide-mail" class="size-4 text-muted shrink-0" />
              <div>
                <p class="text-xs text-muted">Email</p>
                <p class="text-sm font-semibold text-slate-800">
                  {{ auth.user?.email }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 px-5 py-4">
              <UIcon
                name="i-lucide-shield"
                class="size-4 text-muted shrink-0"
              />
              <div>
                <p class="text-xs text-muted">Role</p>
                <p class="text-sm font-semibold text-slate-800">
                  {{ auth.user?.role }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 px-5 py-4">
              <UIcon name="i-lucide-info" class="size-4 text-muted shrink-0" />
              <div>
                <p class="text-xs text-muted">Akses</p>
                <p class="text-sm font-semibold text-slate-800">
                  Kasir, tambah stok, lihat dashboard & laporan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> -->
    </div>
  </div>
</template>
