import bcrypt from "bcrypt";
import { setCookie } from "h3";
import { generateRefreshToken, generateToken } from "~~/server/utils/token";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = body;

    // cek user
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      setResponseStatus(event, 401);
      return { message: "Email atau Password salah." };
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      setResponseStatus(event, 401);
      return { message: "Email atau Password salah." };
    }

    // buat token
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // mencegah penumpukan refresh token
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // buat data refresh token baru
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // set cookie
    setCookie(event, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // response
    setResponseStatus(event, 200);
    return {
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: accessToken,
    };
  } catch (error) {
    console.log(error);
    setResponseStatus(event, 500);
    return {
      message: "Terjadi kesalahan server.",
    };
  }
});
