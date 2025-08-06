// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session, User, SessionStrategy } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "../../../../lib/prisma"; // Asegúrate que esta ruta es correcta
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { Adapter } from "next-auth/adapters";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
