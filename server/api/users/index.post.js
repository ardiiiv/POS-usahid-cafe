import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user;

    // fetch role dari DB karena token hanya simpan id
    const me = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true },
    });

    // hanya admin yang boleh membuat akun
    if (me.role !== "Admin") {
      return sendError(
        event,
        createError({ statusCode: 403, message: "Anda tidak memiliki izin." }),
      );
    }
    const body = await readBody(event);
    const { name, email, password, role } = body;

    const existingUser = await prisma.user.findUnique({
      where: {
        name: name,
        email: email,
      },
    });

    if (existingUser) {
      setResponseStatus(event, 400);
      return sendError(
        event,
        createError({
          statusCode: 400,
          message: "Email dan Nama sudah terdaftar.",
        }),
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
        role: role,
      },
    });

    setResponseStatus(event, 201);
    return {
      message: "Berhasil menambahkan akun.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.log(error);
    setResponseStatus(event, 500);
    return sendError(
      event,
      createError({ statusCode: 500, message: "terjadi kesalahan server" }),
    );
  }
});
