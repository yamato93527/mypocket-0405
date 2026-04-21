import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET;

if (!googleClientId || !googleClientSecret || !authSecret) {
  throw new Error(
    "Missing auth env vars. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and AUTH_SECRET.",
  );
}

const allowedGoogleEmails = (process.env.ALLOWED_GOOGLE_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
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
  secret: authSecret,
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return "/signin?error=AccessDenied";
      }

      // 許可メール未設定時は誤って全員ログインさせないため拒否
      if (allowedGoogleEmails.length === 0) {
        return "/signin?error=AccessDenied";
      }

      if (!allowedGoogleEmails.includes(email)) {
        return "/signin?error=AccessDenied";
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.name = user.name ?? session.user.name;
        session.user.email = user.email ?? session.user.email;
        session.user.image = user.image ?? session.user.image;
      }
      return session;
    },
  },
};