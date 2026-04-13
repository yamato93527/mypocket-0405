import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "database",
  },
};