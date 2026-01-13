
import { SupabaseClient } from "@supabase/supabase-js"
import { Adapter, AdapterUser, AdapterAccount, AdapterSession } from "next-auth/adapters"

export function SupabaseAdapter(client: SupabaseClient): Adapter {
    return {
        async createUser(user: Omit<AdapterUser, 'id'>) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emailVerified, ...rest } = user;
            const { data, error } = await client
                .from("users")
                .insert({
                    ...rest,
                    email_verified: user.emailVerified,
                })
                .select()
                .single()

            if (error) throw error
            return {
                ...data,
                emailVerified: data.email_verified ? new Date(data.email_verified) : null,
            }
        },
        async getUser(id: string) {
            const { data, error } = await client
                .from("users")
                .select()
                .eq("id", id)
                .single()

            if (error) return null
            return {
                ...data,
                emailVerified: data.email_verified ? new Date(data.email_verified) : null,
            }
        },
        async getUserByEmail(email: string) {
            const { data, error } = await client
                .from("users")
                .select()
                .eq("email", email)
                .single()

            if (error) return null
            return {
                ...data,
                emailVerified: data.email_verified ? new Date(data.email_verified) : null,
            }
        },
        async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }) {
            const { data, error } = await client
                .from("accounts")
                .select("users!inner(*)")
                .eq("provider", provider)
                .eq("provider_account_id", providerAccountId)
                .single()

            if (error || !data?.users) return null
            // Helper to cast
            const user = data.users as any;
            return {
                ...user,
                emailVerified: user.email_verified ? new Date(user.email_verified) : null,
            }
        },
        async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { emailVerified, ...rest } = user;
            const updates: any = { ...rest };
            if (user.emailVerified) updates.email_verified = user.emailVerified;

            const { data, error } = await client
                .from("users")
                .update(updates)
                .eq("id", user.id!)
                .select()
                .single()

            if (error) throw error
            return {
                ...data,
                emailVerified: data.email_verified ? new Date(data.email_verified) : null,
            }
        },
        async deleteUser(userId: string) {
            const { error } = await client.from("users").delete().eq("id", userId)
            if (error) throw error
        },
        async linkAccount(account: AdapterAccount) {
            // Strava provider might return 'athlete' or other extra fields in the account object
            // We must strict-filter only the columns that exist in our 'accounts' table.
            const { error } = await client.from("accounts").insert({
                user_id: account.userId,
                type: account.type,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
            })
            if (error) throw error
            return account
        },
        async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }) {
            const { error } = await client
                .from("accounts")
                .delete()
                .eq("provider_account_id", providerAccountId)
                .eq("provider", provider)
            if (error) throw error
        },
        async createSession({ sessionToken, userId, expires }: { sessionToken: string, userId: string, expires: Date }) {
            console.log("Creating session:", sessionToken, userId, expires);
            const { data, error } = await client
                .from("sessions")
                .insert({
                    session_token: sessionToken,
                    user_id: userId,
                    expires,
                })
                .select()
                .single()

            if (error) throw error
            return {
                ...data,
                sessionToken: data.session_token,
                userId: data.user_id,
                expires: new Date(data.expires), // Convert string to Date
            }
        },
        async getSessionAndUser(sessionToken: string) {
            console.log("Getting session for token:", sessionToken);
            const { data, error } = await client
                .from("sessions")
                .select("*, users(*)")
                .eq("session_token", sessionToken)
                .single()

            if (error || !data) {
                console.log("Session lookup failed:", error);
                return null;
            }

            const { users: user, ...session } = data as any

            const result = {
                session: {
                    ...session,
                    sessionToken: session.session_token,
                    userId: session.user_id,
                    expires: new Date(session.expires), // Convert string to Date
                },
                user: {
                    ...user,
                    emailVerified: user.email_verified ? new Date(user.email_verified) : null,
                },
            };
            console.log("Session lookup success, returning:", result);
            return result;
        },
        async updateSession({ sessionToken }: { sessionToken: string } & Partial<AdapterSession>) {
            // Typically used to execute updates, but we might just return null if not needed? 
            // Actually NextAuth might call this.
            // Simplest implementation:
            const { data, error } = await client
                .from("sessions")
                .update({
                    session_token: sessionToken
                })
                .eq("session_token", sessionToken)
                .select()
                .single()

            if (error) return null

            return {
                ...data,
                sessionToken: data.session_token,
                userId: data.user_id,
                expires: new Date(data.expires), // Convert string to Date
            }
        },
        async deleteSession(sessionToken: string) {
            const { error } = await client
                .from("sessions")
                .delete()
                .eq("session_token", sessionToken)
            if (error) throw error
        },
        async createVerificationToken({ identifier, expires, token }: { identifier: string, expires: Date, token: string }) {
            const { data, error } = await client
                .from("verification_tokens")
                .insert({ identifier, expires, token })
                .select()
                .single()
            if (error) throw error
            return {
                ...data,
                expires: new Date(data.expires),
            }
        },
        async useVerificationToken({ identifier, token }: { identifier: string, token: string }) {
            const { data, error } = await client
                .from("verification_tokens")
                .delete()
                .eq("identifier", identifier)
                .eq("token", token)
                .select()
                .single()

            if (error) return null
            return {
                ...data,
                expires: new Date(data.expires),
            }
        },
    }
}
