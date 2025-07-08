// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User, SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../../../../lib/prisma"; // Asegúrate que esta ruta es correcta
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { AdapterUser } from "next-auth/adapters";

type UserWithHashedPassword = User & {
  hashedPassword?: string | null;
};

export const authOptions = {
  adapter: PrismaAdapter(prisma),

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

        return user as AdapterUser;
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin", // Tu ruta personalizada de login
  },

  debug: process.env.NODE_ENV === "development",

  session: {
    strategy: "jwt" as SessionStrategy, // 🔄 Cambiado de "database" a "jwt"
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
