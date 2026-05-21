export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;
    const { id: targetUserId } = event.context.params;

    // fetch role dari DB karena token hanya simpan id
    const me = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });

    // hanya admin yang boleh menghapus akun
    if (me.role !== "Admin") {
      setResponseStatus(event, 403);
      return { message: "Anda tidak memiliki izin untuk menghapus akun." };
    }

    // admin tidak boleh menghapus dirinya sendiri
    if (targetUserId === currentUser.id) {
      setResponseStatus(event, 403);
      return { message: "Anda tidak dapat menghapus akun Anda sendiri." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      setResponseStatus(event, 404);
      return { message: "Akun yang ingin dihapus tidak ditemukan." };
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    setResponseStatus(event, 200);
    return { message: `Akun ${targetUser.name} berhasil dihapus.` };
  } catch (error) {
    console.log(error);
    setResponseStatus(event, 500);
    return { message: "Terjadi kesalahan server." };
  }
});
