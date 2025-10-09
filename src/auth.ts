import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { UserService } from "@/services/UserService"
 
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
  }
})