import { AuthOptions, DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/user";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      telefon: string;
      tabela: string;
      adres: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser, UserType {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    telefon: string;
    tabela: string;
    adres: string;
  }
}

interface UserType {
  id: string;
  telefon: string;
  tabela: string;
  name: string;
  isAdmin: boolean;
  adres: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        telefon: { label: "Telefon", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials): Promise<UserType | null> {
        if (!credentials?.telefon || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          const user = await User.findOne({ telefon: credentials.telefon });
          
          if (!user) {
            throw new Error("Kullanıcı bulunamadı");
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValid) {
            throw new Error("Hatalı şifre");
          }

          return {
            id: user._id.toString(),
            telefon: user.telefon,
            tabela: user.tabela,
            name: `${user.ad} ${user.soyad}`,
            isAdmin: user.isAdmin,
            adres: user.adres,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Bir hata oluştu");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.telefon = user.telefon;
        token.tabela = user.tabela;
        token.adres = user.adres;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.telefon = token.telefon;
        session.user.tabela = token.tabela;
        session.user.adres = token.adres;
      }
      return session;
    },
  },
  pages: {
    signIn: "/giris",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 