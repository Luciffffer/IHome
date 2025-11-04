import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { UserService } from "@/services/UserService"
import { IUser } from "./models/User"

// Auth.js works with module augmentation :/
declare module "next-auth" {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends IUser {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AdapterUser extends IUser {}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                return null
            }
            
            try {
                const user = await UserService.verifyCredentials(
                    credentials.email?.toString(), 
                    credentials.password?.toString()
                );

                return user
            } catch (error) {
                console.error("Error during authentication:", error);
                return null;
            }
        }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/api/auth/logout',
  },
  callbacks: {
    async session({ session, token }) {
        session.user = {
            ...session.user,
            id: token.sub as string,
            firstName: (token.firstName || '') as string,
            lastName: (token.lastName || '') as string,
            email: token.email || '' as string,
            profilePicture: token.image?.toString() || '',
            role: token.role as "user" | "admin" || "user"
        };
        return session
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
            token.firstName = user.firstName;
            token.lastName = user.lastName;
            token.email = user.email;
            token.image = user.profilePicture;
            token.role = user.role;
        }
        return token;
    }
  }
})