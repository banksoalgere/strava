
import * as ss from 'simple-statistics';

export interface ActivityPoint {
    date: Date;
    value: number;
}

export function calculateLinearRegression(data: ActivityPoint[]) {
    if (data.length < 2) return null;

    // Convert dates to timestamps for regression
    const points = data.map(d => [d.date.getTime(), d.value]);
    const regression = ss.linearRegression(points);
    const line = ss.linearRegressionLine(regression);
    const rSquared = ss.rSquared(points, line);

    return {
        slope: regression.m,
        intercept: regression.b,
        rSquared,
        predict: (date: Date) => line(date.getTime())
    };
}

export function calculateCorrelation(x: number[], y: number[]) {
    if (x.length !== y.length || x.length < 2) return 0;
    return ss.sampleCorrelation(x, y);
}

export function calculateMovingAverage(data: number[], window: number = 7) {
    if (data.length < window) return [];

    // Simple moving average
    const result = [];
    for (let i = 0; i <= data.length - window; i++) {
        const slice = data.slice(i, i + window);
        const avg = ss.mean(slice);
        result.push(avg);
    }
    return result;
}

// Riegel's formula: T2 = T1 * (D2 / D1)^1.06
export function predictRaceTime(
    recentDistKm: number,
    recentTimeMin: number,
    targetDistKm: number
): number {
    return recentTimeMin * Math.pow((targetDistKm / recentDistKm), 1.06);
}

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = Math.round((minutes * 60) % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}
