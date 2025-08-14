import { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";
import { Role, User } from "@prisma/client";
import bcrypt from "bcryptjs";

type UserWithHashedPassword = User & {
  hashedPassword?: string | null;
  role: Role;
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        const user: UserWithHashedPassword | null =
          await prisma.user.findUnique({
            where: { email: credentials.email },
          });

        if (!user || !user.hashedPassword) {
          throw new Error("Credenciales inválidas");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword,
        );

        if (!isCorrectPassword) {
          throw new Error("Credenciales inválidas");
        }

        const { hashedPassword, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
  },

  debug: process.env.NODE_ENV === "development",

  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 24 * 60 * 60, // 1 día
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Mantenemos el objeto session válido incluso si necesitamos forzar logout
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};
