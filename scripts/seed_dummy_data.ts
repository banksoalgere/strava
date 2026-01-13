
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded if running locally without Next.js wrap
// You might need to run: export $(xargs < .env) && npx tsx scripts/seed_dummy_data.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: user, error } = await supabase.from('users').select('*').limit(1).single();

    if (!user) {
        console.log('No user found. Creating a dummy user...');
        // Create a dummy user if none exists for testing
        const { data: newUser, error: createError } = await supabase.from('users').insert({
            email: 'test@example.com',
            strava_id: 123456,
            access_token: 'dummy_token',
            refresh_token: 'dummy_refresh',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }).select().single();

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }

        console.log('Created dummy user:', newUser.id);
        await seedActivities(newUser.id);
    } else {
        console.log('Found user:', user.id);
        await seedActivities(user.id);
    }
}

async function seedActivities(userId: string) {
    // Create a default goal if none
    let { data: goal } = await supabase.from('goals').select('*').eq('user_id', userId).limit(1).single();

    if (!goal) {
        const { data: newGoal, error } = await supabase.from('goals').insert({
            user_id: userId,
            type: 'any',
            target: 100,
            penalty: 10,
            start_date: new Date().toISOString(),
            is_active: true, // Assuming default true, but explicit here
            frequency: 'weekly', // Add required field
        }).select().single();

        if (error) {
            console.error('Error creating goal:', error);
            return;
        }
        goal = newGoal;
    }

    // Clear existing activities
    await supabase.from('activities').delete().eq('goal_id', goal.id);
    console.log('Cleared existing activities');

    const activities = [];
    const now = new Date();

    // Generate 20 activities over last 30 days
    for (let i = 0; i < 20; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 1.5); // Spread out

        // Random stats
        const distance = 5000 + Math.random() * 15000; // 5km - 20km
        const duration = (distance / 1000) * (5 + Math.random() * 2) * 60; // 5-7 min/km
        const elevation = Math.random() * 500; // 0-500m
        const avgSpeed = distance / duration;
        const maxSpeed = avgSpeed * (1.2 + Math.random() * 0.5);
        const avgHr = 130 + Math.random() * 40; // 130-170 bpm
        const maxHr = avgHr + 10 + Math.random() * 20;
        const calories = duration / 60 * (600 + Math.random() * 400); // ~600-1000 kcal/hr

        activities.push({
            strava_id: Date.now() + i, // Use number, safe in JS
            goal_id: goal.id,
            type: 'Run',
            distance,
            moving_time: Math.round(duration),
            total_elevation_gain: elevation,
            average_speed: avgSpeed,
            max_speed: maxSpeed,
            average_heartrate: avgHr,
            max_heartrate: maxHr,
            calories: Math.round(calories),
            start_date: date.toISOString(),
        });
    }

    const { error: insertError } = await supabase.from('activities').insert(activities);

    if (insertError) {
        console.error('Error seeding activities:', insertError);
    } else {
        console.log(`Seeded ${activities.length} activities with rich data.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
