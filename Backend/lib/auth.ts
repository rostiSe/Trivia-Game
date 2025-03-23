import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../src/prismaClient";
 
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {  
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, token }, request) => {
            const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}?callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}/api/auth/verify-email?token=${token}`;
            await sendEmail({
                to: user.email,
                subject: 'Verify your email address',
                text: `Click the link to verify your email: ${verificationUrl}`
            })
        } 
    }
} satisfies BetterAuthOptions);