import NextAuth,{NextAuthOptions} from "next-auth"
import  CredentialsProvider  from "next-auth/providers/credentials"
import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"

export const authOptions:  NextAuthOptions = {
    providers:[
        CredentialsProvider({
            name: "Credentials",
            credentials:{
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials){
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if(!email || !password ){
                     throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where:{email}
                });

                if(!user) throw new Error("User not found");

                if(!user.isVerified){
                    throw new Error('please verify your email before logging in')
                }

                const isValid = await bcrypt.compare(password , user.password);
                if(!isValid) throw new Error("Invalid password");

                return {
                    id: user.id,
                    email: user.email
                };
            },
        }),
    ],

    session:{strategy:"jwt"},

    callbacks: {
        async jwt({ token , user}){
            if(user){
                token.id = user.id;
            }
            return token;
        },
        async session({session,token}){
            if(token && session.user){
                session.user.id = token.id as string
            }
            return session;
        }
    },

    pages: {
        signIn: "/auth/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export {handler as GET , handler as POST};