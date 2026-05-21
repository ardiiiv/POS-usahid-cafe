import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;

    const me = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });

    if (me.role !== "Admin") {
      return sendError(
        event,
        createError({ statusCode: 403, message: "Anda tidak memiliki izin." }),
      );
    }

    const body = await readBody(event);
    const { imageUrl } = body;

    if (!imageUrl) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "imageUrl wajib diisi." }),
      );
    }

    // Validasi URL berasal dari Cloudinary
    if (!imageUrl.includes("cloudinary.com")) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "URL bukan dari Cloudinary." }),
      );
    }

    // Ekstrak public_id dari URL Cloudinary
    // Contoh URL: https://res.cloudinary.com/<cloud>/image/upload/v123/pos-cafe/products/abc.jpg
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    // Ambil semua path setelah "upload/vXXXX/" atau "upload/"
    const afterUpload = urlParts.slice(uploadIndex + 1);
    // Jika ada version (v1234567), lewati
    const pathParts = afterUpload[0]?.startsWith("v")
      ? afterUpload.slice(1)
      : afterUpload;
    const publicId = pathParts.join("/").replace(/\.[^/.]+$/, ""); // hapus ekstensi

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return sendError(
        event,
        createError({ statusCode: 500, message: "Gagal menghapus gambar." }),
      );
    }

    setResponseStatus(event, 200);
    return { message: "Gambar berhasil dihapus." };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Terjadi kesalahan server." }),
    );
  }
});
