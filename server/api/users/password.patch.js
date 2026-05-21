import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;
    const body = await readBody(event);
    const { currentPassword, newPassword, confirmPassword } = body;

    // validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
      setResponseStatus(event, 400);
      return { message: "Semua field wajib diisi." };
    }

    if (newPassword.length < 6) {
      setResponseStatus(event, 400);
      return { message: "Password baru minimal 6 karakter." };
    }

    if (newPassword !== confirmPassword) {
      setResponseStatus(event, 400);
      return { message: "Konfirmasi password tidak cocok." };
    }

    // ambil user dari database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      setResponseStatus(event, 404);
      return { message: "User tidak ditemukan." };
    }

    // cek password lama
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      setResponseStatus(event, 401);
      return { message: "Password saat ini salah." };
    }

    // cegah password baru sama dengan password lama
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      setResponseStatus(event, 400);
      return {
        message: "Password baru tidak boleh sama dengan password lama.",
      };
    }

    // hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    // hapus semua refresh token agar user login ulang di semua device
    await prisma.refreshToken.deleteMany({
      where: { userId: currentUser.id },
    });

    setResponseStatus(event, 200);
    return { message: "Password berhasil diubah. Silakan login kembali." };
  } catch (error) {
    console.log(error);
    setResponseStatus(event, 500);
    return { message: "Terjadi kesalahan server." };
  }
});
