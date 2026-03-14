import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
  try {
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
      return {
        message: "Email dan Nama sudah terdaftar",
      };
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
      message: "Create user sukses",
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
    return {
      message: "terjadi Kesalahan server.",
    };
  }
});
