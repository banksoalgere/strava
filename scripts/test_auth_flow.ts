
import 'dotenv/config';
import { SupabaseAdapter } from "../lib/custom-supabase-adapter";
import { supabase } from "../lib/supabase";

async function testAdapter() {
    console.log("Testing Custom Supabase Adapter...");

    const adapter = SupabaseAdapter(supabase);
    const testEmail = `test-${Date.now()}@example.com`;

    try {
        console.log(`Creating user with email: ${testEmail}`);
        const user = await adapter.createUser!({
            email: testEmail,
            emailVerified: new Date(),
            name: "Test User"
        } as any);

        console.log("User created successfully:", user);

        console.log("Fetching user by ID...");
        const retrievedUser = await adapter.getUser!(user.id);
        console.log("User retrieved:", retrievedUser);

        if (retrievedUser?.email !== testEmail) {
            throw new Error("Email mismatch!");
        }

        console.log("Cleaning up...");
        await adapter.deleteUser!(user.id);
        console.log("Cleanup successful.");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testAdapter();
