import { NextAuthOptions, getServerSession } from 'next-auth';
import StravaProvider from 'next-auth/providers/strava';
import { SupabaseAdapter } from "@/lib/custom-supabase-adapter"
import { supabase } from "@/lib/supabase"
import { redirect } from 'next/navigation';

export const authOptions: NextAuthOptions = {
    adapter: SupabaseAdapter(supabase),
    providers: [
        StravaProvider({
            clientId: process.env.STRAVA_CLIENT_ID!,
            clientSecret: process.env.STRAVA_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'read,activity:read_all',
                    approval_prompt: 'force'
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.id = user.id;
            }
            return token;
        }
    },
    session: {
        strategy: 'database', // Use DB sessions to persist connection
    },
    pages: {
        // signIn: '/auth/signin', // Optional custom page
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// Helper to get session server-side
export async function getSession() {
    return await getServerSession(authOptions);
}

// Helper to enforce auth on server components/routes (Redirects)
export async function requireUser() {
    const session = await getSession();
    if (!session?.user) {
        redirect('/api/auth/signin');
    }
    return session.user;
}

// Helper for API routes (Returns null if no user)
export async function getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
}
