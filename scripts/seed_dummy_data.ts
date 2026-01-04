
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();

    if (!user) {
        console.log('No user found. Please create a user first (e.g. via login flow, or manually).');
        // Create a dummy user if none exists for testing
        const newUser = await prisma.user.create({
            data: {
                email: 'test@example.com',
                stravaId: 123456,
                accessToken: 'dummy_token',
                refreshToken: 'dummy_refresh',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        console.log('Created dummy user:', newUser.id);
        seedActivities(newUser.id);
    } else {
        console.log('Found user:', user.id);
        seedActivities(user.id);
    }
}

async function seedActivities(userId: string) {
    // Create a default goal if none
    let goal = await prisma.goal.findFirst({ where: { userId } });
    if (!goal) {
        goal = await prisma.goal.create({
            data: {
                userId,
                type: 'any',
                target: 100,
                penalty: 10,
                startDate: new Date(),
                isActive: true,
            },
        });
    }

    // Clear existing activities
    await prisma.activity.deleteMany({ where: { goalId: goal.id } });
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
            stravaId: BigInt(Date.now() + i),
            goalId: goal.id,
            type: 'Run',
            distance,
            movingTime: Math.round(duration),
            totalElevationGain: elevation,
            averageSpeed: avgSpeed,
            maxSpeed: maxSpeed,
            averageHeartrate: avgHr,
            maxHeartrate: maxHr,
            calories: Math.round(calories),
            startDate: date,
        });
    }

    for (const act of activities) {
        await prisma.activity.create({ data: act });
    }

    console.log(`Seeded ${activities.length} activities with rich data.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
