// Shared types for the application

// Goal types
export interface Goal {
    id: string;
    type: string;
    target: number;
    penalty: number;
    progress: number;
    status: 'active' | 'inactive';
}

// Dashboard stat props
export interface DashboardStatProps {
    title: string;
    value: string;
    unit?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    isActionable?: boolean;
}

// Activity types
export interface Activity {
    id: string;
    strava_id: number;
    user_id: string;
    goal_id: string | null;
    type: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number;
    average_speed: number;
    max_speed: number;
    average_heartrate?: number;
    max_heartrate?: number;
    calories?: number;
    start_date: string;
    created_at: string;
}

// User types
export interface User {
    id: string;
    email: string | null;
    name?: string | null;
    image?: string | null;
    strava_id?: number | null;
    stripe_customer_id?: string | null;
    payment_method_id?: string | null;
}

// Dashboard data
export interface DashboardData {
    user: {
        id: string;
        email: string | null;
    };
    stats: {
        totalDistance: number;
        activeGoals: number;
        onTrackGoals: number;
        hasPaymentMethod: boolean;
    };
    goals: Goal[];
}

// Stats page types
export interface LifetimeStats {
    distance: number;
    time: number;
    elevation: number;
    calories: number;
    activities: number;
    avgPace: number;
}

export interface PhysiologyStats {
    avgHeartRate: number | null;
    maxHeartRate: number | null;
}

export interface WeeklyData {
    week: string;
    distance: number;
}

export interface MonthlyData {
    month: string;
    distance: number;
}

export interface ConsistencyData {
    score: number;
    activeWeeks: number;
    totalWeeks: number;
}

export interface StreakData {
    current: number;
    longest: number;
}

export interface DayOfWeekData {
    day: string;
    count: number;
}

export interface HourOfDayData {
    hour: number;
    count: number;
}

export interface PaceZoneData {
    zone: string;
    count: number;
}

export interface CalendarData {
    date: string;
    distance: number;
}

export interface PersonalRecords {
    fastestPace: { pace: number; distance: number; date: string } | null;
    longestRun: { distance: number; time: number; date: string } | null;
    longestTime: { distance: number; time: number; date: string } | null;
}

export interface AnalyticsStats {
    paceTrend: { slope: number; rSquared: number; description: string } | null;
    hrPaceCorrelation: number | null;
    predictions: { p5k: number; p10k: number; pHalf: number; pMarathon: number } | null;
}
