import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default defineEventHandler(async (event) => {
  try {
    const files = await readMultipartFormData(event);
    const file = files?.[0];

    if (!file) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "File tidak ditemukan." }),
      );
    }

    // validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heif",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.type)) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Hanya file JPG, PNG, dan WEBP yang diizinkan.",
        }),
      );
    }

    // validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.data.length > maxSize) {
      return sendError(
        event,
        createError({ statusCode: 400, message: "Ukuran file maksimal 2MB." }),
      );
    }

    // convert buffer ke base64
    const base64 = `data:${file.type};base64,${file.data.toString("base64")}`;

    // upload ke cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "pos-cafe/products",
    });

    setResponseStatus(event, 200);
    return { url: result.secure_url };
  } catch (error) {
    console.log(error);
    return sendError(
      event,
      createError({ statusCode: 500, message: "Gagal mengupload gambar." }),
    );
  }
});
