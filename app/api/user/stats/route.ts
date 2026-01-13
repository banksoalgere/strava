import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateLinearRegression, calculateCorrelation, predictRaceTime } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth';

interface Activity {
    id: string;
    strava_id: number;
    type: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number | null;
    calories: number | null;
    average_heartrate: number | null;
    max_heartrate: number | null;
    max_speed: number | null;
    start_date: string;
}

interface Goal {
    activities: Activity[];
}

interface UserWithGoals {
    id: string;
    goals: Goal[];
}

export async function GET() {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get most recent user (in real app, use auth session)
    const { data: userRaw, error } = await supabase
        .from('users')
        .select(`
            *,
            activities:activities(*),
            goals:goals (
                *
            )
        `)
        .eq('id', sessionUser.id)
        .single();

    const user = userRaw as unknown as (UserWithGoals & { activities: Activity[] }) | null;

    if (!user) {
        return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Use all user activities directly
    const allActivities = user.activities || [];

    // Filter for RUNNING activities only and remove outliers
    const activities = allActivities.filter(a => {
        // Strict check for running activities
        if (a.type !== 'Run') return false;

        if (a.distance <= 0 || a.moving_time <= 0) return false;
        const pace = (a.moving_time / 60) / (a.distance / 1000);

        // Allow slightly faster pace (world record 5k is ~2:30/km, sprinting can be faster)
        // 1.5 min/km = 40 km/h. Good upper bound.
        return pace > 1.5 && a.distance > 0;
    });

    if (activities.length === 0) {
        return NextResponse.json({
            lifetime: { distance: 0, time: 0, activities: 0, avgPace: 0 },
            weekly: [],
            monthly: [],
            consistency: { score: 0, activeWeeks: 0, totalWeeks: 0 },
            streaks: { current: 0, longest: 0 },
            dayOfWeek: [],
            hourOfDay: [],
            paceZones: [],
            recentActivities: [],
            personalRecords: { fastestPace: null, longestRun: null, longestTime: null },
        });
    }

    // Sort activities by date
    const sortedActivities = [...activities].sort((a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    // --- LIFETIME STATS ---
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0); // meters
    const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0); // seconds
    const totalElevation = activities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0); // meters
    const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0); // kcal

    // Heart Rate Calculations (Weighted by time)
    const hrActivities = activities.filter(a => a.average_heartrate != null && a.moving_time > 0);
    const totalHrTime = hrActivities.reduce((sum, a) => sum + a.moving_time, 0);
    const weightedHrSum = hrActivities.reduce((sum, a) => sum + (a.average_heartrate! * a.moving_time), 0);
    const avgHeartRate = totalHrTime > 0 ? Math.round(weightedHrSum / totalHrTime) : null;
    const maxHeartRate = activities.reduce((max, a) => Math.max(max, a.max_heartrate || 0), 0);

    const maxSpeed = activities.reduce((max, a) => Math.max(max, a.max_speed || 0), 0); // m/s
    const avgPace = totalTime > 0 ? (totalTime / 60) / (totalDistance / 1000) : 0; // min/km

    // --- ANALYTICS ---
    // Limit range to last 6 months for relevant trend analysis
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentActivitiesForAnalytics = sortedActivities.filter(a => new Date(a.start_date) > sixMonthsAgo);

    const paceData = recentActivitiesForAnalytics
        .filter(a => a.distance > 0 && a.moving_time > 0)
        .map(a => ({
            date: new Date(a.start_date),
            value: (a.moving_time / 60) / (a.distance / 1000)
        }));

    // Regression: Is pace improving?
    const paceTrend = calculateLinearRegression(paceData);

    // Correlation: HR vs Pace
    const hrPaceData = recentActivitiesForAnalytics
        .filter(a => a.average_heartrate && a.distance > 0)
        .map(a => ({
            hr: a.average_heartrate!,
            pace: (a.moving_time / 60) / (a.distance / 1000)
        }));

    const hrCorrelation = calculateCorrelation(
        hrPaceData.map(d => d.hr),
        hrPaceData.map(d => d.pace)
    );

    // Predictions (based on best recent effort > 4km)
    // Filter out sprints/short runs (< 4km) which extrapolate to unrealistic marathon times
    const predictionActivities = sortedActivities.filter(a => a.distance >= 4000);

    const bestEffort = predictionActivities.length > 0
        ? predictionActivities.sort((a, b) => ((a.moving_time / a.distance) - (b.moving_time / b.distance)))[0]
        : null;

    const predictions = bestEffort ? {
        p5k: predictRaceTime(bestEffort.distance / 1000, bestEffort.moving_time / 60, 5),
        p10k: predictRaceTime(bestEffort.distance / 1000, bestEffort.moving_time / 60, 10),
        pHalf: predictRaceTime(bestEffort.distance / 1000, bestEffort.moving_time / 60, 21.1),
        pMarathon: predictRaceTime(bestEffort.distance / 1000, bestEffort.moving_time / 60, 42.2),
    } : null;

    // --- WEEKLY BREAKDOWN (last 12 weeks) ---
    const now = new Date();
    const weeklyData: { week: string; distance: number; time: number; count: number }[] = [];

    for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekActivities = activities.filter(a => {
            const date = new Date(a.start_date);
            return date >= weekStart && date < weekEnd;
        });

        weeklyData.push({
            week: weekStart.toISOString().split('T')[0],
            distance: weekActivities.reduce((sum, a) => sum + a.distance, 0) / 1000,
            time: weekActivities.reduce((sum, a) => sum + a.moving_time, 0) / 60,
            count: weekActivities.length,
        });
    }

    // --- MONTHLY BREAKDOWN (last 6 months) ---
    const monthlyData: { month: string; distance: number; time: number; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthActivities = activities.filter(a => {
            const date = new Date(a.start_date);
            return date >= monthStart && date <= monthEnd;
        });

        monthlyData.push({
            month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
            distance: monthActivities.reduce((sum, a) => sum + a.distance, 0) / 1000,
            time: monthActivities.reduce((sum, a) => sum + a.moving_time, 0) / 60,
            count: monthActivities.length,
        });
    }

    // --- CONSISTENCY SCORE ---
    const firstActivity = sortedActivities[0];
    const firstDate = new Date(firstActivity.start_date);
    const totalWeeks = Math.ceil((now.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const activeWeeksSet = new Set<string>();
    activities.forEach(a => {
        const date = new Date(a.start_date);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        activeWeeksSet.add(weekStart.toISOString().split('T')[0]);
    });

    const consistencyScore = totalWeeks > 0 ? Math.round((activeWeeksSet.size / totalWeeks) * 100) : 0;

    // --- STREAK TRACKING ---
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastWeek = '';

    const sortedWeeks = Array.from(activeWeeksSet).sort();
    sortedWeeks.forEach((week, i) => {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevWeek = new Date(sortedWeeks[i - 1]);
            const currWeek = new Date(week);
            const diff = (currWeek.getTime() - prevWeek.getTime()) / (7 * 24 * 60 * 60 * 1000);

            if (diff <= 1.1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        lastWeek = week;
    });

    // Check if current week is active
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    if (activeWeeksSet.has(currentWeekStart.toISOString().split('T')[0])) {
        currentStreak = tempStreak;
    } else {
        // Check last week
        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        if (lastWeek === lastWeekStart.toISOString().split('T')[0]) {
            currentStreak = tempStreak;
        }
    }

    // --- DAILY STREAK TRACKING ---
    const uniqueDates = Array.from(new Set(activities.map(a => a.start_date.split('T')[0]))).sort();
    let currentDailyStreak = 0;
    let longestDailyStreak = 0;
    let tempDailyStreak = 0;
    let lastDateStr = '';

    uniqueDates.forEach((dateStr, i) => {
        if (i === 0) {
            tempDailyStreak = 1;
        } else {
            const prevDate = new Date(lastDateStr);
            const currDate = new Date(dateStr);
            const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempDailyStreak++;
            } else {
                tempDailyStreak = 1;
            }
        }
        longestDailyStreak = Math.max(longestDailyStreak, tempDailyStreak);
        lastDateStr = dateStr;
    });

    // Check if current daily streak is active
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDates.includes(todayStr)) {
        currentDailyStreak = tempDailyStreak;
    } else if (uniqueDates.includes(yesterdayStr) && lastDateStr === yesterdayStr) {
        currentDailyStreak = tempDailyStreak;
    } else {
        currentDailyStreak = 0;
    }


    // --- DAY OF WEEK ANALYSIS ---
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeekData = dayNames.map((name, i) => {
        const dayActivities = activities.filter(a => new Date(a.start_date).getDay() === i);
        const avgPaceForDay = dayActivities.length > 0
            ? (dayActivities.reduce((sum, a) => sum + a.moving_time, 0) / 60) /
            (dayActivities.reduce((sum, a) => sum + a.distance, 0) / 1000)
            : 0;
        return {
            day: name,
            count: dayActivities.length,
            avgPace: avgPaceForDay || 0,
            totalDistance: dayActivities.reduce((sum, a) => sum + a.distance, 0) / 1000,
        };
    });

    // --- HOUR OF DAY ANALYSIS ---
    const hourOfDayData = Array.from({ length: 24 }, (_, hour) => {
        const hourActivities = activities.filter(a => new Date(a.start_date).getHours() === hour);
        return {
            hour,
            count: hourActivities.length,
            avgPace: hourActivities.length > 0
                ? (hourActivities.reduce((sum, a) => sum + a.moving_time, 0) / 60) /
                (hourActivities.reduce((sum, a) => sum + a.distance, 0) / 1000)
                : 0,
        };
    });

    // --- PACE ZONES ---
    const paceHistogramData = activities.map(a => {
        const pace = a.distance > 0 ? (a.moving_time / 60) / (a.distance / 1000) : 0;
        return pace;
    }).filter(p => p > 0 && p < 15); // Filter out unreasonable paces

    const paceZones = [
        { zone: '<4:00', min: 0, max: 4, count: 0 },
        { zone: '4:00-5:00', min: 4, max: 5, count: 0 },
        { zone: '5:00-6:00', min: 5, max: 6, count: 0 },
        { zone: '6:00-7:00', min: 6, max: 7, count: 0 },
        { zone: '7:00-8:00', min: 7, max: 8, count: 0 },
        { zone: '>8:00', min: 8, max: 99, count: 0 },
    ];

    paceHistogramData.forEach(pace => {
        for (const zone of paceZones) {
            if (pace >= zone.min && pace < zone.max) {
                zone.count++;
                break;
            }
        }
    });

    // --- PERSONAL RECORDS ---
    const fastestPaceActivity = activities.reduce((fastest, a) => {
        const pace = a.distance > 0 ? (a.moving_time / 60) / (a.distance / 1000) : 999;
        const fastestPace = fastest && fastest.distance > 0
            ? (fastest.moving_time / 60) / (fastest.distance / 1000)
            : 999;
        return pace < fastestPace ? a : fastest;
    }, activities[0]);

    const longestRun = activities.reduce((longest, a) =>
        a.distance > (longest?.distance || 0) ? a : longest, activities[0]);

    const longestTime = activities.reduce((longest, a) =>
        a.moving_time > (longest?.moving_time || 0) ? a : longest, activities[0]);

    // --- RECENT ACTIVITIES (last 10) ---
    const recentActivities = [...activities]
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        .slice(0, 10)
        .map(a => ({
            id: a.id,
            type: a.type,
            distance: a.distance / 1000,
            time: a.moving_time / 60,
            pace: a.distance > 0 ? (a.moving_time / 60) / (a.distance / 1000) : 0,
            date: a.start_date,
        }));

    // --- ACTIVITY CALENDAR (last 365 days) ---
    const calendarData: { date: string; distance: number; count: number }[] = [];
    for (let i = 364; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];

        const dayActivities = activities.filter(a => {
            const actDate = new Date(a.start_date);
            return actDate.toISOString().split('T')[0] === dateStr;
        });

        calendarData.push({
            date: dateStr,
            distance: dayActivities.reduce((sum, a) => sum + a.distance, 0) / 1000,
            count: dayActivities.length,
        });
    }

    return NextResponse.json({
        lifetime: {
            distance: totalDistance / 1000, // km
            time: totalTime / 60, // minutes
            activities: activities.length,
            avgPace, // min/km
            elevation: totalElevation, // meters
            calories: totalCalories,
        },
        physiology: {
            avgHeartRate,
            maxHeartRate: maxHeartRate > 0 ? maxHeartRate : null,
        },
        speed: {
            maxSpeed: maxSpeed * 3.6, // convert m/s to km/h
        },
        analytics: {
            paceTrend: paceTrend ? {
                slope: paceTrend.slope,
                rSquared: paceTrend.rSquared,
                description: paceTrend.slope > 0 ? 'Slowing down' : 'Getting faster'
            } : null,
            hrPaceCorrelation: hrCorrelation,
            predictions
        },
        weekly: weeklyData,
        monthly: monthlyData,
        consistency: {
            score: consistencyScore,
            activeWeeks: activeWeeksSet.size,
            totalWeeks,
        },
        streaks: {
            current: currentStreak,
            longest: longestStreak,
        },
        dailyStrk: {
            current: currentDailyStreak,
            longest: longestDailyStreak,
        },
        dayOfWeek: dayOfWeekData,
        hourOfDay: hourOfDayData,
        paceZones: paceZones.map(z => ({ zone: z.zone, count: z.count })),
        recentActivities,
        calendar: calendarData,
        personalRecords: {
            fastestPace: fastestPaceActivity ? {
                pace: (fastestPaceActivity.moving_time / 60) / (fastestPaceActivity.distance / 1000),
                date: fastestPaceActivity.start_date,
                distance: fastestPaceActivity.distance / 1000,
            } : null,
            longestRun: longestRun ? {
                distance: longestRun.distance / 1000,
                date: longestRun.start_date,
                time: longestRun.moving_time / 60,
            } : null,
            longestTime: longestTime ? {
                time: longestTime.moving_time / 60,
                date: longestTime.start_date,
                distance: longestTime.distance / 1000,
            } : null,
        },
    });
}
